---
title: "PR 711 gRPC Dispatch Primer"
type: future
status: draft
sources:
  - https://github.com/hw-native-sys/simpler/pull/711
  - https://grpc.io/docs/what-is-grpc/introduction/
  - https://grpc.io/docs/languages/python/basics/
  - https://protobuf.dev/overview/
  - ../evidence/future-runtime-dispatch-and-serving-roadmap.md
last_updated: 2026-05-07
---

# PR 711 gRPC Dispatch Primer

本页是为了读懂 `simpler` PR [#711 Add Python distributed L4 to L3 dispatch](https://github.com/hw-native-sys/simpler/pull/711) 准备的入门材料。它先用直觉解释 gRPC、Protocol Buffers、stub、servicer、channel、RPC server，再把这些概念逐个映射到 PR #711 的 `dispatch.proto`、`rpc.py`、`RemoteWorkerProxy`、`L3Daemon` 和 `Worker.add_remote_worker()`。

## How To Read This Page

如果你完全不熟 gRPC，按顺序读。如果你已经知道 gRPC，可以直接跳到 `PR #711 的代码地图`。

```text
gRPC mental model
  -> Protocol Buffers schema
  -> generated Python code
  -> PR #711 services
  -> L4 proxy and mailbox shim
  -> L3 daemon and backend process
  -> current proof boundary
```

状态边界先说清楚：PR #711 在 2026-05-07 仍是 `OPEN` / `REVIEW_REQUIRED`，所以本页讲的是 `emerging` implementation shape，不是 `simpler/main` 已实现能力。PR body 也明确说当前 e2e 覆盖 scalar `TaskArgs` 和 callable execution，完整 remote tensor materialization / output write-back 仍是 future work；证据见 [Future Runtime Dispatch and Serving Roadmap Evidence](../evidence/future-runtime-dispatch-and-serving-roadmap.md#github-pr)。

## One Picture

PR #711 想把原来 “L4 fork 本地 L3 child process” 的路径，改成 “L4 把任务通过 gRPC 发给远端 L3 daemon”。它不直接重写 C++ scheduler，而是在 L4 本机放一个 mailbox shim，让 C++ scheduler 仍然以为自己在调一个普通 PROCESS worker。

```text
L4 process                                      Remote L3 process
==========                                      =================

Worker(level=4)
  orch.submit_next_level(...)
        |
        v
local C++ scheduler
        |
        | writes TASK_READY into local mailbox
        v
Python _remote_worker_loop
        |
        | reads callable id / TaskArgs / CallConfig
        v
RemoteWorkerProxy
        |
        | gRPC L3Worker.Dispatch(DispatchReq)
        v
                                             L3Daemon gRPC server
                                                |
                                                | pipe to backend
                                                v
                                             backend process
                                                |
                                                | lazy Worker(level=3).run(...)
                                                v
                                             local L3 runtime
```

读这张图时抓住两个分界：

- L4 本机的 C++ scheduler 和 mailbox 仍是 current `simpler` local runtime 语义。
- 跨进程/跨 Host 的新边界只从 `RemoteWorkerProxy` 到 `L3Daemon`，这段用 gRPC/protobuf 做 control plane。

## gRPC 是什么

gRPC 是一种 RPC framework。RPC 的直觉是：client 像调用本地函数一样调用远端 server 的方法；真正的网络连接、序列化、超时、错误码、server dispatch 由框架处理。gRPC 官方介绍把服务定义放在 `.proto` 文件里：先定义 service，说明可以远程调用哪些 method；再定义 request/response message，说明每个 method 收什么、回什么。[gRPC Introduction](https://grpc.io/docs/what-is-grpc/introduction/) 和 [Python Basics tutorial](https://grpc.io/docs/languages/python/basics/) 都按这个顺序解释。

一个普通 unary RPC 可以这样想：

```text
client code
  req = DispatchReq(...)
  resp = stub.Dispatch(req, timeout=...)

network
  req bytes go to server
  resp bytes come back

server code
  def Dispatch(self, request, context):
      return DispatchResp(...)
```

`unary` 的意思是 “一次 request，返回一次 response”。PR #711 的 `L3Worker.Dispatch` 和 `L3Worker.Heartbeat` 都是 unary RPC。`TensorPool.PullTensor` / `PushTensor` 是 streaming RPC：一个方向可以连续传多段 `TensorChunk`，但 PR #711 当前端到端 remote dispatch 还没有完成真实 tensor data-plane。

## Protocol Buffers 是什么

Protocol Buffers 解决 “网络两端怎样同意消息结构” 这个问题。它不是 Python dict，也不是 JSON；它是一个 schema-first 的 typed binary serialization mechanism。你在 `.proto` 文件里写 message 和 service，`protoc` 再生成语言绑定。Protobuf 官方文档强调它是 language-neutral、platform-neutral，并且适合 typed structured data；但它也提醒大数据、科学数组、大型 tensor 不适合直接塞进 protobuf message，因为会带来额外拷贝和内存压力。[Protocol Buffers Overview](https://protobuf.dev/overview/)。

PR #711 的关键 schema 在 `python/simpler/distributed/proto/dispatch.proto`：

```protobuf
service L3Worker {
  rpc Dispatch(DispatchReq) returns (DispatchResp);
  rpc Heartbeat(Empty) returns (Health);
}

message DispatchReq {
  uint64 task_id = 1;
  uint64 callable_id = 2;
  uint64 callable_version = 3;
  bytes config_blob = 4;
  repeated uint64 scalar_args = 5;
  repeated ContinuousTensorRef tensor_args = 6;
  repeated TensorRef tensor_refs = 7;
}
```

这段定义的意思是：`L3Worker` server 暴露 `Dispatch` 和 `Heartbeat` 两个远端方法；`Dispatch` 的输入是 `DispatchReq`，输出是 `DispatchResp`。`DispatchReq` 不是直接放 Python function，也不是直接放 tensor bytes，而是放 task id、callable id/version、配置 blob、scalar args、tensor metadata 和 future tensor refs。

字段后面的 `= 1`、`= 2` 不是默认值，而是 wire format 的 field number。它们让 protobuf 在 bytes 中稳定识别字段。后续加字段时，只要不复用旧 field number，就能让旧代码忽略新字段，这就是 protobuf 常用于 RPC schema evolution 的原因之一。

## Generated Code: pb2 和 pb2_grpc

读 PR #711 时会看到两个 generated files：

- `dispatch_pb2.py`: protobuf message 类，例如 `DispatchReq`、`DispatchResp`、`Health`。
- `dispatch_pb2_grpc.py`: gRPC service 类，例如 `L3WorkerStub`、`L3WorkerServicer`、`add_L3WorkerServicer_to_server`。

gRPC Python tutorial 说明，`grpc_tools.protoc` 会从 `.proto` 生成 request/response message classes、client stub、server servicer interface 和把 servicer 注册到 server 的函数。[Python Basics tutorial](https://grpc.io/docs/languages/python/basics/)。

把名字翻译成 PR #711 的角色：

```text
L3WorkerStub
  client-side object
  RemoteWorkerProxy uses it through RpcClient

L3WorkerServicer
  server-side interface
  L3Daemon subclasses/implements it

add_L3WorkerServicer_to_server
  registration glue
  RpcServer.add_l3_worker calls it
```

所以看到 `dispatch_pb2_grpc.L3WorkerStub(channel)` 时，不要把它理解成 server。它是 client 端的 typed handle，负责把 `stub.Dispatch(req)` 变成网络请求。看到 `class L3Daemon(dispatch_pb2_grpc.L3WorkerServicer)` 时，才是在实现 server 收到 request 后要做什么。

## PR #711 的代码地图

PR #711 的 gRPC/control-plane implementation 可以按这条链读：

```text
dispatch.proto
  declares services/messages

dispatch_pb2.py / dispatch_pb2_grpc.py
  generated Python message classes and stubs

rpc.py
  wraps grpc.server and grpc.insecure_channel

remote_proxy.py
  L4-side client: heartbeat, PushCallable, Dispatch

l3_daemon.py
  L3-side server: receives Dispatch and runs backend Worker(level=3)

worker.py
  add_remote_worker + local mailbox shim thread

tests/ut/py/test_distributed/
  prove scalar dispatch, catalog, heartbeat, error propagation
```

`rpc.py` 是薄封装，不是新的 distributed runtime。它把常见 gRPC setup 收进两个类：

```python
server = RpcServer()
server.add_l3_worker(L3Daemon(...))
port = server.start(0)

client = RpcClient("127.0.0.1:5050")
resp = client.dispatch(DispatchReq(...), timeout=...)
```

PR #711 当前用 `grpc.insecure_channel` 和 `add_insecure_port`，表示没有 TLS/auth。这符合 MVP 目标，但不能当成 production security boundary。PR docs 也说明 callable payload 只能用于 trusted cluster internal，因为反序列化 callable 等价于执行 Python code。

## The Three Services

`dispatch.proto` 里有三个 service。它们不是同一个层次的东西：

### `L3Worker`

`L3Worker.Dispatch` 是主路径。L4 把一个 task 发给 L3，L3 尝试执行，然后回 `DispatchResp`。`L3Worker.Heartbeat` 是健康检查。`RemoteWorkerProxy` handshake 先调用 heartbeat，之后后台 heartbeat thread 周期检测远端是否还可用。

```text
RemoteWorkerProxy
  -> Heartbeat()
  -> Dispatch(DispatchReq)
```

### `Catalog`

`Catalog` 负责 callable 分发。Local fork 模型里，child process 能靠 fork-COW 继承父进程的 Python registry；remote host 不能继承。PR #711 于是把 callable 序列化成 payload，用 `PushCallable` 推到远端。每个 callable 有 `callable_id` 和 `callable_version`；version 是 payload 的 `blake2b` hash。

```text
L4 Catalog
  register(fn) -> cid/version/pickled payload
  PushCallable(payload) -> L3Daemon Catalog -> backend Catalog
```

这里的重点不是 hash 算法，而是 “远端不能 dereference 本地 function pointer”。远端必须先拥有可执行 callable payload，才能解释 `DispatchReq.callable_id`。

### `TensorPool`

`TensorPool` 是 future tensor data-plane 的表面。当前代码能 inline 小 bytes、为大 bytes 生成 handle，并提供 `PullTensor` / `PushTensor` streaming；但 PR body 和 docs 都说完整 tensor materialization / output write-back 未完成。因此读到 `TensorPool` 时，应该标为 `design-intended surface`，不能把它当作 production tensor transport。

## L4 Side: RemoteWorkerProxy 和 Mailbox Shim

L4 侧入口是 `Worker.add_remote_worker(endpoint, **options)`。它只能在 `level >= 4` 的 `Worker` 上、`Worker.init()` 前调用。初始化时，PR #711 为每个 remote worker 分配一块 local `SharedMemory` mailbox，创建 `RemoteWorkerProxy`，做 handshake，然后启动 `_remote_worker_loop` thread。

`_remote_worker_loop` 的作用是把 local mailbox protocol 转成 remote RPC：

```text
while running:
  if mailbox.state == TASK_READY:
      cid = mailbox.callable
      args = read TaskArgs from mailbox
      cfg = read CallConfig from mailbox
      proxy.dispatch(cid, args, cfg)
      mailbox.state = TASK_DONE
```

这就是 PR #711 的 compatibility trick。C++ scheduler 不知道远端 gRPC 的存在，它只看到一个 PROCESS-mode mailbox。Python shim thread 站在 mailbox 另一侧，把任务转发给 `RemoteWorkerProxy.dispatch()`。

`RemoteWorkerProxy.dispatch()` 做四件事：

1. 把 `TaskArgs` 拆成 `tensor_args` 和 `scalar_args`。
2. 把 `CallConfig` 编成 `config_blob`。
3. 从 catalog 查 `callable_id` 对应的 `callable_version`。
4. 构造 `DispatchReq`，调用 `RpcClient.dispatch()`。

如果 RPC 失败，proxy 会把 remote 标为 unavailable。若远端返回 `error_code != 0`，proxy 抛出带 `remote_traceback` 的 `RuntimeError`，shim 再把错误写回 mailbox，最后由现有 `Worker.run` drain/error path 抛回 L4 caller。

## L3 Side: L3Daemon 和 Backend Process

`L3Daemon` 是远端 server。它继承 `L3WorkerServicer`，所以它要实现 `Dispatch()` 和 `Heartbeat()`。启动时它还注册 `Catalog` service 和 `TensorPool` service。

最容易困惑的一点是：`L3Daemon` 不直接在 gRPC server thread 里运行 `Worker(level=3)`。它先 fork 一个 backend process，再通过 `multiprocessing.Pipe` 把 dispatch bytes 发给 backend。

```text
L3Daemon process
  gRPC server threads
  L3Worker.Dispatch handler
  CatalogService / TensorPoolService
  Pipe parent end

Backend process
  Pipe child end
  Catalog mirror
  lazy inner Worker(level=3)
  inner Worker forks its own sub/chip children
```

这样做的原因是 fork safety。`grpcio` server 会启动 worker threads；而 `simpler.Worker(level=3)` 仍然需要 fork sub worker / chip worker。PR docs 明确说，如果在已经启动 gRPC worker threads 的进程中 fork，可能触发 grpcio fork-safety 问题。因此 backend process 在 gRPC server start 前创建，真正的 inner `Worker(level=3)` 逻辑都在 backend process 内完成。

`Dispatch` 到达后的实际 sequence 是：

```text
gRPC handler receives DispatchReq
  -> serialize req bytes through Pipe
  -> backend parses DispatchReq
  -> lazy create Worker(level=3)
  -> install catalog callables into inner._callable_registry
  -> lookup callable_id / callable_version
  -> decode CallConfig and TaskArgs
  -> inner.run(orch_fn, args, cfg)
  -> return DispatchResp bytes
```

这个设计保留了当前 L3 runtime 的 local mechanics：remote L3 daemon 只负责接收 task；真正执行 task 的仍是 `Worker(level=3)`，它内部再管理 L2 chip workers 或 Python sub workers。

## Minimal Example: Why `remote counter=7`

PR #711 的 example 分两个进程跑。终端 1 启动 L3 daemon：

```bash
python examples/distributed/l4_l3_remote/l3_worker.py --port 5050
```

终端 2 启动 L4 master：

```bash
python examples/distributed/l4_l3_remote/l4_master.py --remotes 127.0.0.1:5050
```

`l4_master.py` 里的逻辑可以压缩成：

```python
w4 = Worker(level=4, num_sub_workers=0)

sub_cid = w4.register(l3_sub)
l3_cid = w4.register(l3_orch)
w4.add_remote_worker("127.0.0.1:5050")
w4.init()

def l4_orch(orch, task_args, config):
    for value in (2, 5):
        sub_args = TaskArgs()
        sub_args.add_scalar(value)
        orch.submit_next_level(l3_cid, sub_args, CallConfig())

w4.run(l4_orch)
```

这里的 `l4_orch` 在 L4 上运行，但它提交的 `l3_cid` 指向一个 L3 orchestration callable。因为 `w4.add_remote_worker()` 已经注册了 remote mailbox，`submit_next_level` 最终会被 shim 转成 `L3Worker.Dispatch`。远端 backend 找到 `l3_cid`，执行 `l3_orch`，`l3_orch` 再 `submit_sub(sub_cid, task_args)`，于是 `2` 和 `5` 都累加到 counter，输出 `remote counter=7`。

这个 example 证明的是 remote scalar dispatch path 可以穿过：L4 orchestration -> local mailbox -> gRPC -> L3 daemon -> backend `Worker(level=3)` -> L3 sub callable。它不证明 tensor bytes 已经被跨 host materialize，也不证明 output tensor 已经回写。

## Error And Health Model

PR #711 里有两层错误：

```text
transport-level error
  grpc.RpcError
  -> RpcClient wraps as RpcError
  -> RemoteWorkerProxy marks remote unavailable

remote execution error
  backend catches exception
  -> DispatchResp(error_code=1, error_msg, remote_traceback)
  -> RemoteWorkerProxy raises RuntimeError
  -> mailbox error region
  -> existing Worker.run error path
```

Heartbeat 是 availability check，不是 correctness proof。远端 `Heartbeat` 返回 `Health(ok=True, message="ok")` 只能说明 daemon service 可达；不能说明 callable catalog、inner worker、tensor data-plane 或 device runtime 一定可用。

## What To Remember

读 PR #711 时记住这六个判断：

1. `.proto` 是合同：它定义远端 service 和 request/response shape。
2. `dispatch_pb2.py` 是 message classes；`dispatch_pb2_grpc.py` 是 client/server glue。
3. `RemoteWorkerProxy` 是 L4 client；`L3Daemon` 是 remote L3 server。
4. `_remote_worker_loop` 是 compatibility shim：它让 C++ scheduler 继续看到 PROCESS mailbox。
5. `Catalog` 是为了替代 fork-COW callable registry；remote host 不能用本地 Python function pointer。
6. `TensorPool` 只是当前 data-plane 表面；完整 tensor movement 仍是 future work。

## Current Boundaries

- `emerging`: gRPC/protobuf control plane、remote scalar `TaskArgs` dispatch、callable catalog push/install、heartbeat、remote traceback propagation。
- `design-intended`: tensor refs、tensor pool streaming、future tensor materialization/output write-back、RDMA/Urma data-plane integration。
- `blocked/open question`: raw local VA crossing host boundary, production security/TLS/auth, node discovery, load balancing, C++ hot-path remote worker, backend crash recovery.

读完本页后，可以回到 [Runtime Dispatch and Serving Roadmap](./runtime-dispatch-and-serving-roadmap.md) 看 PR #711 如何接到 L4/L3 data-plane、A5 zero-copy dispatch 和 UBL128 serving target。
