# 04. 重点特性详解

每个特性按“背景、目标、设计、代码状态、设计取舍、风险”组织。

## 1. Remote L3 / 远端 next-level worker 管理

### 背景

根据 `RUNTIME_OPEN_PROBLEMS.md`，当前 L4 -> L3 dispatch 建立在本地 `os.fork()` 上。`python/simpler/worker.py` 的 `_start_hierarchical()` 会 fork next-level Worker child，然后通过 shared-memory mailbox 注册到 C++ `_Worker`。

这对本地进程树有效，但远端 L3 不在同一个地址空间和 fork 树中。

### 目标

把 next-level worker 从“只能是本地 fork child”扩展为“可以是远端 L3 session”：

```text
L4 WorkerManager
    |
    +-- local process child
    |
    +-- remote L3 session
            |
            +-- remote Worker.run(callable_id, taskargs, config)
            +-- remote completion / error
            +-- heartbeat / shutdown
```

### 关键设计

1. 引入远端 worker endpoint。
2. 建立 remote L3 生命周期：connect、register、init、run、close。
3. 把 mailbox 中的裸 pointer/cid/taskargs blob 升级成网络可传输协议。
4. 远端 L3 自己管理本地 L2 chip workers。
5. 错误和 cancellation 必须能回传父 Worker。

### 当前代码状态

当前主线 `WorkerManager` 只有 THREAD 和 PROCESS 两类 mode。`worker_manager.h` 中 `WorkerThread::Mode` 是：

```text
THREAD
PROCESS
```

没有 REMOTE mode。`Worker.add_worker(worker)` 也只接受未 init 的本地 Worker 对象。

### 设计取舍

不能把 RoCE 数据通信能力直接当成 remote L3 管理能力。RoCE/HCCL/URMA 能帮忙搬数据，但 remote L3 还需要进程生命周期、callable 注册、task protocol 和错误语义。

一个 remote L3 管理面的最小状态机应该是：

```text
ABSENT
    |
    | launch/connect
    v
CONNECTING
    |
    | protocol handshake + capability exchange
    v
READY
    |
    | submit tasks / register callable / bootstrap comm
    v
RUNNING
    |
    | drain / shutdown
    v
CLOSED

failure from any active state -> FAILED
```

每个状态需要明确允许的操作：

| 状态 | 允许操作 | 禁止操作 |
| --- | --- | --- |
| `CONNECTING` | handshake、版本检查 | submit task |
| `READY` | register callable、bootstrap comm、submit task | reclaim session resources |
| `RUNNING` | submit、poll、cancel、heartbeat | protocol downgrade |
| `DRAINING` | poll completion、cancel outstanding | new task |
| `FAILED` | collect error、cleanup、maybe reconnect | assume task succeeded |

### 风险

1. 远端 L3 失败检测和本地 fork waitpid 完全不同。
2. 远端 taskargs 中的 pointer 语义必须重写。
3. 如果 remote L3 上也要支持 Python SUB worker，代码包分发和环境一致性会成为新问题。

## 2. Callable 注册

### 背景

当前 callable 身份有双轨：

```text
NEXT_LEVEL:
    submit_next_level(uint64_t callable, ...)
    常见含义：chip callable buffer pointer / handle

SUB:
    register(fn) -> callable_id
    submit_sub(callable_id, ...)
```

本地 fork 下，Python `_callable_registry` 可以由 child 通过 COW 继承；chip callable 的裸指针也可能因 fork-COW 和相同 VA 工作。但远端 L3 不可能 dereference 父进程 pointer。

### 目标

统一 callable 身份：

```text
callable source / binary / Python fn
    |
    v
register
    |
    v
stable callable_id
    |
    +-- parent registry
    +-- local child registry
    +-- remote registry
    +-- L2/AICPU cache key
```

### 关键设计

1. `register()` 不应只覆盖 SUB worker，也应覆盖 next-level worker 的 orch/chip callable。
2. remote L3 register 应返回远端 callable id。
3. callable id 应可作为 L2/AICPU cache key，避免多 callable 交替时反复加载。
4. callable lifecycle 要可管理：注册、复用、释放、版本更新。

### 当前代码状态

主线 `python/simpler/worker.py` 中 `register()` 限制 level >= 3 且 init 前调用。主线 `orchestrator.h` 中 `submit_next_level()` 仍接受 `uint64_t callable`，`submit_sub()` 接受 `int32_t callable_id`。

### 设计取舍

继续保留裸 pointer 的优点是快，且兼容现有 chip callable 路径；缺点是不能跨 host，API 边界也无法强制“fork 前 alloc”。目标设计应保留本地 fast path，但在语义层引入稳定 callable id。

自包含地说，`CallableDescriptor` 至少应该包含：

```text
CallableDescriptor
    kind:
        python_fn
        host_cpp_symbol
        aicpu_callable
        aicore_kernel
    stable_name
    code_hash
    abi_version
    required_runtime:
        python_version optional
        shared_objects optional
        pto_isa_version optional
        cann_version optional
    entrypoint:
        module/name or shared object/symbol or kernel handle
```

注册结果应该包含：

```text
CallableRegistration
    callable_id
    owner_session
    cache_hit
    target_level = SUB | NEXT_LEVEL | L2
    lifetime = until_unregister | until_session_close
```

## 3. Worker memory、child_memory 与驻留

### 背景

2026-04-17 聊天记录讨论过 FFN weight 驻留问题：如果某个卡部署参数 W，使用 W 的任务最好发到该 worker 上重复执行。这要求：

1. L3 能在指定 L2 worker 上分配内存。
2. 调度能指定 worker。
3. TensorMap 能区分不同 worker 上相同 device address。

### 当前状态

PR #579 已合入以下能力：

1. `child_memory` flag on `ContinuousTensor`。
2. `device_malloc_ctx` / `device_free_ctx` / copy ctx C API。
3. `orch.malloc(worker_id, size)`。
4. `TensorKey{ptr, worker}`。
5. scheduler worker affinity。

主线 `orchestrator.h` 已有：

```text
uint64_t malloc(int worker_id, size_t size)
submit_next_level(..., int8_t worker = -1)
submit_next_level_group(..., const vector<int8_t>& workers = {})
```

### 目标设计

```text
L3 orch:
    ptr = orch.malloc(worker_id=3, size=W_size)
    orch.copy_to(worker_id=3, dst=ptr, src=host_W)
    tensor = ContinuousTensor(data=ptr, child_memory=True)
    submit_next_level(..., args=tensor, worker=3)
```

### 风险

1. 驻留内存生命周期需要和 Worker 生命周期绑定，而不是 task scope。
2. remote worker 下，`worker_id` 需要扩展为 `(remote_session, worker_id)`。
3. TensorMap 的 key 需要能表达远端 worker 维度。

远端 tensor descriptor 可以设计成：

```text
TensorDescriptor
    logical_id optional
    address:
        kind = HOST_VA | DEVICE_VA | COMM_WINDOW | REMOTE_MR
        value = uint64
    owner:
        worker_address
        logical_rank optional
    shape / dtype / byte_size
    memory_flags:
        child_memory
        read_only
        externally_owned
    lifetime:
        producer_task
        scope_id
        explicit_free_required
```

这比 `TensorKey{ptr, worker}` 更重，但它解决 remote 场景下的问题：同一个 `ptr` 数值不能说明地址属于哪个 host、哪个 device、哪个 rank，也不能说明该地址是否能被对端直接访问。

## 4. Comm window / bootstrap

### 背景

根据 PR #592，项目已经把 HCCL backend for `comm_*` C API 合入主线。根据 2026-04-17 聊天记录，bootstrap 的简化流程是每个 L2 分配 window，L3 收集后再把完整 context 下发给各 L2。

### 当前状态

主线关键文件：

```text
src/common/platform_comm/comm.h
src/common/platform_comm/comm_context.h
src/common/platform_comm/comm_sim.cpp
src/a2a3/platform/onboard/host/comm_hccl.cpp
python/simpler/task_interface.py
python/simpler/worker.py
```

`CommContext` 包含 `rankId`、`rankNum`、`winSize`、`windowsIn[]`、`windowsOut[]`。

### 目标流程

```text
Parent L3
    |
    +-- prepare ChipBootstrapConfig(rank, nranks, rootinfo_path, window_size)
    |
    v
Each L2 ChipWorker
    |
    +-- comm_init
    +-- comm_alloc_windows
    +-- return device_ctx / local_window_base / actual_window_size
    |
    v
Parent L3
    |
    +-- collect ChipContext
    +-- pass context to orchestration args
    |
    v
AICore kernel
    |
    +-- use CommContext.windowsIn/windowsOut to access peer windows
```

### 设计取舍

为什么不让 L2 worker 之间自己交换 window 信息？聊天记录中指出，这会打破“目前 L2 只有和 L3 交互”的原则。由 L3 收集并下发 context 更符合当前层级模型，但会让 L3 承担 bootstrap coordinator。

### 风险

1. `comm_hccl.cpp` 依赖 CANN private ABI。
2. rootinfo/barrier 文件需要 freshness/cleanup，聊天记录中已经出现过旧文件污染问题，PR #592 做了 cleanup 和 run token。
3. windowsIn/windowsOut 的语义要与 HCCL/private layout 保持一致。

## 5. Logical rank / physical device id

### 背景

2026-04-15 聊天记录中，大家讨论了 rank 是否应该绑定 physical device id。结论方向是：任务组内 rank 应该是 logical rank，而 device id 是实际调度结果。

### 目标设计

```text
Request:
    run SPMD on physical devices [1, 2, 6, 7]

Runtime mapping:
    logical rank 0 -> device 1
    logical rank 1 -> device 2
    logical rank 2 -> device 6
    logical rank 3 -> device 7

Kernel/CommContext sees:
    rankId in [0, 1, 2, 3]
    rankNum = 4
```

### 当前状态

PR #579 的 worker affinity 给了调度指定 worker 的能力，但是否所有 comm/context/demo 都已经完整区分 logical rank 和 physical device，需要继续按代码和测试逐项确认。

### 风险

如果把 physical device id 写入 tensor rank 维度或 comm rank，会导致只调度设备子集时语义错乱。例如使用最后 4 张卡执行 allreduce，不应要求 tensor rank 维度按全机设备数定义。

## 6. Deferred completion / async wait

### 背景

分布式通信经常需要“kernel 返回但通信仍在进行”的模式。如果 runtime 在 kernel return 时就释放依赖，下游可能读到未完成数据。

### 当前状态

PR #670 合入 deferred completion。issue #686 提出由 kernel 注册 wait condition 自动推断 deferred，而不是 orchestration submit-time flag。PR #700 已合入并关闭 #686。PR #692 对齐 deferred notification API。PR #696 的 SDMA async completion 仍 open。

### 目标流程

```text
dispatch task
    |
    +-- scheduler prepares async ctx
    |
kernel
    |
    +-- pto2_send_notification(...)
    +-- save_expected_notification_counter(...)
    +-- or pto2_defer_counter(...)
    +-- pto2_defer_flush(...)
    |
kernel returns
    |
scheduler completion path
    |
    +-- ingress empty -> normal complete
    +-- ingress non-empty -> async wait list
                           poll conditions by engine
                           release when ready
```

### 设计取舍

把 deferred 标记从 orchestration 移到 kernel 实际注册条件，有两个好处：

1. orchestration 不必提前知道 kernel 是否使用异步。
2. 避免“submit 标记 deferred 但 kernel 没注册”或“kernel 使用异步但 submit 忘记标记”的错配。

代价是每个 dispatch 都要准备 async context 和 deferred ingress，增加固定开销。

### SDMA 与 URMA 差异

根据聊天记录，SDMA async event 可抽象成 event record / flag / counter；URMA completion 则更接近 CQ polling。因此目标设计必须有 engine-aware 的 completion condition：

```text
completion condition
    |
    +-- engine = SDMA
    |       poll event record / flag
    |
    +-- engine = URMA
            poll CQ / URMA-specific completion
```

根据 `pto-isa` 仓库 `4e27a10`，这个 engine-aware 设计不是额外想象出来的抽象，而是与 PTO-ISA 类型系统对齐：`AsyncEvent` 带 `DmaEngine engine`，`BuildAsyncSession`、`TPUT_ASYNC`、`TGET_ASYNC` 都有 SDMA/URMA engine 模板参数。根据 `pto-isa/demos/baseline/allgather_async/README_zh.md`，A2/A3 路径使用 SDMA/HCCL，A5 路径使用 URMA/HCCP V2 Jetty RDMA。

因此，runtime 的 deferred completion 不能只记录“某个 GM 地址达到某个值”，至少还要记录 engine 或 backend opaque handle。否则 SDMA 可以工作，URMA 路径会被迫伪装成不存在的普通 counter。

推荐把 completion condition 抽象为：

```text
CompletionCondition
    task_token
    engine:
        SDMA
        URMA
        ROCE
        CCU
    condition_type:
        VALUE_EQUALS
        CQ_CONSUMED
        BACKEND_EVENT
    payload:
        VALUE_EQUALS:
            addr
            expected_value
        CQ_CONSUMED:
            cq_handle
            expected_count
        BACKEND_EVENT:
            opaque_event_handle
```

这样 `PTO2DeferredCompletionEntry` 里已有的 `engine` 字段可以继续服务 SDMA 路径，同时给 URMA/CQ 留出扩展空间。

## 7. Send/Receive Runtime

### 背景

`SEND_RECV_RUNTIME.md` 的动机是让 receive queue 成为 orchestrator 的一等输入，支持 MoE dispatch token、persistent loop、completion queue。

### 目标抽象

```text
RecvQueue
    poll()
    try_pop()
    release()
    reset_pool()

SendEndpoint
    send()
    send_empty()

CompletionQueue
    push()
    try_pop()

RunRecvLoop
    recv -> process -> submit_next_level -> completion token
```

### 后端矩阵

| backend | 目标 |
| --- | --- |
| A5 URMA | jetty/JFR/CQ，尽量满足连续 message buffer |
| A2/A3 RoCE | SRQ + RC QP 或等价机制 |
| 单机 HCCS/shmem | ring + signal |
| 多机 TCP | host fallback，不承诺 device zero-copy |

### 当前状态

这是设计草案，尚未在主线看到统一 `RecvQueue` / `SendEndpoint` / `RunRecvLoop` 实现。

### 设计取舍

HCCL `HcclSend` / `HcclRecv` 是配对通信 API，不能直接当成 persistent queue。Send/Receive Runtime 更接近 runtime 自己定义的消息队列抽象，底层可以选择 HCCL/HCOMM/URMA/RoCE/TCP 后端。

可执行的第一阶段 API 可以先收敛成：

```cpp
struct RecvQueueConfig {
    uint32_t queue_depth;
    uint32_t max_message_bytes;
    uint32_t backend;
};

struct RecvCompletion {
    uint64_t sequence;
    uint32_t status;
    uint32_t bytes;
    uint32_t source_rank;
    uint64_t backend_cookie;
};

RecvQueueHandle recv_queue_create(const RecvQueueConfig *);
int recv_queue_post(RecvQueueHandle, void *buffer, size_t bytes);
int recv_queue_poll(RecvQueueHandle, RecvCompletion *out, int max_entries);
int send_endpoint_send(SendEndpointHandle, const void *buffer, size_t bytes);
```

这不是最终 API，只是为了明确抽象边界：上层看到 queue、buffer、completion；backend 决定它实际用 HCCL P2P、URMA Jetty/JFR、RoCE 还是 TCP。

## 8. Platform 解耦

### 背景

PR #592 明确指出 HCCL backend 依赖 CANN-private symbols。2026-04-30 聊天记录进一步提到，某些通用服务器节点可能不是 AI 服务器，simpler 仍要能在没有 CANN 的服务器上运行。

### 目标

```text
host-only control runtime
    no full CANN required if only managing remote workers

device runtime backend
    requires ACL/CANN/device libs

comm backend
    may depend on UB/URMA/RoCE/HCCL libs
    should be loaded/selected separately
```

### 设计取舍

把所有能力放进一个 `.so` 使用简单，但会让通用服务器部署、CANN 版本兼容、CI、stub backend 变得脆弱。拆分 ABI 增加工程复杂度，但能让 control plane 在更多环境运行。
