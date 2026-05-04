# 08. Top-Level Design 对齐：HostWorker / DistWorker

本章纳入 `hengliao1972/pypto_top_level_design_documents` 中的 `simpler_distributed_runtime_design.md`。该文档标题是 “Simpler Distributed Runtime: HostWorker / DistWorker Implementation Design”，定位为给 pypto / linqu 上层开发者理解 simpler 分布式执行能力的 Phase 2 HostWorker 设计说明。

它不是当前 `hw-native-sys/simpler` 主线的逐行现状说明，而是重要的上层目标设计输入。需要同时看到两件事：

1. 它冻结了早期 HostWorker / DistWorker 的核心抽象：统一 `IWorker.run()`、L3 复用 L2 的 scope/ringbuffer/tensormap/submit 模型、fork+shm HostSubWorker、递归 Worker 组合。
2. 当前主线已经在若干细节上演进：例如 mailbox 从文档里的 256B HostSubWorker mailbox 演进到统一 4096B PROCESS mailbox；当前 `Worker.register(fn)` 只收 callable，不是示例里的 `register(name, fn)`；当前远端 L4+ 仍不是主线已完成能力。

## 1. 层级定义

来源文档给出的层级定义是：

| Level | Resource | Orchestration | Implementation |
| --- | --- | --- | --- |
| L1 | 单 AICore，AIC/AIV | 无 orchestration | Kernel binary，由 L2 调度 |
| L2 | 单 Chip，多 AICore | AICPU 上 C++ orch | ChipWorker，文档标为 completed |
| L3 | 单 Host，多 Chips | Host CPU 上 Python orch | HostWorker / DistWorker，Phase 2 |
| L4+ | 多 Host | 同构扩展 | Future |

这与本文档系统的分层一致：L3 是单 host 多 chip 的 host worker，L4+ 是跨 host 或 POD 级组合。

## 2. 三条核心原则

来源文档明确写了三条原则，可以翻译成当前项目语言：

```text
1. Isomorphic with L2
   L3 复用 L2 的执行模型：scope + ringbuffer + tensormap + submit。
   不为 L3 发明独立 DAG 系统。

2. Unified Worker model
   每一层 Worker 都暴露相同的阻塞 run(task/payload) 接口。
   调用者不需要知道下面是 AICore、ChipWorker、SubWorker 还是 DistWorker。

3. Do not modify simpler L0-L2
   L3+ 在 simpler 现有 L0-L2 能力上构建，不破坏已有 L2 代码。
```

这三条原则解释了为什么当前主线会把 L3/L4+ 设计成递归 Worker 树，而不是另起一套分布式 DAG runtime。

## 3. 统一 IWorker / Worker.run 模型

来源文档给出的统一接口是：

```cpp
class IWorker {
 public:
    virtual ~IWorker() = default;
    virtual void run(const WorkerPayload& payload) = 0;
};
```

核心语义是：`run(payload)` 在 worker 自己的执行上下文里阻塞，直到这个 task 完成。Scheduler 只负责路由任务，不亲自执行 task body。

来源文档中的 Worker 层级是：

```text
IWorker
    run(payload)
        |
        +-- ChipWorker
        |       L2 hardware
        |       run() = blocking C API call
        |
        +-- SubWorker
        |       fork/shm Python function
        |       run() = write mailbox + spin-poll until TASK_DONE
        |
        +-- DistWorker
                any-level node
                run() = execute(host_task) with internal orch + drain
                L3: sub_workers = ChipWorker x N + SubWorker x M
                L4: sub_workers = DistWorker(level=3) x K + SubWorker x M
```

这个模型和当前文档系统的目标蓝图一致：L4+ 不直接管理所有 L2，而是把 L3 Worker 当成 next-level worker 递归组合。

## 4. DistWorker Scheduling Engine

来源文档把 L3 Phase 2 的组件拆成：

| Component | Location | Language | Responsibility |
| --- | --- | --- | --- |
| Orch | 主进程主线程 | Python 调 C++ | submit、TensorMap、fanin wiring、scope |
| Scheduler | 主进程 C++ 专用线程 | C++ | ready queue -> worker task queue；completion queue -> fanout release |
| ChipWorker threads | 主进程，每 device 一个 C++ thread | C++ | pop task -> blocking `run()` -> push completion |
| SubWorker threads | 主进程，每 SubWorker 一个 C++ thread | C++ | 写 mailbox、spin-poll `TASK_DONE`、push completion |
| HostSubWorker processes | fork 出来的子进程 | Python | poll mailbox、执行 callable、写 `TASK_DONE` |

核心通信模型是：

```text
Orch
    |
    | ready_queue.push
    v
Scheduler
    |
    | task_queue.push
    v
Worker thread
    |
    | run(payload) blocks
    v
completion_queue.push + cv.notify
    |
    v
Scheduler
    |
    | fanout release / ring release
    v
new ready tasks
```

这段对当前接手开发很重要，因为它说明 L3 与 L2 的差异：

```text
L2:
    AICPU runtime 轮询 AICore COND register / hardware completion。

L3:
    host 有线程能力，所以 worker thread 完成后 push completion_queue，
    Scheduler 通过 condition variable 被唤醒。
```

因此，L3 不需要像 L2 那样对 worker completion 做硬件寄存器轮询；它的问题变成线程队列、CV、mailbox 和 process lifecycle。

## 5. HostSubWorker fork + shm 设计

来源文档比较了三种 HostSubWorker 实现方案：

| Approach | GIL Parallel | Tensor Zero-Copy | Callable Constraints |
| --- | --- | --- | --- |
| C++ thread + `gil_scoped_acquire` | 否，Python 串行 | 是 | 无 |
| spawn new process | 是 | 否，需要序列化 | callable 必须可 pickle |
| fork + shm | 是 | 是 | 无，fork 前已在内存中 |

采用 fork+shm 的原因是：

1. fork 后每个 child process 有独立 GIL，可以并行跑 Python callable。
2. fork 前注册 callable，child 通过 COW 继承 callable registry，不需要 pickle lambda/closure。
3. tensor 可以通过 `/dev/shm` 或 `share_memory_()` 实现物理页共享。

关键约束是：**fork 必须在任何 C++ thread 启动前完成**。来源文档的初始化顺序是：

```text
HostWorker.__init__()
    1. user registers callables
    2. allocate shm mailbox
    3. fork M HostSubWorker processes
    4. create C++ HostWorkerEngine
    5. create ChipWorker x N
```

当前主线 `python/simpler/worker.py` 仍保留这个原则：`_start_hierarchical()` 先 fork sub/chip/next-level child，再启动 C++ scheduler/worker threads。

## 6. Mailbox：来源设计与当前主线差异

来源文档里的 HostSubWorker mailbox 是 256B：

```text
offset 0:   int32 state        IDLE=0, TASK_READY=1, TASK_DONE=2, SHUTDOWN=3
offset 4:   int32 callable_id
offset 8:   int64 args_shm_fd
offset 16:  int64 args_offset
offset 24:  int64 result_addr
offset 32:  int32 error_code
offset 64:  char[192] error_msg
total: 256 bytes
```

当前主线已经演进为统一 PROCESS mailbox，大小是 4096B，并且状态增加了 control path：

```text
IDLE
TASK_READY
TASK_DONE
SHUTDOWN
CONTROL_REQUEST
CONTROL_DONE
```

差异的含义：

1. 256B mailbox 是早期 HostSubWorker 专用设计，更适合解释 fork+shm 的最小 PoC。
2. 4096B mailbox 是当前主线统一 NEXT_LEVEL/SUB/CONTROL 的实现事实。
3. 后续 remote L3 设计不能照搬 256B mailbox；应该把 mailbox 语义抽象成 task/control protocol，再根据 local process 或 remote session 选择 transport。

## 7. TensorMap、Scope、Ring 的所有权模型

来源文档明确 L3 不维护独立 DAG，依赖仍由 TensorMap 自动推断：

```text
submit()
    for each INPUT tensor:
        TensorMap lookup -> find producer -> create fanin dependency

    for each OUTPUT tensor:
        TensorMap insert -> register current task as producer

    if fanin_count == 0:
        task becomes READY

task completion:
    walk fanout list
    release consumers
    newly ready consumers enter ready_queue
```

数据所有权表：

| Data Structure | Ownership | Accessed By | Protection |
| --- | --- | --- | --- |
| TensorMap | Orch exclusive | only submit | no lock needed |
| Scope stack | Orch exclusive | submit / scope begin/end | no lock needed |
| Task slot state | shared | Orch + Scheduler | per-task mutex + atomic |
| Ready queue | shared | Orch push + Scheduler pop | mutex + CV |
| Completion queue | shared | Worker push + Scheduler pop | mutex + CV |
| Ring flow control | shared | Orch alloc + Scheduler release | atomic + CV |
| Worker task queue | Scheduler -> Worker | Scheduler push + Worker pop | per-worker mutex |
| SubWorker mailbox | thread <-> forked child | MAP_SHARED | acquire/release store |

这补充了当前文档系统里一个重要结论：L3 的“分布式”不是另起 DAG，而是继续使用 L2 风格的 TensorMap + ring + scope，把 worker 从 AICore 扩展成 ChipWorker/SubWorker/DistWorker。

## 8. Scope 管理

来源文档把 L3 scope 设计成与 L2 同构：

```text
scope_begin:
    record current task position
    scope_stack_top++

task submitted inside scope:
    acquire scope reference

scope_end:
    iterate tasks in scope
    release scope reference

when fanout_refcount reaches fanout_count:
    task transitions to CONSUMED
    heap/ring memory becomes reclaimable
```

这解释了为什么 L3 不能只做“submit 一批 task 然后等待”：它还需要管理 host-side intermediate tensor 的生命周期，否则跨多阶段 orch 的中间 buffer 要么过早释放，要么永不释放。

## 9. Worker Factory 与递归组合用法

来源文档建议所有 level 都通过统一 factory 创建：

```python
worker = Worker(level=x, ...)
worker.register(fn) -> int
worker.init()
worker.run(task)
worker.close()
```

L3 组合形态：

```text
Worker(level=3)
    chip_workers = Worker(level=2, device_id=...)
    num_sub_workers = M
```

L4 组合形态：

```text
Worker(level=4)
    dist_workers = [
        Worker(level=3, chip_workers=[...]),
        Worker(level=3, chip_workers=[...]),
    ]
```

这与当前主线 `Worker.add_worker(worker)` 的递归思想一致，但来源文档里的示例 API 与当前主线不完全一致。当前主线更接近：

```python
w4 = Worker(level=4, ...)
w4.add_worker(w3_child)
w4.init()
w4.run(...)
```

## 10. 与 Linqu Runtime 的关系

来源文档把 simpler runtime 定位为 Linqu runtime 的实现层：

```text
L4+ DistWorker (future)
    submit(DIST, ...) to L3 nodes

L3 DistWorker
    submit(CHIP, ...) / submit(HOST_SUB, ...)

L2 ChipWorker / HostSubWorker
    C API / fork+shm

L0-L2 Runtime
    executes on device
```

对 PTO-Runtime 分布式拓展的意义是：

1. PTO-Runtime 的分布式扩展要服务上层 pypto/linqu，而不是只服务一个 demo。
2. simpler 的 L3+ 递归 Worker 是 Linqu/PyPTO 上层分布式语义的 runtime 承载。
3. remote L3/L4+ 不能破坏已有 L2 chip runtime，而应该通过统一 Worker 接口扩展。

## 11. 对齐结论

该 top-level design 强化了本文档系统已有的几个结论：

1. 目标蓝图应保持递归 Worker，而不是另起 DAG runtime。
2. L3 与 L2 应同构复用 TensorMap / Scope / Ring / Submit 思想。
3. fork-before-thread 是 HostSubWorker 的硬约束。
4. callable 必须 register-before-fork；remote L3 需要把这个隐式继承改为显式注册协议。
5. Scheduler 只路由 task，不执行 worker body；worker thread 自己阻塞在 `run()`。
6. L4+ 是 future/isomorphic extension；当前不能写成已完成 remote multi-host 能力。

需要谨慎解释的地方：

1. 来源文档里的 256B mailbox 是早期 HostSubWorker 设计；当前主线是 4096B unified mailbox。
2. 来源文档里的 `register(name, fn)` 示例不等于当前主线 API；当前主线 `Worker.register(fn)` 返回 id。
3. 来源文档说 “Do not modify simpler”，应理解为“不破坏 L0-L2 既有语义”；当前分布式扩展已经在 `simpler` 主线中增加 L3/L4 worker、comm、deferred completion 等能力。
4. 来源文档把 L4+ 标为 future；当前文档系统中 remote L3、multi-host control plane 也应继续标为目标/待实现，而不是已完成。
