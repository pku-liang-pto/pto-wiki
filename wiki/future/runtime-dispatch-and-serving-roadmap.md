---
title: "Runtime Dispatch and Serving Roadmap"
type: future
status: draft
sources:
  - https://github.com/hw-native-sys/simpler/pull/711
  - https://github.com/hengliao1972/pypto_top_level_design_documents/blob/main/simpler_distributed_runtime_design.md
  - https://github.com/hw-native-sys/pypto_top_level_documents/blob/main/UBL128_serving.md
  - ../materials/simpler_distributed_runtime_design.md
  - ../materials/UBL128_serving.md
  - ../evidence/future-runtime-dispatch-and-serving-roadmap.md
last_updated: 2026-05-08
---

# Runtime Dispatch and Serving Roadmap

本页把 `simpler` future remote L3 dispatch、L4/L3 tensor data plane、A5 send/receive 零拷贝 dispatch、UBL128 serving design 和 runtime open problems 放在同一条路线里读。它不是把 future work 写成已经完成；它的作用是解释这些材料共同指向什么目标、当前代码已经走到哪里、哪些约束会决定下一步实现。

## How To Read This Page

先把当前实现和 future 目标分开：

```text
current and design foundation
  simpler L2/L3 local Worker hierarchy
  simpler HostWorker / DistWorker design material
  PyPTO / PTO-ISA examples and local distributed data-plane examples
  HCCL / CANN / UB / RoCE as communication substrate

ongoing control/data-plane work
  simpler PR #711: Python L4 -> remote L3 dispatch over gRPC/protobuf
  PR #711 host-memory TensorPool + RXE/ibverbs data-plane MVP

design-intended production data-plane work
  production TensorPool + RDMA/Urma transport
  A5 UB jetty send/receive zero-copy buffer layout
  UBL128 prefill/decode serving over SU/SO/DCN networks

blockers / open questions
  stable callable identity
  no raw VA across hosts
  async child-worker communication
  platform/transport ABI decomposition
```

如果你只关心 `simpler` PR #711，先读 HostWorker / DistWorker baseline、remote L3 control plane 和 host-memory tensor data-plane prototype，再读 [PR 711 Remote Dispatch and Data Plane Primer](./pr711-grpc-dispatch-primer.md)。如果你关心 serving target，读 UBL128 path。公开原始材料见 [simpler Distributed Runtime Design](../materials/simpler_distributed_runtime_design.md) 和 [UBL128 Serving Design](../materials/UBL128_serving.md)。所有 claim 的 source set、checksum、PR state 和 status label 见 [Runtime Dispatch and Serving Roadmap Evidence](../evidence/future-runtime-dispatch-and-serving-roadmap.md)。

## Current Foundation

当前 wiki 已经把 implemented foundation 分在几个 public pages：`simpler` 的 L2/L3 worker hierarchy 和 mailbox path 见 [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md)；普通 PyPTO/PTO-ISA/simpler execution 见 [Non-Distributed Execution](../topics/non-distributed-execution.md)；现有 single-host distributed examples 见 [Distributed Runtime](../examples/pto/distributed-runtime.md)；remote L3 状态边界见 [Distributed Execution](../topics/distributed-execution.md)。

这些基础很重要，因为 future work 不是凭空新增一个 distributed runtime。它是在已有的 `Worker(level=3+)`、`submit_next_level`、mailbox、TensorMap/ring buffer、AICPU/AICore launch 和 communication data-plane 上继续扩展。任何 future page 都不能跳过这个地基，否则容易把 design document 里的 remote worker 当成已经 merged 的 runtime。

`simpler_distributed_runtime_design.md` 给这个地基补了一层更明确的设计语言：L1 是单个 AICore/AIV kernel，L2 是单 chip 的 `ChipWorker`，L3 是单 host 的 `HostWorker` / `DistWorker`，L4+ 才是多 host 递归扩展。它把 `IWorker.run(payload)` 定义成每层 worker 的共同阻塞接口，并把 `ChipWorker`、`SubWorker`、`DistWorker` 放进同一棵树里。这个材料现在公开在 [Materials](../materials/simpler_distributed_runtime_design.md)，但它仍是设计材料；进入 implemented pages 仍要回到 `simpler` merged source 和 tests。

## Workstream 0: HostWorker / DistWorker Baseline

**Status: `design-intended` / `context for ongoing work`.** `simpler_distributed_runtime_design.md` 不是 PR #711 的替代品，而是解释 PR #711 为什么要保持 “level-isomorphic worker” 形状。它的核心约束是：每一层都应该像 L2 一样用 `scope`、ring buffer、TensorMap、fanin/fanout 和 blocking `run(payload)` 表达任务，而不是为 L3/L4 发明完全不同的编排模型。

这个设计的最小心智模型如下：

```text
IWorker.run(payload)
  |
  +-- ChipWorker
  |     L2 hardware worker
  |     run() calls device-side C API and blocks until completion
  |
  +-- SubWorker / HostSubWorker
  |     forked Python child process
  |     parent worker thread writes shared-memory mailbox
  |     child polls TASK_READY, executes callable, writes TASK_DONE
  |
  +-- DistWorker
        recursive host-level worker
        level=3 owns ChipWorker + HostSubWorker children
        level=4 can own multiple level=3 DistWorker children
```

`HostSubWorker` 的关键实现原则是 “fork before threading”。设计材料要求在 `HostWorker.__init__()` 里完成 callable registration、shared-memory mailbox allocation 和 child process fork，然后才启动 C++ scheduler / worker threads。这样避免多线程环境里 fork 的不安全组合，也让 child process 通过 fork-COW 继承 callable registry，不需要 pickle lambda 或 closure。共享数据走 `/dev/shm` 和 `share_memory_()`，mailbox 只传 state、callable id、args offset、result address 和错误码。

```text
Parent process
  Scheduler thread picks ready task
  SubWorker thread writes mailbox:
    IDLE -> TASK_READY(callable_id, args_shm_fd, args_offset)
  SubWorker thread spin-polls TASK_DONE

Child process
  polls mailbox.state
  on TASK_READY:
    execute callable_registry entry for callable_id with task_args
    write result / error
    mailbox.state = TASK_DONE
```

这个 baseline 和 PR #711 的关系很重要。HostWorker / DistWorker 设计假设 fork 后共享本机地址空间、共享 `/dev/shm` 和 COW callable registry；PR #711 则把 L4 的 next-level child 变成 remote L3 daemon，remote host 不能继承这些本机假设。因此 PR #711 引入 `Catalog`、`TensorRef`、`TensorHandle`、`TensorPool` 和 transport backend，是对 HostWorker / DistWorker 递归模型的 cross-host 化，而不是另起一个不相干的 runtime。

## Target Mental Model

目标系统要把 “谁来派发任务” 和 “tensor 怎么移动” 分成两条平面：

```text
Control plane
  L4 scheduler / frontend / orchestrator
      |
      | Dispatch(callable_id, scalar args, tensor handles)
      v
  remote L3 daemon / prefill host / decode host

Data plane
  tensor bytes / KV blocks / token batches
      |
      | SHM, RDMA over RoCE, UB Urma, A5 send/receive
      v
  registered pool, NPU HBM, SSU storage, jetty message buffers
```

Control plane 只应该搬小对象：task id、callable id、shape、dtype、buffer handle、heartbeat、error 和 metadata。Data plane 搬真正的大块 tensor：token buffer、KV cache、expert input、activation handoff、output buffer。`materials/L4_L3_data_plane_design.md` 明确把 gRPC 用于 args/control，把 tensor data 放到 zero-copy path；`UBL128_serving.md` 也把 hot-path internal RPC 放在 SO 上的 `uRPC over UB Urma`，把外部 ingress、运维和 DCN 服务留给 gRPC/HTTP。证据边界见 [evidence ledger](../evidence/future-runtime-dispatch-and-serving-roadmap.md#source-inventory)。

`RoCE` 可以理解成 “把 RDMA 语义跑在 Ethernet 上”。RDMA 的直觉是：网络适配器直接读写远端 registered memory，避开普通 TCP/IP hot path 里的多次用户态/内核态拷贝；RoCE 则把这种能力放到 lossless/reliable Ethernet fabric 上。这个外部定义来自 [NVIDIA RoCE documentation](https://docs.nvidia.com/networking/display/Onyxv3104006/RDMA%2BOver%2BConverged%2BEthernet%2B%28RoCE%29)；PTO runtime 文档里的 `Urma` / `UB` 是更具体的平台设计词，含义以 UBL128 material 为准。

## Workstream 1: L4 To Remote L3 Control Plane

**Status: `ongoing` / `emerging`.** `hw-native-sys/simpler` PR [#711 Add Python distributed L4 to L3 dispatch](https://github.com/hw-native-sys/simpler/pull/711) 是第一条 concrete code path。它的 PR body 和新 commits 说明了几件事：新增 Python-first gRPC/protobuf distributed dispatch package；通过 local `PROCESS` mailbox shim 把 `Worker.add_remote_worker()` 接到已有 C++ scheduler；增加 callable catalog、L3 daemon backend process、heartbeat、TensorPool control service、RXE/HCOMM transport backend hooks、examples 和 review docs。该 PR 在 2026-05-08 仍是 open/review-required，不应写成 `simpler/main` implemented source state。

它的控制流可以这样读：

```text
L4 Worker
  add_remote_worker(endpoint)
  submit_next_level(...)
      |
      | local PROCESS mailbox shim
      v
Python shim thread
      |
      | gRPC DispatchReq
      v
L3Daemon
      |
      | backend process, inner Worker(level=3)
      v
local L3 run(callable, args, config)
```

这条路径的关键价值不是性能，而是 compatibility：上层用户仍然可以用 `orch.submit_next_level(...)` 表达 next-level work；local C++ scheduler 先把 remote worker 看成一个 ordinary PROCESS worker；Python shim 再把本地 mailbox request 转成 network request。这样可以先验证 remote control plane 和 callable catalog，不必一开始重写 C++ scheduler ABI。

PR #711 的后续 commits 已经不再只是 scalar path。当前 PR branch 上有 host-memory `TensorPool`、`TensorRef(handle)`、gRPC chunk fallback、RXE/ibverbs input write、RXE local output writeback、HCOMM optional adapter，以及覆盖 output tensor writeback 的 tests。Gemini review 早期指出 raw memory pointers across hosts 是 critical risk；新代码的方向正是把 remote next-level worker 从 raw pointer 升级到 stable callable identity 和 transport-level handles。仍要保留边界：这些能力还在 open PR branch 上，且是 host-memory prototype，不是 production serving data plane。

## Workstream 2: Tensor Data Plane For L4/L3

**Status: `emerging prototype` + `design-intended production target`.** `materials/L4_L3_data_plane_design.md` 把 tensor path 的目标说清楚：gRPC 可以传 `DispatchReq`，不能承载 MB 到 GB 级 tensor hot path。大 tensor 通过 protobuf 会引入分片、序列化、额外 buffer 和多次拷贝；cross-host CPU<->CPU 或 CPU<->NPU data movement 应该走 RDMA over RoCE / Urma 或 future NPU-direct path。PR #711 新 commits 已经把其中一部分做成 host-memory prototype：小 tensor inline，大 tensor 用 L3 `TensorPool` handle，input 可以通过 gRPC chunks / RXE / HCOMM adapter 写入，output 可以通过 inline、L3 handle 或 L4-local RXE ACK 回到 L4。

当前 PR branch 和后续 production target 可以共用这条五步 mental model：

```text
1. L4 chooses transport
     tiny tensor   -> INLINE
     fallback      -> gRPC chunks
     PR prototype  -> RXE / HCOMM adapter
     target        -> SHM / RDMA / Urma / NPU-direct

2. L4 asks L3 TensorPool for remote buffer
     TensorPool.AllocTensor(size) -> handle, remote_addr, rkey

3. data plane writes input tensor bytes
     PushTensor chunks or RDMA write(local_va, remote_addr, rkey)

4. control plane sends dispatch
     DispatchReq { callable_id, scalar_args, tensor_refs: [handle] }

5. L3 resolves handle to local buffer
     run Worker(level=3), then return inline/output handle or push output back
```

`TensorPool` 是这条路线的关键 bridge。PR #711 当前实现的是进程内 bytearray pool：`AllocTensor` 分配 buffer，`transport_backend.register_region()` 返回 `TensorHandle`，`RefreshTensor` 续租并在 RXE backend 下重建 one-shot server，`FreeTensor` 和 GC 释放 entry。生产 design 还要求更稳定的 registered-memory pool：启动时预注册 GB 级 region，运行时 sub-allocation，避免每次 dispatch 都执行 `ibv_reg_mr` / `urma_register_seg` 之类昂贵注册动作。数据面材料建议每个 L3 host 预留 8-16 GB pool，并把 pool exhaustion、NUMA placement、large tensor fragmentation、output push/pull policy、lease/GC 作为后续明确问题。

这条 design 也改变了 PR #711 的验收标准。现在不能再把 PR #711 描述成 “只覆盖 scalar `TaskArgs`”。它已经有 remote tensor prototype 和 output writeback；但也不能声称完成 production remote tensor dispatch。生产形态至少还需要 stable tensor refs、long-lived pool lifetime、transport schema stability、RDMA/Urma backend、failure observability、cross-node concurrency tests，以及 no raw local pointer crosses the host boundary 的持续证明。

## Workstream 3: A5 Send/Receive Zero-Copy Dispatch

**Status: `design-intended`.** `materials/A5_send_recv_dispatch.pdf` 解释 A5 平台如何用 UB send/receive 和 `jetty` 把 many-to-one message arrival 变成 receiver-side contiguous buffer layout。这里的重点不是 remote L3 control plane，而是 data-plane compute layout：发送端提前按接收端消费形状组织数据，接收端收到后直接在 message buffer 上做 BGEMM/MoE expert compute。

可以把 `jetty` 看成 receiver 暴露给多个 sender 的 ingress port。每个 `jetty` 有两个队列：

```text
free buffer queue
  receiver pre-frees buffer pointers
  UB hardware pops one buffer when a message arrives

receive buffer queue
  UB hardware pushes buffer pointer after message is fully written
  receiver fetches completed buffers for compute
```

硬件接收一条 send message 时执行三个 atomic steps：从 free queue 取 buffer；把 message 写入该 buffer；完整写入后把 buffer pointer 放入 receive queue。这个机制保证每条消息边界清楚、不会覆盖别人，但不保证跨 sender 的 global send order。应用如果关心顺序，必须在 payload/meta data 里带 sender id、sequence number 或 tag。

零拷贝计算依赖一个更细的不变量：初始化时按物理地址顺序 `free(message_buffer_base + i * message_buffer_size)`；一轮 dispatch 内不要回收复用 buffer；退出 polling 后，前 `receive_count` 个 message buffers 就能被当作一个二维 tensor view：

```text
storage shape = (receive_count, message_buffer_size)
tensor shape  = (receive_count, message_data_size)
row stride    = message_buffer_size
```

这意味着 BGEMM/MoE kernel 需要支持 `storage_stride != tensor_row_width`。如果计算后按 arrival order 归还 buffer，下一轮 free queue 的物理顺序会被打乱，contiguous-buffer invariant 失效；正确做法是 reset free queue，然后按物理地址顺序重新 free。Dual-pipe/ping-pong 场景还需要两套 buffer pool，确保 UB 正在写的 pool 和 kernel 正在读的 pool 不是同一套。

## Workstream 4: UBL128 Serving Target

**Status: `design-intended`.** `UBL128_serving.md` 把 runtime dispatch 放到更大的 serving system 中：prefill/decode 解耦、prefix caching、KV cache 持久化、SU/SO/DCN 三类网络隔离，以及 F/M/PC/PN/DC/DN/S 七类逻辑节点。它提供的是 target architecture，不等于 `simpler` 或 PyPTO 当前已经实现 serving stack。

UBL128 的硬件起点是 `HBD`，也就是 UB High Bandwidth Domain。一个 UBL128 HBD 由 8 台 PC16 服务器组成，每台 PC16 有 2 颗 CPU 和 16 颗 Ascend 950 NPU；整个 HBD 有 16 颗 CPU 和 128 颗 NPU。PC16 内部把 16 颗 NPU 分成两个 8-NPU NUMA 组，每组由一颗 CPU 通过 8 条 400 Gbps UB 链路一对一直连；跨 PC16 的 128 颗 NPU 通过 UBL128 域内 SU switch 形成 high-bandwidth any-to-any 网络。这个硬件边界解释了为什么 serving design 把 “域内 EP/DP 计算通信” 和 “跨域 KV / control traffic” 严格分开。

最重要的 mental model 是三张网络的职责分离：

```text
SU: UBL128 domain internal NPU<->NPU
    EP / DP all-to-all and tight collective data-plane

SO: cross-UBL128 any-to-any, CPU/NPU/SSU
    KV read/write, prefill->decode handoff, hot-path uRPC over UB Urma

DCN / RoCE: CPU-visible Ethernet
    external HTTP/gRPC ingress, ops, monitoring, POSIX/object storage outside KV
```

这个设计的硬约束是：EP/DP traffic should own SU；KV bytes、prefill→decode handoff、CPU↔CPU hot-path control、SSU access 等流量走 SO；外部入口和运维走 DCN。它与 L4/L3 data-plane material 的双平面思路一致：control-plane RPC 和 data-plane memory movement 可以共用 physical fabric，但必须用 queue pair / protocol layer 隔离，不能让大块 data-plane IO 把 latency-sensitive control path 拖垮。

Serving lifecycle 可以压缩成这条路径：

```text
user -> F
  tokenize
  PrefixMatch(token_seq) -> M
  DispatchPrefill(...) -> PC -> PN
  PN reads matched KV from S, computes missing KV, writes new KV to S
  PN hands off final state to DN over SO
  DispatchDecode(...) -> DC -> DN
  DN reads KV from S, runs decode, streams token id back to F
  F detokenizes and returns text
```

UBL128 serving 的 KV cache 不是一个普通文件系统对象。材料把 KV storage 设计成 SSU 上的 LBA-direct layout：Meta server 只维护 prefix radix tree、ChunkRecord、SSU/LBA allocation 和 refcount；真正的 KV bytes 由 NPU 通过 SO Urma read/write 直接访问 SSU。换句话说，CPU 可以决定 “哪些 chunk 在哪个 SSU/LBA”，但 CPU 不应该在 hot path 上搬 KV bytes。

```text
F receives request
  tokenize
  PrefixMatch(token_seq) -> M
    M returns ChunkRecord[]:
      chunk_id
      model_id
      per-layer SSU id
      entry_lba_start / count
      optional CSA indexer LBA

PN / DN NPU
  uses ChunkRecord[]
  directly reads or writes KV bytes on SSU through SO Urma
```

Serving 节点也要和 runtime worker 名字分开。`F` 是 service access / scheduler，`M` 是 KV Meta Server，`PC` / `DC` 是 PC16 host CPU side prefill/decode controllers，`PN` / `DN` 是 prefill/decode NPU workers，`S` 是 SSU storage unit。PR #711 的 `L4 Worker` / `L3Daemon` 只能类比其中一部分 dispatch skeleton：它可以启发 `F -> PC/DC` 或 host-level dispatch，但它不是完整的 F/M/PC/PN/DC/DN/S serving system。

```text
serving roles
  F  frontend + scheduler
  M  KV metadata and prefix radix tree
  PC prefill host CPU controller
  PN prefill NPU workers
  DC decode host CPU controller
  DN decode NPU workers
  S  SSU LBA-direct KV storage

runtime foundation candidates
  HostWorker / DistWorker:
    local recursive worker hierarchy
  PR #711:
    remote host dispatch + tensor handle prototype
  A5 send/receive:
    zero-copy receive-buffer compute pattern
```

Future runtime work 需要决定 `simpler` remote L3 dispatch 如何映射到这套 serving roles。PR #711 的 L4->L3 daemon 更像 control-plane seed；L4/L3 data-plane material 和 A5 send/receive material 补的是 tensor movement 和 zero-copy compute；UBL128 serving material 补的是 system-level objective、network isolation、KV/prefix semantics 和 validation scenarios。

## Open Runtime Problems That Gate The Roadmap

**Status: `blocked` / `open question`.** `materials/RUNTIME_OPEN_PROBLEMS.md` 基于 `simpler` commit `08f6f769` 总结了四个互相关联的 gap。它们仍然适合作为 future page 的 risk list，因为 PR #711 和数据面材料都在试图补其中一部分。

第一，当前 local next-level worker lifecycle 基于 `os.fork()`、shared-memory mailbox、fork-COW inherited Python registry 和 local virtual addresses。Remote host 不在同一个 fork tree 里，所以不能继承这些假设。

第二，callable identity 还没有贯穿所有层。L3+ `Worker.register` 覆盖一部分 Python callable，但 L2/chip path、NEXT_LEVEL raw pointer path、AICPU single-slot cache 仍没有统一 stable id。Remote callable catalog 必须给 callable 一个可序列化、可校验、可缓存的身份。

第三，当前 mailbox protocol 只有 dispatch-block-complete 模式，`TASK` 和 `CONTROL` 互斥，WorkerThread FIFO 会阻塞后续消息。长期运行的 child worker、streaming data feed、queue polling、async completion 不能只靠当前 4096B mailbox blob 表达。

第四，platform ABI 把 runtime、ACL/stream 和 communication symbols 放在同一个 `host_runtime.so` 统一 ABI 下。只有一个 chip↔chip comm domain 时这样很简单；如果未来增加 host↔host、host↔chip async、RDMA/Urma transport 等新通信域，stub 和 symbol ownership 会快速变重。

## Roadmap / Task Division

这是一条状态边界明确的 roadmap，不是承诺所有任务都在同一个 PR 完成：

| Step | Status | Objective | Exit Evidence |
| --- | --- | --- | --- |
| R0 | `implemented foundation` | 继续维护 local L2/L3 hierarchy、examples、mailbox、TensorMap/ring 和 current distributed data-plane pages。 | merged source, examples/tests, repository/topic pages updated |
| R0a | `design-intended` | 把 HostWorker / DistWorker design material 映射到当前 `simpler` source，明确哪些是 implemented local worker behavior，哪些仍是 design language。 | source-mapped page or evidence ledger with exact commit, tests, and negative findings |
| R1 | `ongoing` | 合理收敛 PR #711 的 remote L3 callable/control path。 | merged PR, passing CI, docs/tests cite exact commit |
| R2 | `ongoing` | 把 raw pointer boundary 改成 stable callable id、serialized callable version、tensor refs 和 error model。 | callable catalog tests, tensor-ref tests, no cross-host raw VA claim |
| R3a | `emerging` | 保留 PR #711 host-memory `TensorPool`、gRPC chunk fallback、RXE input write、RXE output writeback、HCOMM adapter hooks。 | merged PR, source-shaped wiki update, tests for output/input tensor semantics |
| R3b | `design-intended` | 将 prototype data plane 推进到 production RDMA/Urma/NPU/SSU path。 | cross-host tensor input/output tests, pool lease/GC, failure tests, performance baseline |
| R4 | `design-intended` | 将 A5 UB jetty receive buffers 接到 MoE/BGEMM zero-copy layout。 | kernel examples prove stride-aware compute on receive buffers |
| R5 | `design-intended` | 把 UBL128 serving roles、prefix/KV flows、SU/SO/DCN isolation 映射到 runtime APIs。 | serving example or design-to-source mapping with runnable slices |
| R6 | `open question` | Decouple platform/transport ABI enough to avoid per-runtime stub explosion. | ABI proposal, build matrix, platform tests |

## What Not To Infer

不要从这些材料推断：

- PR #711 已经 merged 或 production-ready。它在 2026-05-08 仍是 open/review-required。
- PR #711 的 RXE/ibverbs MVP 等于 production tensor data-plane。当前 PR branch 已经有 host-memory tensor prototype 和 output writeback，但还不是 UBL128 SO/UB Urma/NPU HBM/SSU KV serving path。
- `ContinuousTensor.data`、mailbox pointer 或 Python callable pointer 可以跨 host 使用。跨 host 必须用 handle、catalog id、registered memory 或 transport-level reference。
- UBL128 serving document 是 `simpler` 当前实现。它是 higher-level target design，需要后续 source evidence 或 examples 才能迁移到 implemented pages。
- `simpler_distributed_runtime_design.md` 中的 HostWorker / DistWorker 语言全部都已经 merged。它是重要 design context，但具体实现状态仍要按当前 `simpler` source 和 tests 重新核验。
- A5 jetty receive order 等于 sender global order。它保证 message 完整和 receive completion order；跨 sender 业务顺序要由 payload protocol 恢复。

## Source Boundary

本页用 [Runtime Dispatch and Serving Roadmap Evidence](../evidence/future-runtime-dispatch-and-serving-roadmap.md) 作为 paired evidence ledger。进入 implemented pages 的条件是：相关 PR merged、source commit fixed、tests/examples 可定位、wiki 能展示代码形状并解释 proof boundary。在那之前，本页保留为 Future。
