# 03. 分布式拓展目标蓝图

本章描述“最终应该长什么样”。当前进度见 `05_progress_and_timeline.md`，不要把本章所有内容都理解为已经实现。

## 1. 目标一句话

PTO-Runtime 分布式拓展的目标是：在保留现有 Worker / Orchestrator / Scheduler / TensorMap 编程模型的前提下，让上层可以把任务派发到本地或远端 next-level worker，并让 L2/L1 通过 comm window、PTO-ISA 异步原语、HCCL/HCOMM/URMA/RoCE 等后端完成跨设备和跨节点通信。

更具体地说，目标不是把所有逻辑都改成网络 RPC，而是保留三条路径：

```text
fast local path:
    THREAD / PROCESS / local fork / shared-memory mailbox

distributed control path:
    parent runtime -> remote L3 runtime
    manage lifecycle, callable, task metadata, completion, errors

device data path:
    L2/L1 kernels move data through comm window / SDMA / URMA / HCCL / RoCE
```

这三条路径必须共存。否则要么牺牲本地性能，要么做不成 remote L3，要么无法复用现有 L2/L1 通信能力。

## 2. 总体分层

```text
L4+ / POD-level Runtime
    |
    | control plane: remote worker management, callable registration,
    |                task submission, heartbeat, error propagation
    v
L3 Host Worker
    |
    | local process control: chip worker / sub worker / nested worker
    | task graph: Orchestrator + Scheduler + TensorMap
    v
L2 Chip Worker / AICPU Runtime
    |
    | dispatch AICore kernels, observe completion, manage device context
    v
L1 AICore Kernel
    |
    | compute + PTO-ISA comm/async instructions
    v
GM / Comm Window / Completion Counters / CQ
```

其中 L4+ 到 L3 的远端控制是新增设计重点；L3 到 L2/L1 的 device data plane 已经有一部分基座。

新增纳入的 top-level HostWorker/DistWorker 设计文档明确要求 L3 与 L2 同构：L3 复用 L2 的 scope、ringbuffer、tensormap、submit、ready/completion 调度思想，不额外发明独立 DAG runtime。本文档的目标蓝图按这个约束理解：remote L3 是把现有 DistWorker/Worker 树跨 host 扩展，而不是绕开 Orchestrator/Scheduler/TensorMap 另做一套任务系统。

## 3. Control plane 与 data plane

### 3.1 Control plane

Control plane 管 worker、callable、task lifecycle：

```text
Parent Runtime
    |
    +-- discover / launch remote L3
    +-- register callable / code package
    +-- submit task / group
    +-- pass task metadata
    +-- receive completion / error
    +-- heartbeat / shutdown
```

当前本地实现中，control plane 被 fork、mailbox 和共享内存隐式完成。远端实现必须把它显式协议化。

### 3.2 Data plane

Data plane 管真正的数据交换：

```text
AICore kernel
    |
    +-- TLOAD / TSTORE
    +-- TNOTIFY / TWAIT
    +-- TPUT_ASYNC / TGET_ASYNC
    +-- HCCL/HCOMM comm window
    +-- URMA/RoCE backend
```

Data plane 可以复用 HCCL/HCOMM/PTO-ISA 能力，但它不能代替 control plane。

## 4. 目标拓扑

根据 `20260414 分布式Runtime.pdf` 的图片理解，手绘设计里已经出现 L4 -> L3 remote 的结构：L4 有 orchestrator，任务和 tensor 通过 shared memory 或未来网络路径到达 L3 remote worker；L3 继续管理 L2 chip task。

目标拓扑可以抽象为：

```text
                         +-------------------------+
                         | L4 / Parent Worker      |
                         | Orchestrator + Scheduler|
                         +-----------+-------------+
                                     |
                 control plane      |      control plane
                 local/fork         |      remote/RoCE/UB/TCP
                 +------------------+------------------+
                 |                                     |
                 v                                     v
      +----------------------+              +----------------------+
      | Local L3 Worker      |              | Remote L3 Worker     |
      | Orch + Sch + WM      |              | Orch + Sch + WM      |
      +----------+-----------+              +----------+-----------+
                 |                                     |
                 | local mailbox/bootstrap             | remote-local mailbox/bootstrap
                 v                                     v
      +----------------------+              +----------------------+
      | L2 Chip Worker 0..N  |              | L2 Chip Worker 0..N  |
      +----------+-----------+              +----------+-----------+
                 |                                     |
                 +-------------- data plane -----------+
                       HCCL/HCOMM/URMA/RoCE/windows
```

## 5. Worker 目标模型

目标模型中，Worker 的抽象仍保持：

```text
Worker
    |
    +-- Orchestrator
    +-- Scheduler
    +-- WorkerManager
            |
            +-- ChipWorker x N
            +-- SubWorker  x M
            +-- RemoteWorker x K
```

与当前主线不同的是：

1. 当前 `WorkerManager` 只有 THREAD 和 PROCESS 两种执行模式。
2. 目标设计需要引入 REMOTE 或等价 backend。
3. PROCESS mailbox 里的裸 pointer/cid 需要变成可跨进程/跨 host 的稳定任务描述。

目标 WorkerManager 可以这样理解：

```text
WorkerManager
    |
    +-- THREAD worker
    |       direct C++ call
    |
    +-- PROCESS worker
    |       shared-memory mailbox
    |
    +-- REMOTE worker
            network/session protocol
            remote callable registry
            remote task args transport
            completion/error channel
```

top-level design 中的统一 `IWorker` 语义可以作为这里的抽象边界：

```cpp
class IWorker {
 public:
    virtual ~IWorker() = default;
    virtual void run(const WorkerPayload& payload) = 0;
};
```

无论底层是 ChipWorker、SubWorker、DistWorker 还是未来 RemoteWorker，Scheduler 都只把任务路由给 worker；worker 自己阻塞在 `run(payload)` 直到完成，再通过 completion queue 通知 Scheduler。

目标 `REMOTE` backend 的最小协议对象应该包含：

```text
RemoteWorkerSession
    session_id
    endpoint
    protocol_version
    capabilities
        supports_python_callable
        supports_chip_callable
        supports_comm_bootstrap
        supports_recv_queue
        supported_dma_engines = [SDMA, URMA, ...]
    health
        last_heartbeat
        state = CONNECTING | READY | DRAINING | FAILED | CLOSED
```

任务提交不能只发送“callable pointer + args blob”，而应发送：

```text
RemoteTaskEnvelope
    task_id
    callable_id
    call_config
    task_args
    tensor_descriptors
    affinity
    comm_domain_id optional
    completion_policy
    timeout / cancellation token optional
```

这样 local PROCESS 和 REMOTE backend 可以保持同一个 Orchestrator 语义，但底层 transport 不同。

## 6. Callable 注册目标模型

### 6.1 为什么要统一 callable id

当前 NEXT_LEVEL 仍使用 `uint64_t callable`，SUB 使用 `int32_t callable_id`。这在本地 fork 下可工作，但远端 L3 无法 dereference 父进程里的 pointer。

目标模型应该统一成：

```text
callable package / code object
        |
        v
register(callable)
        |
        v
callable_id
        |
        +-- local registry
        +-- child process registry
        +-- remote L3 registry
        +-- L2/AICPU side stable handle/cache key
```

### 6.2 分层注册

```text
L4 parent:
    callable object
        |
        v
    register locally -> cid_parent
        |
        v
    register to remote L3 -> cid_remote
        |
        v
    remote L3 registers/loads L2 callable if needed -> cid_l2/cache key
```

关键要求：

1. 不能用裸 VA 作为跨 host callable 身份。
2. callable id 必须能成为 AICPU cache key，避免多 callable 交替运行时反复 `dlclose/dlopen`。
3. register 必须有生命周期：创建、复用、失效、释放。

推荐把 callable 分成三层身份：

```text
source identity:
    Python function object / C++ function / chip callable / shared object symbol

package identity:
    code_hash
    abi_version
    target = host-python | host-cpp | aicpu | aicore
    required_libraries

runtime identity:
    callable_id scoped by worker/session
```

注册协议可以是：

```text
parent:
    compute package metadata
    RegisterCallableRequest(package, symbol/name/serialized fn)

remote L3:
    validate ABI and dependencies
    load or reuse package
    allocate callable_id
    return RegisterCallableResponse(callable_id, cache_hit, warnings)

parent:
    store mapping:
        local logical callable -> remote session -> remote callable_id
```

## 7. Rank 与 worker affinity

聊天记录 2026-04-15 中讨论过 logical rank 与 physical device id 的区别。目标蓝图必须把它们分开：

```text
physical device ids: [0, 1, 4, 5]
logical ranks:      [0, 1, 2, 3]

task group rank 0 -> physical device 0
task group rank 1 -> physical device 1
task group rank 2 -> physical device 4
task group rank 3 -> physical device 5
```

也就是说，kernel 和通信域里看到的 rank 应该是任务组内逻辑编号；调度器负责把 logical rank 映射到具体 worker/device。

当前 PR #579 已经合入 worker affinity 和 `TensorKey{ptr, worker}`，这是目标蓝图的重要基础。但跨 remote L3 后，worker id 还需要扩展为：

```text
worker address = (host/session id, local worker id)
```

目标 rank map 可以长这样：

```text
RankMap(domain_id=42)
    rank 0 -> worker local://l3-0/chip-0,  physical_device_id=0
    rank 1 -> worker local://l3-0/chip-1,  physical_device_id=1
    rank 2 -> worker remote://host-b/l3-0/chip-0, physical_device_id=4
    rank 3 -> worker remote://host-b/l3-0/chip-1, physical_device_id=5
```

kernel 不应直接知道 `physical_device_id`。kernel 应该只拿到 `rankId=0..rankNum-1` 和 `CommContext`。物理设备选择属于 L3/L4 调度器和 platform backend。

## 8. Comm domain / comm window / bootstrap

目标模型中，comm domain 是一组 L2 worker 之间建立的数据通信域。

```text
L3 creates comm domain
    |
    +-- choose workers / logical ranks
    +-- each L2 comm_init(rank, nranks, rootinfo_path)
    +-- each L2 comm_alloc_windows(win_size)
    +-- collect local windows / device ctx
    +-- distribute full CommContext to each L2
```

根据 2026-04-17 聊天记录，这个流程的核心是：每个 L2 负责分配 window buffer，然后通过 mailbox 返回给 L3；L3 收集所有 rank 的 window，作为 context 传回每个 L2。L2 运行通信 kernel 时基于 context 找 peer window。

一个 comm domain 至少需要这些元数据：

```text
CommDomain
    domain_id
    nranks
    ranks:
        rank 0 -> worker address, physical device id, local device ctx
        rank 1 -> worker address, physical device id, local device ctx
        ...
    rootinfo:
        produced once by rank 0
        consumed by every rank
    windows:
        per-rank window base and size
    device_context:
        CommContext pointer visible to each L2/AICore side
```

remote L3 后，bootstrap 从“本地父进程收集所有 chip context”扩展成：

```text
L4 parent:
    create CommDomain(domain_id)
    assign logical ranks to local/remote workers

for each involved L3:
    ensure local chip workers are launched
    ask each chip rank to comm_init / comm_alloc_windows
    return rank-local context metadata

L4 parent or coordinator:
    assemble global domain
    distribute final context metadata

each L3:
    stage context to its local L2 workers
```

如果继续使用文件型 `rootinfo_path`，它只适合单机或共享文件系统 PoC。真正多机需要把 rootinfo exchange 抽象成 backend：

```text
RootInfoStore
    file backend       local PoC
    tcp/rpc backend    multi-host
    external kv        cluster environment
```

目标设计应允许两种模式：

1. **临时通信域**：每轮 task group 建立一次，用完释放，简单但开销大。
2. **驻留通信域**：Worker 生命周期内建立一次，后续 task 复用，适合 FFN TP、MoE dispatch 等场景。

## 9. Persistent run_loop 与 Send/Receive Runtime

`SEND_RECV_RUNTIME.md` 提出的核心需求是让 receive queue 成为 orchestrator 的一等输入：

```text
orch(queue):
    while true:
        if recv quit:
            break
        while recv data:
            data = pop queue
            nexttoken = process(data)
            push completion queue nexttoken
```

目标抽象：

```text
RecvQueue
    try_pop / poll / release / reset_pool

SendEndpoint
    send(dst, payload, meta)
    send_empty(dst)

CompletionQueue
    push / try_pop

RunRecvLoop
    poll recv
    submit downstream task
    observe completion
    push completion token
```

后端可以有多种：

```text
A5:       URMA jetty / JFR / CQ
A2/A3:    RoCE SRQ + RC QP
single:   HCCS + shmem ring
fallback: host TCP
```

注意：这是目标蓝图和 `SEND_RECV_RUNTIME.md` 的设计草案，不等同于主线已实现。

最小消息协议可以先不绑定具体 backend：

```text
MessageHeader
    magic / version
    message_type = DATA | CONTROL | COMPLETION | ERROR
    queue_id
    sequence
    payload_size
    flags

RecvQueue
    post buffer
    arm or poll backend
    produce CompletionEntry

CompletionEntry
    sequence
    status
    bytes
    source_rank / source_worker
    backend_opaque
```

它和 mailbox 的差别是：mailbox 以“一个 task slot 状态机”为中心；RecvQueue 以“持续接收消息流”为中心。MoE dispatch、persistent receive loop、运行中 child worker 通信都更接近后者。

## 10. Deferred completion 目标模型

目标模型中，异步完成由 kernel 实际注册的 wait condition 决定：

```text
scheduler dispatch
    |
    +-- prepare async context for every task
    |
    v
kernel
    |
    +-- no async: register nothing
    |
    +-- async: register counter / event / CQ-backed condition
             pto2_defer_counter(...)
             pto2_defer_flush(...)
    |
    v
scheduler sees normal kernel return
    |
    +-- ingress empty: complete normally
    |
    +-- ingress has conditions: put into async wait list
                                poll by engine
                                release when all ready
```

这个方向已由 issue #686 和 PR #700 进入主线：不再要求 orchestration 在 submit 时显式标记 deferred。

但目标蓝图还需要处理：

1. SDMA event record。
2. URMA CQ polling。
3. 多 engine 的统一 poll API。
4. 多 core/mixed task 的多个 completion condition。
5. 错误传播和 overflow。

## 11. Platform 解耦目标

当前 platform 层仍容易把 runtime、ACL、comm 能力绑到同一个 `.so` 和 ABI 里。目标解耦应至少分清：

```text
runtime core ABI
    task dispatch
    scheduler
    memory management

ACL/device ABI
    aclInit / aclrtSetDevice / stream / memory copy

comm ABI
    comm_init
    comm_alloc_windows
    comm_barrier
    comm_destroy
    URMA / RoCE / HCCL backend
```

2026-04-30 聊天记录中提到通用服务器可能没有 CANN，但仍需要 simpler 能跑；这意味着 host-only control plane 和 comm lib 部署必须尽量从 full CANN runtime 中拆出来。该点目前是待调研/待设计，不是已完成。

## 12. 蓝图到当前状态的粗映射

| 蓝图能力 | 当前状态 |
| --- | --- |
| L3 本地多 chip/sub worker | 主线已有，基于 fork + mailbox |
| Worker affinity | PR #579 已合入 |
| child device memory | PR #579 已合入 |
| TensorKey 区分 worker | PR #579 已合入 |
| HCCL comm window backend | PR #592 已合入 |
| L3 FFN TP demo | PR #571 已合入 |
| deferred completion 自动推断 | issue #686 + PR #700 已完成 |
| SDMA async completion | PR #696 open，未合入 |
| remote L3 control plane | 未见主线实现，仍是 top problem |
| unified send/recv runtime | 设计草案存在，未见主线实现 |
| platform 解耦到通用服务器无 CANN | 讨论线索，待调研 |
