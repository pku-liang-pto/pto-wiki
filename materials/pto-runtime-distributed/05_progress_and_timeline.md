# 05. 当前真实进度与时间线

本章按“已核对事实”和“聊天/会议线索”分层描述。PR 状态来自 GitHub `hw-native-sys/simpler`，聊天时间来自当前目录的 `chathistory_*.pdf` 转文本。

本次还纳入了 `hengliao1972/pypto_top_level_design_documents` 的 `simpler_distributed_runtime_design.md`。该文档是 HostWorker / DistWorker 的 top-level design 输入，主要用于解释 Phase 2 L3 设计目标；它不是当前主线逐行状态，因此本文把它放在“设计输入/对齐来源”而不是“已合入事实”。

## 1. GitHub 核对结果总表

本节把 PR 状态写成内联事实，避免读者必须打开 GitHub 才知道每个 PR 对系统有什么影响。状态来自本次 GitHub connector 核对；如果后续继续开发，应重新核对最新状态。

| 编号 | 状态 | 标题 | 对分布式拓展的意义 |
| --- | --- | --- | --- |
| [PR #571](https://github.com/hw-native-sys/simpler/pull/571) | merged, 2026-04-22 | Add L3 FFN TP parallel demo | 两阶段 orch demo；跨 rank scratch window；TensorMap 自动 producer/consumer edge |
| [PR #579](https://github.com/hw-native-sys/simpler/pull/579) | merged, 2026-04-18 | child_memory + TensorKey + scheduler affinity | 驻留 device tensor、指定 worker 调度、跨 NPU 地址消歧 |
| [PR #592](https://github.com/hw-native-sys/simpler/pull/592) | merged, 2026-04-20 | HCCL backend for comm_* C API | HCCL comm backend、CommContext、硬件 UT、CANN private ABI 依赖 |
| [PR #670](https://github.com/hw-native-sys/simpler/pull/670) | merged, 2026-04-27 | deferred completion in a2a3/a5 runtime | deferred completion 基座 |
| [Issue #686](https://github.com/hw-native-sys/simpler/issues/686) | closed, 2026-04-29 | infer deferred completion from registered conditions | 将 deferred 判断从 submit-time flag 转到 kernel 注册条件 |
| [PR #692](https://github.com/hw-native-sys/simpler/pull/692) | merged, 2026-04-28 | align deferred notification API | notification-counter wrapper/API 对齐 |
| [PR #696](https://github.com/hw-native-sys/simpler/pull/696) | open | a2a3 SDMA async completion | SDMA event-record completion，未合入 |
| [PR #700](https://github.com/hw-native-sys/simpler/pull/700) | merged, 2026-04-29 | simplify deferred completion context | always pass async ctx，移除 submit-time deferred flag，关闭 #686 |

## 2. 已合入能力

### 2.1 L3 FFN TP demo

根据 PR #571，`examples/workers/l3/ffn_tp_parallel/` 新增两阶段 demo：

```text
Stage 1: AIC matmul
    partial_local = x_shard @ w_shard

Stage 2: AIV allreduce-sum
    y = sum(partial_local[r])
```

PR 描述中特别强调：两个 stage 在同一个 `orch_fn` 里两次 `submit_next_level`，`partial_local` 通过 TensorMap 自动建立 producer/consumer edge，Python 侧不需要显式 barrier。

系统意义可以理解成：

```text
L3 Orchestrator
    |
    +-- submit rank-local FFN partition task
    +-- use scratch/comm window for cross-rank intermediate
    +-- submit reduction / combine stage
    +-- TensorMap tracks producer/consumer dependencies
```

它证明“L3 orchestration + L2 comm context + TensorMap dependency”这条路径能跑通，但没有证明 remote L3。因为 demo 的 worker 仍在当前 runtime 可管理的本地范围内。

相关文件：

```text
examples/workers/l3/ffn_tp_parallel/main.py
examples/workers/l3/ffn_tp_parallel/kernels/aic/kernel_local_linear.cpp
examples/workers/l3/ffn_tp_parallel/kernels/aiv/kernel_allreduce_sum.cpp
examples/workers/l3/ffn_tp_parallel/kernels/orchestration/*.cpp
```

### 2.2 child_memory、TensorKey、worker affinity

根据 PR #579，已合入：

```text
ContinuousTensor.child_memory
device_malloc_ctx / device_free_ctx / copy_to_device_ctx / copy_from_device_ctx
Orchestrator::malloc(worker_id, size)
TensorKey{ptr, worker}
submit_next_level(worker=...)
submit_next_level_group(workers=[...])
Scheduler affinity dispatch
```

对应主线关键文件：

```text
python/simpler/worker.py
python/simpler/orchestrator.py
src/common/hierarchical/orchestrator.h
src/common/hierarchical/orchestrator.cpp
src/common/hierarchical/scheduler.cpp
src/common/hierarchical/tensormap.h
src/common/hierarchical/types.h
src/common/worker/chip_worker.cpp
```

这解决了“worker 不是完全同构”的一部分问题。

从代码语义看，它引入的是“地址归属”概念：

```text
before:
    dependency key = ptr

after:
    dependency key = (ptr, worker)
```

这一步还不等于 remote tensor descriptor，但它给 remote tensor descriptor 铺路：未来只需要把 `worker` 从 `int8_t local_worker_id` 扩展为 `worker_address`。

### 2.3 HCCL comm backend

根据 PR #592，已合入：

```text
comm_init
comm_alloc_windows
comm_get_local_window_base
comm_get_window_size
comm_barrier
comm_destroy
```

主线文件：

```text
src/common/platform_comm/comm.h
src/common/platform_comm/comm_context.h
src/common/platform_comm/comm_sim.cpp
src/a2a3/platform/onboard/host/comm_hccl.cpp
tests/ut/cpp/hardware/test_hccl_comm.cpp
```

PR #592 同时指出这是 CANN-private coupling 的集中点，依赖 `libhcomm.so`、`HcclAllocComResourceByTiling`、`HcomGetCommHandleByGroup`、`HcomGetL0TopoTypeEx` 等。

能力边界可以内联写成：

```text
已解决:
    每个 rank 调 comm_init
    使用 rootinfo 建 HCCL communicator
    分配/解析 comm window
    生成 device-side CommContext

未解决:
    remote L3 process lifecycle
    remote callable registration
    remote task control protocol
    generic server without CANN deployment
```

### 2.4 Deferred completion 主线

根据 PR #670、#692、#700 与 issue #686：

```text
PR #670:
    add deferred completion in a2a3/a5 PTO runtime

Issue #686:
    propose inferring deferred completion from kernel-registered wait conditions

PR #692:
    align deferred notification API

PR #700:
    always pass async context through dispatch payload
    remove submit-time deferred flag
    close #686
```

主线关键文件：

```text
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/pto_async_kernel_api.h
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/pto_async_wait.h
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/pto_completion_ingress.h
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/scheduler/scheduler_completion.cpp
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/scheduler/scheduler_dispatch.cpp

src/a5/runtime/tensormap_and_ringbuffer/runtime/...
```

合并后的语义可以理解为：

```text
before:
    orchestrator says: this task is deferred

after:
    scheduler always passes async context
    kernel registers completion condition only when it actually launched async work
    runtime treats task as deferred only if condition exists
```

这是更可靠的边界，因为 orchestration 层不必提前知道 kernel 内部是否走了异步路径。

## 3. 未合入或未完成能力

### 3.1 PR #696：SDMA async completion

PR #696 当前仍 open。它计划：

1. 增加 a2a3 SDMA deferred completion。
2. 使用 PTO-ISA SDMA event records。
3. 增加 `pto2_defer_pto_async_event()`。
4. 增加 SDMA async completion demo。

这说明 SDMA event-record 路径尚不能视为主线完成。

它和已合入 deferred completion 的关系是：

```text
deferred completion framework:
    task 可以先 normal done，再等 async condition

SDMA async completion:
    给 SDMA TPUT/TGET 这类异步传输生成具体 condition

所以:
    framework merged 不等于 SDMA engine path fully merged
```

### 3.2 Remote L3 control plane

未见主线合入 remote WorkerManager mode、remote L3 session、remote callable register、remote task protocol。2026-04-29 聊天记录把“RoCE 网络管理远端 L3”列为 top 问题，并提到可用一个 16 卡节点模拟两个 8 卡 host 做验证。这是讨论线索。

当前缺口不是一个函数，而是一组协议：

```text
remote launch/connect
remote register callable
remote submit task
remote return completion/error
remote heartbeat
remote shutdown
remote resource cleanup
```

### 3.3 Unified Send/Receive Runtime

`SEND_RECV_RUNTIME.md` 已有统一 API 和 backend 草案，但主线未见 `RecvQueue`、`SendEndpoint`、`RunRecvLoop` 这类统一抽象落地。

### 3.4 Platform 解耦与通用服务器

2026-04-30 聊天记录转述廖博要求：一些节点是通用服务器而非 AI 服务器，simpler 要能在没有 CANN 的服务器运行。当前 PR #592 反而说明 HCCL backend 强依赖 CANN private pieces。因此这是待设计/待调研方向。

## 4. 聊天和会议时间线

### 2026-04-13 到 2026-04-15

关键线索：

1. 周哲发出分布式 runtime 新接口/功能材料。
2. 讨论 L3 调度引入后，多进程地址映射与 PyPTO2.0 不同。
3. 讨论 PR 过大，需要拆分。
4. `worker.py` 被确认是统一调用入口：`worker.run(callable, taskargs, config) -> call orch(worker.orch, taskargs)`。
5. 命名混乱被指出：`dist_orchestrator`、`orchestrator`、`src/common`、`src/a2a3/a5` 等。
6. 会议纪要明确 Worker 功能扩充、内存管理、通信机制、编程范式、scheduler 可编程等方向。

新增 top-level design 与这一阶段的会议/聊天线索吻合：它强调 Phase 2 HostWorker/DistWorker 以统一 `Worker.run()` 接口向上暴露，内部由 Orch、Scheduler、ChipWorker thread、SubWorker thread、forked HostSubWorker process 组成。它也明确 L4+ 是 future/isomorphic extension，这支持本文档把 remote L3/multi-host control plane 标为目标和待实现，而不是当前完成状态。

### 2026-04-15：logical rank 讨论

聊天记录集中讨论 rank 与 device id：

```text
错误方向:
    rank 固定绑定 physical device id

目标方向:
    rank 是任务组内 logical device id
    device id 是实际调度位置
```

这直接影响 tensor rank 维度、allreduce/allgather 和 SPMD group。

### 2026-04-17：comm window + bootstrap

关键线索：

1. 暂时不要加 worker malloc 的争论，后来 PR #579 单独合入了 worker malloc/free/copy。
2. 周哲描述 bootstrap：每个 L2 分配 window buffer，通过 mailbox 返回给 L3；L3 收集所有 rank 的 window，作为 context 传回每个 L2。
3. L2 通信时基于 context 找 peer window。
4. 讨论 comm buffer 需要驻留。
5. 讨论 rootinfo_path 和 barrier 文件 freshness/cleanup 问题，后续修复。

### 2026-04-18 到 2026-04-20

关键线索：

1. 廖博反馈：需要增加分配 API，L2 ring 增加 level 0 驻留内存。
2. L3 以上 submit orch task 增加 worker ID 参数，`-1` 随机，`>=0` 指定。
3. PR #579 合入 worker malloc/free/copy API。
4. PR #592 抽取 HCCL backend C API 和硬件 UT。
5. platform 功能 L1a/L1b 合入。

### 2026-04-22 到 2026-04-27

关键线索：

1. PR #571 的 FFN TP parallel demo 合入。
2. 讨论 `HcclAllocComResourceByTiling` 是否官方/稳定接口。
3. deferred completion PR #670 在 2026-04-27 merged。
4. 讨论廖博的四个 async API 与当前拆分式设计的关系。

### 2026-04-27 到 2026-04-29

关键线索：

1. issue #686 提出 deferred completion 由 kernel 注册条件推断。
2. PR #692 对齐 deferred notification API。
3. PR #700 合入，关闭 #686。
4. PR #696 提交 SDMA async completion，但截至本次核对仍 open。
5. 讨论 AICPU/AICore cache 一致性，AI review 提出的 invalidate/flush 风险被认为需要结合昇腾 cache 一致性机制判断。
6. 2026-04-29 把 remote L3 / RoCE 网络管理列为 top problem。

### 2026-04-30

关键线索：

1. 廖博要求关注通用服务器无 CANN 运行 simpler 的问题。
2. 讨论 UB Comm lib 是否可在通用服务器部署。
3. 讨论 `CommContext` 中 windowsIn/windowsOut 是否都需要保留；聊天中重新确认可能对应有向图/写入方向，需要继续谨慎。
4. 周哲提到“我们之前 L3 的做差不多了”，但 remote L3 top problem 仍未解决，因此应理解为本地 L3 基座，而不是完整分布式 control plane。

## 5. 图片资料理解

### 5.1 `overview.jpg`

图片显示软件栈：

```text
serving-lib
pto-lib
pypto
    Tensor Programming Frontend
    Orchestration and Incor(e) Frontend
    PTOAS
distributed runtime
Orchestration and Incor(e) Interface
PTO-ISA
simpler
    Runtime
    Platform (cpu-sim, npu-onboard)
OS utils / CANN
```

这用于确定本文档的软件栈背景图。

### 5.2 `20260414 分布式Runtime.pdf`

该 PDF 是图片型，已按用户要求使用图片理解，不使用 OCR。图片内容包括：

1. Worker API：init、run、close、malloc、free。
2. Worker = Orch + Sch + WorkerManager。
3. WorkerManager 管 ChipWorker x N 和 SubWorker x M。
4. 分层结构：L6 -> L5/L4/L3/L2 与 SubWorker 的树形组合。
5. Python Orchestration、subworker python、L2 C++ scheduler、AICore kernel、TensorMap/Ring/Regs/GM。
6. fork/shared-memory/mailbox 模型。
7. L4 到 remote L3 的示意。
8. SPMD / SYNC_START / group / rank 相关草图。
9. L2 scheduler 里 rank 0/1/2/3 与 TaskArgs、get_block_id 的示意。

这些内容支持“目标蓝图优先”的叙事，但具体代码实现仍以 GitHub 主线为准。
