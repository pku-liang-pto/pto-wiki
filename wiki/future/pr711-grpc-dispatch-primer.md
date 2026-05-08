---
title: "PR 711 Remote Dispatch and Data Plane Primer"
type: future
status: draft
sources:
  - https://github.com/hw-native-sys/simpler/pull/711
  - https://grpc.io/docs/what-is-grpc/introduction/
  - https://grpc.io/docs/languages/python/basics/
  - https://protobuf.dev/overview/
  - https://docs.nvidia.com/networking/display/RDMAAwareProgrammingv17/Key+Concepts
  - https://docs.redhat.com/documentation/pt/red_hat_enterprise_linux/7/html/networking_guide/sec-configuring_soft-_roce
  - ../evidence/future-runtime-dispatch-and-serving-roadmap.md
last_updated: 2026-05-08
---

# PR 711 Remote Dispatch and Data Plane Primer

本页帮助读者读懂 `simpler` PR [#711 Add Python distributed L4 to L3 dispatch](https://github.com/hw-native-sys/simpler/pull/711) 在 2026-05-08 新增后的形态。它不再只是 “gRPC dispatch primer”：PR #711 现在同时包含 L4 -> remote L3 control plane、callable catalog、TensorPool handle、gRPC chunk fallback、RXE/ibverbs data-plane MVP、HCOMM optional adapter、大 `OUTPUT / OUTPUT_EXISTING` writeback，以及与 UBL128 serving design 的边界说明。状态和证据见 [Future Runtime Dispatch and Serving Roadmap Evidence](../evidence/future-runtime-dispatch-and-serving-roadmap.md)。

## How To Read This Page

如果你第一次读 PR #711，按下面顺序读。先建立双平面直觉，再进入代码形状。

```text
current status boundary
  -> gRPC/protobuf control-plane basics
  -> L4 mailbox shim and RemoteWorkerProxy
  -> L3Daemon backend process
  -> TensorRef / TensorHandle schema
  -> TensorPool and transport backends
  -> RXE output writeback
  -> tests, limitations, serving boundary
```

状态边界先说清楚：PR #711 在 2026-05-08 仍是 `OPEN` / `REVIEW_REQUIRED`，当前 head 是 `2dd89eeaff9164166a6b4f36edce3c4621777b53`。本页因此使用 `emerging` 描述 PR branch 上已经出现并有测试覆盖的实现形状，而不是说它已经进入 `simpler/main`。其中 RXE 是 host-memory Soft-RoCE / ibverbs MVP，不等于 UBL128 设计里的 production SO / UB Urma / NPU HBM / SSU KV data plane。

## One Picture: Two Planes

PR #711 把 “发什么任务” 和 “大 tensor 字节怎么走” 分开。

```text
Control plane: small, typed, stateful

L4 Worker
  local PROCESS mailbox shim
    -> RemoteWorkerProxy
       -> gRPC L3Worker.Dispatch(DispatchReq)
       -> gRPC Catalog.PushCallable(...)
       -> gRPC TensorPool.Alloc/Refresh/Free(...)
       -> gRPC Heartbeat()
          |
          v
       L3Daemon gRPC server
          |
          v
       backend process with Worker(level=3)

Data plane: byte movement for tensors

small tensor
  DispatchReq.tensor_refs.inline_data

large input tensor
  L4 asks L3 TensorPool for handle
  L4 writes bytes by gRPC chunks, RXE RDMA write, or HCOMM adapter
  DispatchReq carries TensorRef(handle)

large output tensor
  L4 may register its local output buffer as RXE region
  L3 runs task into temporary local buffer
  L3 writes output bytes back to L4 RXE handle
  DispatchResp carries ACK-style TensorRef(handle)
```

这张图的关键是：gRPC 仍然是 control-plane 主路径。它负责 `DispatchReq`、catalog、heartbeat、TensorPool control RPC 和 fallback chunk transfer。RXE/HCOMM 是 data-plane backend，用来搬运大块 tensor bytes；它们不替代 dispatch protocol，也不让 local pointer 直接跨 host 使用。

## gRPC And Protobuf Basics

gRPC 是 RPC framework：client 像调用本地方法一样调用远端 service；网络连接、序列化、timeout、错误码和 server dispatch 由框架处理。gRPC 官方文档把 service/method 定义放在 `.proto` schema 里，Python 代码再由 `grpc_tools.protoc` 生成 client stub 和 server servicer skeleton。Protocol Buffers 提供 typed binary message schema，但它不是大 tensor 的理想容器；大数组通常需要单独的 data plane。[gRPC Introduction](https://grpc.io/docs/what-is-grpc/introduction/)、[gRPC Python Basics](https://grpc.io/docs/languages/python/basics/) 和 [Protocol Buffers Overview](https://protobuf.dev/overview/) 是这里的外部概念来源。

PR #711 的 schema 在 `python/simpler/distributed/proto/dispatch.proto`。最重要的是三个 service：

```protobuf
service L3Worker {
  rpc Dispatch(DispatchReq) returns (DispatchResp);
  rpc Heartbeat(Empty) returns (Health);
}

service Catalog {
  rpc PullCallable(CallableRef) returns (CallablePayload);
  rpc PushCallable(CallablePayload) returns (Empty);
}

service TensorPool {
  rpc AllocTensor(TensorAllocReq) returns (TensorHandle);
  rpc FreeTensor(TensorFreeReq) returns (Empty);
  rpc RefreshTensor(TensorRefreshReq) returns (TensorHandle);
  rpc PullTensor(TensorHandle) returns (stream TensorChunk);
  rpc PushTensor(stream TensorChunk) returns (TensorHandle);
}
```

`L3Worker` 是 task dispatch 和 heartbeat。`Catalog` 是 callable 分发：remote host 不能继承 L4 进程里的 Python function object，所以 L4 必须把 callable payload 推给 L3。`TensorPool` 是大 tensor 的 handle 管理和 fallback streaming interface。

## Wire Schema: TensorRef And TensorHandle

PR #711 的新核心不是把 tensor bytes 塞进 `DispatchReq`，而是把 tensor 表达成 `TensorRef`。小 tensor 可以 inline，大 tensor 使用 handle。

```protobuf
message TensorHandle {
  string node_id = 1;
  uint64 handle_id = 2;
  uint64 remote_addr = 3;
  uint32 rkey = 4;
  uint64 nbytes = 5;
  uint64 lease_deadline_unix_ms = 6;
  string transport = 7;
  bytes transport_desc = 8;
}

message TensorRef {
  oneof source {
    bytes inline_data = 1;
    TensorHandle handle = 2;
  }
  repeated int64 shape = 10;
  int32 dtype = 11;
  int32 tag = 12;
}
```

这个 schema 同时表达三类事实。

第一，`shape`、`dtype` 和 `tag` 是 runtime 语义。L3 要重建 `ContinuousTensor`，必须知道 tensor 的维度、元素类型和方向 tag，例如 `INPUT`、`OUTPUT`、`INOUT`、`OUTPUT_EXISTING`。

第二，`handle_id` 和 `node_id` 是 ownership。L3 TensorPool handle 属于 L3 backend pool；L4 local output RXE handle 属于 `node_id="l4-rxe-..."`。这个区别让 L4 能判断 `DispatchResp.output_tensors` 是 “需要 PullTensor 的 L3 handle”，还是 “已经写回我本地 output buffer 的 ACK”。

第三，`remote_addr`、`rkey`、`transport` 和 `transport_desc` 是 data-plane metadata。`grpc` backend 主要靠 `PushTensor/PullTensor` 分片；`rxe` backend 需要 RDMA write 的地址、remote key 和 RXE helper descriptor；`hcomm` backend 需要可导入的 HCOMM memory descriptor。

## L4 Side: Mailbox Shim And RemoteWorkerProxy

L4 侧 public API 是 `Worker.add_remote_worker(endpoint, ...)`。它把一个远端 L3 endpoint 注册成当前 L4 worker 的 next-level worker。为了复用已有 C++ scheduler，PR #711 没有让 scheduler 直接懂 gRPC；它给 remote worker 配一个 local `PROCESS` mailbox，再启动 Python shim thread 读写这个 mailbox。

```text
Worker(level=4)
  add_remote_worker("127.0.0.1:5050", tensor_transport="rxe")
  init()
    -> create local mailbox for a remote child
    -> RemoteWorkerProxy.handshake()
    -> start _remote_worker_loop thread

existing C++ scheduler
  writes TASK_READY into local mailbox

Python shim thread
  reads callable id, TaskArgs, CallConfig
  calls RemoteWorkerProxy.dispatch(...)
  writes TASK_DONE or error back into mailbox
```

`RemoteWorkerProxy.dispatch()` 的 implementation shape 可以压缩成：

```python
tensor_args, scalar_args = encode_task_args(args)
tensor_refs, remote_handles, local_output_regions = self._stage_tensor_args(args)

req = DispatchReq(
    task_id=next(self._task_ids),
    callable_id=callable_id,
    callable_version=version,
    config_blob=encode_config(config),
    scalar_args=scalar_args,
    tensor_args=[] if tensor_refs else tensor_args,
    tensor_refs=tensor_refs,
)

resp = self._client.dispatch(req, self._timeout)
self._write_output_tensors(args, resp.output_tensors)
```

注意这里保留了 `tensor_args` 旧路径：如果没有 `tensor_refs`，旧的 `ContinuousTensorRef(data=local_pointer, ...)` 仍可用于同进程/兼容路径。但跨 host 的可靠路径应该看 `tensor_refs`，因为 raw local virtual address 不能跨机器使用。

## Input Tensor Staging

`RemoteWorkerProxy._stage_tensor_args()` 决定每个 tensor 如何进入 remote dispatch。

```text
for each TaskArgs tensor:
  if large OUTPUT / OUTPUT_EXISTING and transport is rxe/auto:
      register L4 local output buffer as RXE region
      send TensorRef(handle=node_id l4-rxe-...)
      remember local output region for cleanup
  else:
      copy bytes from local tensor pointer
      if nbytes <= 4KB:
          send TensorRef(inline_data=bytes)
      else:
          AllocTensor on L3 TensorPool
          push bytes by rxe / hcomm / grpc
          send TensorRef(handle=L3 handle)
```

这段代码解释了一个容易误读的点：`OUTPUT_EXISTING` 在 RXE output fast path 中不会把旧值先发到 L3。它的语义是 “给 L3 一个写回位置”。如果任务需要远端先读旧值再更新，应该使用 `INOUT`；`INOUT` 当前走 input staging + response writeback 路径，还没有做单 handle 双向 RXE fast path。

## L3 Side: Daemon And Backend Process

`L3Daemon` 是 gRPC server，但真正执行任务的 `Worker(level=3)` 不在 gRPC server thread 里直接运行。PR #711 启动 daemon 时先 fork 一个 backend process，然后 daemon 通过 `multiprocessing.Pipe` 把 `dispatch`、`tensor_alloc`、`tensor_push`、`catalog push` 等操作转给 backend。

```text
L3Daemon process
  RpcServer
  L3Worker.Dispatch handler
  Catalog service facade
  TensorPool service facade
  Pipe parent end
      |
      v
backend process
  Catalog
  TensorPool
  transport backend: grpc / rxe / hcomm / auto
  Worker(level=3)
```

这样做有两个原因。第一，`grpcio` server 自己有线程；直接在 gRPC server 进程里继续 fork `Worker(level=3)` 的 sub/chip workers 风险更高。第二，TensorPool 里的 bytearray buffer、mmap buffer 和 L3 task execution 必须处在同一个 backend address space，L3 才能把 handle materialize 成本进程可读写的 `ContinuousTensor`。

`_backend_dispatch()` 有两条运行模式：

```text
DispatchReq without tensor_refs
  decode old ContinuousTensorRef
  reuse persistent inner Worker(level=3)

DispatchReq with tensor_refs
  materialize each TensorRef into mmap-backed local buffer
  create ephemeral Worker(level=3)
  install callable catalog
  run task
  encode output TensorRefs
  close ephemeral Worker
```

临时 `Worker(level=3)` 的原因是：tensor payload 先在 backend process 里 materialize 成 mmap buffer，再让 L3 sub/chip child worker fork 后继承这段 mapping。这个路径是 MVP 取舍，也意味着当前 dispatch 不是高并发 production scheduler。

## TensorPool: Handle To Bytes Bridge

`TensorPool` 是 PR #711 中 control plane 和 data plane 的桥。它当前是 Python byte pool，不是 UBL128 里的 SSU KV store。默认 capacity 是 64 MiB，inline threshold 是 4 KiB，默认 lease TTL 是 60 秒。

```python
data = bytearray(nbytes)
region = self.transport_backend.register_region(data, tag=f"{node}:{handle}:{tag}")

entry = _Entry(
    data=data,
    nbytes=nbytes,
    expires_at_ms=now + ttl,
    shape=shape,
    dtype=dtype,
    tag=tag,
    region=region,
)

return TensorHandle(
    node_id=self.node_id,
    handle_id=handle_id,
    remote_addr=region.remote_addr,
    rkey=region.rkey,
    nbytes=nbytes,
    transport=region.transport,
    transport_desc=region.transport_desc,
)
```

`AllocTensor` 分配 bytearray 并注册 region。`PushTensor` / `PullTensor` 是 gRPC chunk fallback。`RefreshTensor` 不是只续租：对 RXE backend，它会调用 `refresh_region()`，关闭旧的一次性 RXE server，再在同一个 buffer 上重建 server，让同一个 handle 后续还能被再次写入。`FreeTensor` 和 GC 负责释放 handle 并 unregister region。

## Transport Backends

`transport_backend.py` 定义 `TensorTransportBackend` 边界。这个边界的职责很窄：让 TensorPool 注册一段本地 byte buffer，并返回 peer 能理解的 `RegisteredRegion`。

```text
GrpcTensorTransport
  register_region -> local addr only
  actual bytes go through PushTensor/PullTensor chunks

RxeTensorTransport
  register_region -> RXE server_start(bytearray addr, size)
  TensorHandle.transport = "rxe"
  TensorHandle.transport_desc = binary RXE descriptor

HcommTensorTransport
  register_region -> HcommMemReg + HcommMemExport
  TensorHandle.transport = "hcomm"
  TensorHandle.transport_desc = HCOMM exported memory descriptor

auto
  RXE only if SIMPLER_RXE_AUTO=1 and available
  then HCOMM if available
  otherwise gRPC fallback
```

显式 `tensor_transport="rxe"` 或 `"hcomm"` 是 fail-fast：backend 不可用就报错。`auto` 更保守，默认不会自动启用 RXE，除非设置 `SIMPLER_RXE_AUTO=1`；这避免机器上偶然存在 RXE device 时改变数据路径。

## RXE Mental Model

`RXE` 是 Linux Soft-RoCE。`RoCE` 的意思是 RDMA over Converged Ethernet；`Soft-RoCE` 是软件实现的 RDMA transport，Red Hat 文档把它描述成软件 RDMA transport，内核里对应 `rdma_rxe`/RXE 设备配置路径。PR #711 用 RXE 做单机/实验性真实 ibverbs data-plane smoke，不等于生产硬件 RoCE 性能路径。

RDMA verbs 的基本对象可以这样记：

```text
MR: Memory Region
  local process registers a memory range
  peer needs remote address + rkey to access it

QP: Queue Pair
  send queue + receive queue
  application posts work requests to QP

CQ: Completion Queue
  completed work requests show up here

RDMA write
  writer NIC/verbs writes local bytes into peer registered memory
  peer CPU does not receive a normal TCP byte stream
```

NVIDIA RDMA key concepts 文档也用 MR、rkey、QP、CQ 来解释 verbs programming model。PR #711 的 `rxe_verbs_helper.c` 走的是 RC QP + TCP control connection + one RDMA write server：

```text
L3 TensorPool alloc large buffer
  bytearray -> address
  RxeRuntime.server_start(addr, size)
    -> C helper opens RXE device
    -> creates PD / CQ / QP
    -> registers MR
    -> starts TCP control server
    -> returns addr, rkey, port, ip, size

L4 pushes input or L3 writes output
  RxeDataPlaneClient.write_handle(handle, local_addr, nbytes)
    -> decode transport_desc
    -> simpler_rxe_write(...)
    -> TCP control exchange
    -> RC QP RDMA write
    -> wait CQ completion
```

这是功能 MVP，不是性能最终形态。每个 region/write 仍有 TCP control、QP 创建、MR 注册或 helper setup 成本；小 tensor 可能比 gRPC chunk 慢。后续如果要接 production path，需要连接池、QP reuse、稳定 descriptor schema、并发压测、跨节点 RoCE 验证和错误观测。

## Output Writeback

PR #711 新 commits 解决了旧 example 暗示 “remote closure mutates L4-local Python object” 的问题。远端 callable 是通过 catalog 序列化到 L3 daemon 的，closure 里的 Python object 会变成 L3 backend/sub-worker 的副本；直接修改 closure 不会改到 L4 进程里的原对象。

新的 example 使用 `OUTPUT_EXISTING` tensor 返回结果：

```python
result = ctypes.c_int64(0)

def l3_sub(task_args):
    output = task_args.tensor(1)
    current = ctypes.c_int64.from_address(int(output.data))
    current.value += int(task_args.scalar(0))

sub_args.add_tensor(
    ContinuousTensor.make(ctypes.addressof(result), (1,), DataType.INT64),
    TensorArgType.OUTPUT_EXISTING,
)
```

完整 writeback 路径如下：

```text
L4 sees large OUTPUT / OUTPUT_EXISTING with RXE transport
  register L4 local output buffer as RXE region
  DispatchReq carries TensorRef(handle=node_id l4-rxe-...)

L3 decodes TensorRef
  detects remote output handle
  creates temporary mmap buffer for local computation
  records RemoteTensorWriteback(tensor_index, L4 handle)

L3 task writes into temporary buffer

encode_output_tensor_refs(...)
  tries RxeDataPlaneClient.write_handle(L4 handle, temp bytes)
  if success: return ACK TensorRef(handle=L4 handle)
  if fail: fallback to L3 TensorPool/inline response

L4 receives DispatchResp.output_tensors
  if ACK belongs to local output handle: skip PullTensor
  otherwise: read inline or PullTensor and memmove into local output buffer
```

当前 RXE local output fast path 覆盖 `OUTPUT` 和 `OUTPUT_EXISTING`。`INOUT` 仍走 input staging，因为它需要先把初始值送到 L3，再把修改后的值带回 L4；双向 RXE fast path 还没有完成。

## HCOMM Boundary

PR #711 也加入了 HCOMM adapter，但它是 optional / partial。`hcomm_abi_shim.cc`、`HcommRuntime`、`HcommTensorTransport` 和 `HcommDataPlaneClient` 都在 `simpler` 侧，不修改 `3rd/hcomm`。它尝试加载 `libhcomm.so`、预加载 CANN/HCOMM sidecar libraries、注册/导出 memory、创建 endpoint/channel，并通过 `write_with_notify` 写远端 memory。

本页对 HCOMM 的状态判断是：有 adapter 入口和 smoke tests，但主实机 data-plane 验证仍以 RXE/ibverbs MVP 为主。不要把这段代码读成完整 HCOMM CPU RoCE production channel，也不要把它和 UBL128 SO / UB Urma target 混为一谈。

## Tests And Proof Boundary

PR #711 的测试覆盖比 2026-05-07 的 gRPC-only snapshot 更宽。按证明对象分成几组：

```text
unit/control
  test_catalog.py
  test_heartbeat.py
  test_rpc_roundtrip.py

remote dispatch semantics
  test_l4_l3_remote.py
    scalar remote dispatch
    inline tensor input
    large handle tensor input
    inline and handle output writeback
    INOUT response writeback
    L3 sub-worker output writeback

TensorPool and serialization
  test_tensor_pool.py
    alloc/free/refresh
    inline vs handle refs
    service PullTensor/PushTensor
    output ref encoding

transport metadata
  test_transport_backend.py
    RXE binary descriptor v2 roundtrip
    legacy JSON descriptor compatibility
    HCOMM runtime/import smoke where available

real-machine smoke
  test_real_e2e_smoke.py
    real L4/L3 TensorPool handle E2E
    RXE ibverbs smoke
    L4/L3 RXE tensor transport E2E

tools
  tools/test_rxe_data_plane.sh
  tools/benchmark_rxe_data_plane.py
```

这些测试能证明 PR branch 上已经有 host-memory remote tensor prototype、RXE write path 和 output writeback shape。它们还不能证明 production serving：没有外部 serving frontend、prefill/decode scheduler、KV Meta Server、SSU LBA allocation、NPU HBM KV lifecycle、SO uRPC hot path、multi-node RoCE soak 或 high-concurrency scheduler validation。

## Serving Boundary

PR #711 的 L4/L3 名字容易和 UBL128 serving design 混淆。这里要严格区分：

```text
PR #711 L4
  simpler runtime level-4 worker
  owns orchestration and remote next-level dispatch
  not an HTTP/gRPC serving frontend

PR #711 L3
  L3Daemon + backend Worker(level=3)
  runs serialized callable and TaskArgs
  not prefill/decode service role by itself

UBL128 serving F/M/PC/PN/DC/DN/S
  target serving architecture
  includes frontend, KV meta, prefill/decode hosts and NPUs, SSU storage
  not implemented by PR #711
```

因此可以把 PR #711 看成 serving target 的 runtime foundation：它提供 “runtime 能否把 callable 和 tensor refs 发到远端执行” 的原型。它不提供完整 serving stack，也不实现 UBL128 的 prefix cache、KV store、SU/SO/DCN traffic isolation 或 uRPC over UB Urma production path。更大的路线见 [Runtime Dispatch and Serving Roadmap](./runtime-dispatch-and-serving-roadmap.md)。

## What To Remember

读完本页要记住五点。

第一，PR #711 当前核心是 L4 -> remote L3 control plane 加 host-memory tensor data-plane prototype。gRPC 负责 control plane；TensorPool handle 负责把大 tensor 从 protobuf message 里拿出来。

第二，跨 host 不能传 raw local pointer。旧 `ContinuousTensorRef.data` 只适合同进程/兼容语义；跨 host 应该用 `TensorRef(handle)`、catalog callable id 和 transport metadata。

第三，RXE 是真实 ibverbs data-plane MVP，但还是 Soft-RoCE / one-write helper / smoke-test path。它证明架构可通，不证明 production 性能。

第四，output result 应该通过 output tensor writeback 或 response tensor 返回，不应该依赖 remote closure 修改 L4-local Python object。

第五，PR #711 仍是 open PR。Wiki 可以用它作为 Future learning material，但进入 implemented pages 需要等 PR merge、固定 merge commit，并重新核对 tests/examples/source shape。
