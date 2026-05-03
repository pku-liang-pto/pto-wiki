# 02. PTO-ISA 与当前 PTO-Runtime 基础

本章解释当前 PTO-Runtime 的工作方式，以及为什么分布式拓展会打破它的隐含假设。

## 1. PTO-ISA 在系统中的位置

根据 `overview.jpg` 的图片理解，PTO-ISA 位于 pypto frontend / PTOAS 和底层 runtime/platform 之间，为 orchestration、incore interface 和设备侧通信原语提供接口。可以用下面的纯文本图理解：

```text
pypto frontend
    |
    +-- Tensor Programming Frontend
    +-- Orchestration and Incor(e) Frontend
    +-- PTOAS
           |
           v
        PTO-ISA
           |
           v
distributed runtime / simpler runtime / platform
```

PTO-Runtime 依赖 PTO-ISA 的地方主要有：

1. 设备侧通信原语：例如通知、等待、异步搬运。
2. 异步完成表达：例如 AsyncEvent、completion counter、CQ 或 event record。
3. AICore 与 AICPU 之间传递 runtime async context 的 ABI。

根据本次拉取的 `pto-isa` 仓库 `4e27a10`，通信指令参考位于 `agents/skills/pto-comm-isa-reference/`。其中 `SKILL.md` 明确把 `TPUT_ASYNC` 和 `TGET_ASYNC` 定义为通过 SDMA/URMA 引擎执行 GM 到 GM 的 DMA 传输，并返回 `AsyncEvent`；`references/core-types.md` 中的 `AsyncEvent` 带有 `DmaEngine engine` 字段；`references/async-instructions.md` 说明默认 SDMA 构建使用 `BuildAsyncSession<DmaEngine::SDMA>`，URMA 构建仅面向 Ascend950 / `NPU_ARCH 3510`。

因此，本文后续把 PTO-ISA 异步能力理解为：

```text
PTO-ISA async communication
    |
    +-- TPUT_ASYNC / TGET_ASYNC
    |       return AsyncEvent
    |
    +-- DmaEngine::SDMA
    |       default engine, A2/A3 path, HCCL workspace/session involved
    |
    +-- DmaEngine::URMA
            A5 / Ascend950 path, URMA workspace/session involved
```

根据 `pto-isa/demos/baseline/allgather_async/README_zh.md`，A2/A3 demo 1-3 使用 SDMA 引擎，A5 demo 4-6 使用 URMA / HCCP V2 Jetty RDMA。这与聊天记录中“SDMA 和 URMA completion 机制不同，不能写死成同一种 counter”的判断一致。

把 PTO-ISA 的异步接口压缩成自包含的伪代码如下：

```cpp
enum class DmaEngine {
    SDMA,
    URMA,
};

struct AsyncEvent {
    uint64_t handle;
    DmaEngine engine;

    bool valid() const;
    bool Wait(const AsyncSession &session) const;
    bool Test(const AsyncSession &session) const;
};

template <DmaEngine engine = DmaEngine::SDMA, typename Dst, typename Src>
AsyncEvent TPUT_ASYNC(Dst &remote_dst, Src &local_src, const AsyncSession &session);

template <DmaEngine engine = DmaEngine::SDMA, typename Dst, typename Src>
AsyncEvent TGET_ASYNC(Dst &local_dst, Src &remote_src, const AsyncSession &session);
```

关键语义：

1. `TPUT_ASYNC` 是异步远程写：本地 GM 到远端 GM。
2. `TGET_ASYNC` 是异步远程读：远端 GM 到本地 GM。
3. 两者立即返回 `AsyncEvent`，不表示数据已经完成。
4. `Wait` 是 quiet 语义：多次异步调用后，对最后一个 event `Wait` 可以等待此前 pending 的传输完成。
5. SDMA 路径的完成更接近 flag/event record；URMA 路径的完成更接近 CQ polling。
6. SDMA/URMA 都要求 host 侧先准备对应 workspace；URMA 还涉及大页内存和 MR 注册约束。

## 2. 当前 Worker 层级

根据 `20260414 分布式Runtime.pdf` 的图片理解，早期设计把 Worker 概括为：

```text
Worker API:
    init
    run
    close
    malloc
    free

Worker = Orch + Sch + WorkerManager

WorkerManager:
    ChipWorker x N
    SubWorker  x M
```

会议纪要也说明，Worker 有 chip/cheap worker 和 SUB worker 两种。ChipWorker 面向真实 device；SUB worker 是软件概念，用来跑 Python 函数或 C++ 程序，不需要真实 device id。

当前主线 `python/simpler/worker.py` 的 docstring 也给出三种用法：

1. L2：一个 NPU chip。
2. L3：多个 chips + SubWorkers。
3. L4：递归组合，把 L3 Worker 当成 child。

当前 Python 层的注册和嵌套 worker API 形状可以简化为：

```python
def register(self, fn: Callable) -> int:
    if self.level < 3:
        raise RuntimeError("Worker.register() is only available at level 3+")
    if self._initialized:
        raise RuntimeError("Worker.register() must be called before init()")
    cid = len(self._callable_registry)
    self._callable_registry[cid] = fn
    return cid

def add_worker(self, worker: "Worker") -> None:
    if self.level < 4:
        raise RuntimeError("Worker.add_worker() requires level >= 4")
    if self._initialized:
        raise RuntimeError("Worker.add_worker() must be called before init()")
    if worker._initialized:
        raise RuntimeError("Child worker must not be initialized before add_worker()")
    self._next_level_workers.append(worker)
```

这段代码表达了两个非常强的本地假设：

1. callable registry 必须在 `init()` 前完成，因为 child 通过 fork/COW 继承 registry。
2. child Worker 也必须在父进程 `init()` 前加入，因为嵌套进程树要在后续 fork 中建立。

remote L3 不能依赖这两个假设，必须有显式 `register` 和 `launch/connect` 协议。

## 3. 当前本地层次化执行路径

根据 `python/simpler/worker.py` 主线代码，L3/L4+ 的 `_start_hierarchical()` 大致做：

```text
Worker.init()
    |
    v
_init_hierarchical()
    |
    +-- allocate sub worker mailboxes
    +-- allocate chip worker mailboxes
    +-- allocate next-level worker mailboxes
    +-- construct _Worker before fork
            |
            v
_start_hierarchical()
    |
    +-- fork SubWorker processes
    +-- fork ChipWorker processes
    +-- fork next-level Worker children
    +-- wait chip bootstrap if configured
    +-- register mailboxes into C++ _Worker
    +-- start Scheduler + WorkerThreads
```

这条路径有一个重要约束：**fork 必须发生在 C++ scheduler/worker threads 启动之前**。因为 child 进程要继承已经 mmap 的 HeapRing、Python callable registry 和 mailbox shared memory。

主线实现的核心控制流可以用更接近代码的方式理解：

```text
_start_hierarchical()
    registry = self._callable_registry

    for each sub worker:
        os.fork()
            child -> _sub_worker_loop(mailbox, registry)

    for each chip worker:
        os.fork()
            child -> _chip_process_loop(mailbox, device_id, libs...)

    for each next-level Worker:
        os.fork()
            child:
                inner_worker.init()
                _child_worker_loop(mailbox, registry, inner_worker)

    parent:
        wait chip bootstrap if enabled
        register child mailboxes into C++ _Worker
        start scheduler and worker threads
```

这里 `registry` 是 Python dict，mailbox 是 shared memory，child 进程由 `os.fork()` 复制出来。远端 L3 不会共享这些对象，所以必须把“registry 内容”和“mailbox 消息”改成可序列化、可传输、可版本化的协议。

## 4. Mailbox 协议

根据主线 `src/common/hierarchical/worker_manager.h`，PROCESS mode 使用统一 mailbox layout：

```text
4096B mailbox

offset 0   state: IDLE / TASK_READY / TASK_DONE / SHUTDOWN / CONTROL_REQUEST / CONTROL_DONE
offset 4   error code
offset 8   callable or control command
offset 16  CallConfig or control arg0
...
offset N   TaskArgs blob
tail 256B  error message
```

Mailbox state 只有：

```text
IDLE
TASK_READY
TASK_DONE
SHUTDOWN
CONTROL_REQUEST
CONTROL_DONE
```

根据 `RUNTIME_OPEN_PROBLEMS.md`，这意味着当前 child worker 通信是“派发一个任务，等待完成”的模型。CONTROL 与 TASK 复用同一 mailbox 区域，按注释是互斥使用的。它并不是一个可以在 task 运行期间持续交换消息的 queue。

关键 mailbox 常量和状态可以内联理解为：

```cpp
enum class MailboxState : int32_t {
    IDLE = 0,
    TASK_READY = 1,
    TASK_DONE = 2,
    SHUTDOWN = 3,
    CONTROL_REQUEST = 4,
    CONTROL_DONE = 5,
};

static constexpr size_t MAILBOX_SIZE = 4096;
static constexpr ptrdiff_t MAILBOX_OFF_STATE = 0;
static constexpr ptrdiff_t MAILBOX_OFF_ERROR = 4;
static constexpr ptrdiff_t MAILBOX_OFF_CALLABLE = 8;
```

一个 task dispatch 的语义是：

```text
parent:
    wait state == IDLE
    write callable/config/args
    state = TASK_READY

child:
    wait state == TASK_READY
    run callable
    write error/result
    state = TASK_DONE

parent:
    observe TASK_DONE
    consume result/error
    state = IDLE
```

这个协议简单稳定，但它没有 message stream、backpressure、in-flight receive queue，也没有 task 运行期间的半双工/全双工消息交换。

## 5. Callable 身份的当前状态

根据主线 `python/simpler/worker.py`，`Worker.register(fn)` 已存在，但限制是：

1. 只允许 level >= 3。
2. 必须在 `init()` 前调用。
3. 返回递增的 callable id。
4. `_callable_registry` 在 fork 前建立，child 通过 COW 继承。

根据主线 `src/common/hierarchical/orchestrator.h`：

1. `submit_next_level(uint64_t callable, ..., int8_t worker = -1)` 使用 `uint64_t callable`。
2. `submit_sub(int32_t callable_id, ...)` 使用 callable id。

也就是说，NEXT_LEVEL 和 SUB 的 callable 身份仍是双轨制：chip callable 更偏裸指针/handle，sub callable 更偏 registry id。这是 remote L3 需要重新设计的重点之一。

当前 C++ Orchestrator 暴露的核心提交 API 是：

```cpp
SubmitResult submit_next_level(
    uint64_t callable,
    const TaskArgs &args,
    const CallConfig &config,
    int8_t worker = -1
);

SubmitResult submit_next_level_group(
    uint64_t callable,
    const std::vector<TaskArgs> &args_list,
    const CallConfig &config,
    const std::vector<int8_t> &workers = {}
);

SubmitResult submit_sub(int32_t callable_id, const TaskArgs &args);
SubmitResult submit_sub_group(int32_t callable_id, const std::vector<TaskArgs> &args_list);
```

这段 API 说明：

1. NEXT_LEVEL callable 仍是 `uint64_t`，通常来自 Python 传入的 chip callable handle/pointer。
2. SUB callable 是 `int32_t callable_id`，来自 `Worker.register()`。
3. NEXT_LEVEL 已经有 `worker` affinity 参数；SUB 目前没有同等显式 worker 参数。
4. 对 remote L3 来说，`uint64_t callable` 必须被替换或封装成稳定 `callable_id/code_id`，否则远端无法解释这个值。

## 6. TensorMap、child memory 与 worker affinity

根据 GitHub PR #579 和主线代码，当前已经合入：

1. `child_memory` flag：允许 device-resident tensor buffer 通过 L3 task pipeline，而不做冗余 H2D。
2. `TensorKey{ptr, worker}`：用 `{device pointer, worker id}` 复合 key 区分不同 NPU 上可能相同的 device VA。
3. scheduler worker affinity：`submit_next_level(worker=0)` 和 `submit_next_level_group(workers=[...])` 可以把任务约束到指定 next-level worker。
4. `orch.malloc(worker_id, size)`：可以在指定 next-level worker 上分配 memory。

这是分布式设计里非常关键的一步，因为它承认 worker 不是完全同构池：某些 tensor 或 weight 可能驻留在特定 worker 上，依赖它的任务必须调度到对应 worker。

`TensorKey` 的结构很小，但语义重要：

```cpp
struct TensorKey {
    uint64_t ptr;
    int8_t worker;  // -1 = host, 0..N-1 = next-level worker logical id
};
```

为什么不能只用 `ptr`？因为不同 NPU 上的 device VA 可能相同。比如：

```text
worker 0 device ptr = 0x10000000
worker 1 device ptr = 0x10000000
```

如果 TensorMap 只用 `ptr` 做 key，这两个 tensor 会被误认为同一个依赖。`TensorKey{ptr, worker}` 把“地址”和“地址属于哪个 worker”绑定起来，是后续 remote worker address 的前身。

## 7. CommContext 与 comm window

根据主线 `src/common/platform_comm/comm_context.h`，`CommContext` 包含：

```text
workSpace
workSpaceSize
rankId
rankNum
winSize
windowsIn[COMM_MAX_RANK_NUM]
windowsOut[COMM_MAX_RANK_NUM]
```

完整字段语义如下：

```cpp
struct CommContext {
    uint64_t workSpace;      // device-side workspace base
    uint64_t workSpaceSize;  // workspace size in bytes

    uint32_t rankId;         // current logical rank
    uint32_t rankNum;        // number of ranks in this comm domain
    uint64_t winSize;        // per-rank communication window size
    uint64_t windowsIn[COMM_MAX_RANK_NUM];
    uint64_t windowsOut[COMM_MAX_RANK_NUM];
};
```

主线代码用 `static_assert` 锁住 `CommContext` 的大小和字段 offset。原因不是普通 C++ 洁癖，而是这个结构被 host、HCCL private context、AICore/AICPU 设备代码同时消费。任何字段顺序变化都可能导致 device 侧按旧 offset 读错 window 地址。

根据 PR #592 和主线 `src/a2a3/platform/onboard/host/comm_hccl.cpp`，A2/A3 onboard HCCL backend 通过 `comm_init`、`comm_alloc_windows` 等接口初始化 HCCL communicator 和 device-side CommContext。`comm_alloc_windows` 内部涉及 `HcclAllocComResourceByTiling` 和拓扑相关解析。

根据 2026-04-17 聊天记录，项目讨论中的 bootstrap 流程是：

```text
每个 L2 worker:
    comm_init
    comm_alloc_windows
    得到 local window / device CommContext
        |
        v
L3:
    收集每个 rank 的 window / context 信息
        |
        v
每个 L2:
    收到完整通信域 context
        |
        v
AICore:
    通过 CommContext 找 peer window
```

主线代码中 `python/simpler/task_interface.py` 的 `ChipWorker.bootstrap_context()` 已经能在 chip bootstrap 中执行 `comm_init` 和 `comm_alloc_windows`，并返回 `ChipContext`。

`bootstrap_context()` 的效果可以简化成：

```text
ChipWorker.bootstrap_context(cfg)
    |
    +-- if cfg.comm exists:
    |       handle = comm_init(rank, nranks, rootinfo_path)
    |       device_ctx = comm_alloc_windows(handle, window_size)
    |
    +-- allocate / stage configured buffers
    |
    +-- return ChipContext(
            buffers = ...,
            comm_handle = handle,
            device_comm_context = device_ctx
        )
```

这解释了为什么 PR #592 对分布式很关键：它让 L3 可以在 chip child 启动阶段拿到每个 L2 的通信上下文，再把完整上下文喂给 kernel 使用。

## 8. Deferred completion 当前模型

根据 GitHub PR #670、#692、#700 和 issue #686，deferred completion 的主线状态是：

1. kernel 可以通过 async context 注册 completion condition。
2. runtime/scheduler 在 kernel normal completion 后检查 deferred ingress。
3. 如果 ingress 中有条件，则任务进入 async wait list，等条件满足后才释放依赖。
4. PR #700 移除了 submit-time deferred flag，改成始终传 async context，让 kernel 是否注册条件决定是否 deferred。

主线中关键文件包括：

```text
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/pto_async_kernel_api.h
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/pto_async_wait.h
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/pto_completion_ingress.h
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/scheduler/scheduler_completion.cpp
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/scheduler/scheduler_dispatch.cpp

对应 a5 路径同构存在。
```

根据主线 `pto_async_wait.h`，async wait 条件带有 engine，例如 SDMA、URMA。根据聊天记录，SDMA async event 和 URMA CQ completion 的实现机制不同，后续统一 API 必须保留 engine 信息，而不能写死为一种 counter。

deferred completion 的核心数据结构可以压缩为：

```cpp
struct PTO2DeferredCompletionEntry {
    uint64_t addr;
    uint32_t expected_value;
    uint32_t engine;
    int32_t completion_type;
};

struct PTO2DeferredCompletionIngressBuffer {
    volatile uint32_t count;
    volatile int32_t error_code;
    PTO2DeferredCompletionEntry entries[PTO2_MAX_COMPLETIONS_PER_TASK];
};

struct PTO2AsyncWaitEntry {
    PTO2TaskSlotState *slot_state;
    PTO2TaskId task_token;
    PTO2CompletionCondition conditions[PTO2_MAX_COMPLETIONS_PER_TASK];
    int32_t condition_count;
    int32_t waiting_completion_count;
    bool normal_done;
};
```

流程语义是：

```text
scheduler dispatch:
    prepare per-dispatch async context
    pass context to kernel

kernel:
    if it launches async work:
        write completion condition into ingress buffer

scheduler completion:
    normal kernel completion arrives
    inspect ingress buffer
        no entry -> task complete now
        has entry -> move task into async_wait_list

poll loop:
    test condition by engine
    when all conditions satisfied -> release task dependencies
```

PR #700 的设计意义是：orchestration 不再提前说“这个 task deferred”。runtime 每次都给 kernel async context，实际是否 deferred 由 kernel 是否注册 condition 决定。

## 9. 当前架构为什么不能直接变成分布式

根据 `RUNTIME_OPEN_PROBLEMS.md`，当前本地层次化 runtime 依赖以下隐含假设：

```text
本地 fork 模型
--------------
parent process
    |
    +-- child process

共享:
    Python registry via COW
    HeapRing mmap VA
    mailbox shared memory
    raw pointer callable
    ContinuousTensor.data raw VA
```

远端 L3 模型中这些都不成立：

```text
远端模型
--------
Host A parent runtime
    |
    | network control plane
    v
Host B remote L3 runtime

不共享:
    Python heap
    registry dict
    mmap VA
    raw callable pointer
    local process signals
```

所以分布式拓展必须显式设计：

1. remote worker lifecycle。
2. callable id / code package / registration protocol。
3. tensor metadata and memory ownership。
4. remote dispatch protocol。
5. async child communication / send-recv queue。
6. failure and cancellation。
