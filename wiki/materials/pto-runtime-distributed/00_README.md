# PTO-Runtime 分布式拓展学习与接手文档

> 第一版状态：基于当前目录资料、图片理解、GitHub `hw-native-sys/simpler` 主线与 PR/issue 核对、公开资料整理。
> 生成时间：2026-05-03。
> 目标读者：已经理解 PTO-Runtime 非分布式部分，但需要接手分布式拓展设计和开发的人。

## 1. 这套文档解决什么问题

这套文档回答四类问题：

1. **目标蓝图是什么**：分布式 PTO-Runtime 最终要如何分层、调度、通信、注册 callable、处理异步完成。
2. **背景知识是什么**：华为 Ascend 硬件、超节点、CANN/HCCL/HCOMM/URMA/RoCE、PTO-ISA 与 PTO-Runtime 的关系。
3. **当前进度是什么**：哪些能力已经合入 `hw-native-sys/simpler` 主线，哪些仍是 open PR、讨论线索或待实现任务。
4. **接下来怎么开发**：后续开发任务、依赖关系、关键代码路径、验证方式和风险。

写法上，本文档不使用 Mermaid。所有关键图都用纯文本/ASCII 风格表达，便于在 Markdown、终端、代码 review 和聊天工具中直接阅读。

## 2. 两条阅读路线

### 2.1 学习路线

如果你主要想补齐背景，按这个顺序读：

```text
[00_README]
    |
    v
[01_hardware_and_software_stack]
    |
    v
[02_pto_isa_and_runtime_basics]
    |
    v
[03_distributed_blueprint]
    |
    v
[04_feature_deep_dives]
```

### 2.2 开发接手路线

如果你要尽快开始接手开发，按这个顺序读：

```text
[03_distributed_blueprint]
    |
    v
[05_progress_and_timeline]
    |
    v
[06_development_tasks]
    |
    v
[04_feature_deep_dives]
    |
    v
[02_pto_isa_and_runtime_basics]
```

## 3. 文件地图

| 文件 | 作用 |
| --- | --- |
| `00_README.md` | 总览、阅读路线、术语速查、当前最重要结论 |
| `01_hardware_and_software_stack.md` | 华为硬件、超节点、CANN/HCCL/HCOMM/URMA/RoCE 背景 |
| `02_pto_isa_and_runtime_basics.md` | PTO-ISA、当前 PTO-Runtime、Worker、Mailbox、TensorMap、异步完成基础 |
| `03_distributed_blueprint.md` | 目标蓝图：分层架构、control/data plane、remote L3、comm domain、send/recv runtime |
| `04_feature_deep_dives.md` | 重点特性逐项详解：需求、设计、代码、状态、取舍、风险 |
| `05_progress_and_timeline.md` | PR/issue/聊天记录/会议纪要整理出的真实进度 |
| `06_development_tasks.md` | 后续任务清单、依赖、改动范围、验收标准 |
| `07_source_notes.md` | 资料来源、可信边界、图片理解说明 |
| `08_top_level_design_alignment.md` | 纳入 top-level HostWorker/DistWorker 设计，并与当前主线对齐 |

## 3.1 自包含阅读约定

这套文档的目标不是“告诉读者去哪里查”，而是把接手开发需要知道的事实尽量写在正文里。外链和路径只承担两个作用：

1. **溯源**：说明某个结论来自哪里，便于后续重新核对。
2. **深入验证**：当读者要改代码、查 ABI drift、看完整 PR diff 时，可以回到原始仓库。

正文应尽量包含下面四类信息：

```text
概念定义       例如 GM、rank、comm window、AsyncEvent 是什么
接口形状       例如 comm_init / comm_alloc_windows / submit_next_level 的参数语义
关键代码摘录   例如 CommContext、TensorKey、MailboxState、AsyncEvent 的结构
设计推论       例如为什么本地 fork 模型不能直接变成 remote L3
```

如果某段仍只给了路径而没有解释，那应该被视为文档缺口，而不是读者的问题。

## 4. 当前最重要的结论

### 4.1 分布式拓展不是单一功能，而是一组互相耦合的能力

根据 `RUNTIME_OPEN_PROBLEMS.md` 的代码调研，当前 runtime 有四个核心 gap：

1. 没有通过 RoCE/网络管理远端 next-level worker 的能力。
2. Callable 注册还没有贯穿 L2 / mailbox / AICPU / remote L3。
3. 现有 child worker 通信主要是同步 mailbox dispatch，缺少和正在运行的 child worker 异步交换数据的机制。
4. platform 层 Runtime / ACL / Comm 仍有 ABI 与部署耦合，通用服务器无 CANN 运行会放大这个问题。

这些 gap 会互相牵连。例如 remote L3 需要 callable 注册和远程 worker 生命周期；send/recv 长循环需要 child worker 异步通信；通用服务器要求会倒逼 platform 解耦。

新增纳入的 top-level design 文档进一步补充了一个重要判断：L3/HostWorker 的目标不是另起一套 DAG，而是同构复用 L2 的 scope、ringbuffer、tensormap 和 submit 模型；L4+ 则是同构递归扩展。也就是说，后续设计 remote L3 时要沿着统一 Worker / DistWorker 树继续扩展，而不是把 remote runtime 做成和现有 Orchestrator 并列的新系统。

### 4.2 目标蓝图应先于当前进度

本项目的文档叙事采用“目标蓝图优先”。也就是先讲最终应该如何设计，再逐项映射到当前状态：已合入、open PR、讨论中、待实现。

这样做的原因是，聊天记录和 PR 历史中存在很多临时命名、拆 PR、回滚、重构、接口收缩。如果先按时间线读，很容易把局部实现当成最终目标。

### 4.3 当前 `simpler` 主线已经合入若干关键基座

根据 GitHub PR 状态核对：

| PR/Issue | 状态 | 关键内容 |
| --- | --- | --- |
| [#571](https://github.com/hw-native-sys/simpler/pull/571) | merged | L3 FFN TP parallel end-to-end demo，展示两阶段 orch、跨 rank scratch window、allreduce_sum |
| [#579](https://github.com/hw-native-sys/simpler/pull/579) | merged | `child_memory`、`TensorKey`、scheduler affinity、`orch.malloc(worker_id, size)` |
| [#592](https://github.com/hw-native-sys/simpler/pull/592) | merged | HCCL backend for `comm_*` C API、`CommContext`、硬件 UT |
| [#670](https://github.com/hw-native-sys/simpler/pull/670) | merged | a2a3/a5 deferred completion 支持 |
| [#686](https://github.com/hw-native-sys/simpler/issues/686) | closed | deferred completion 从 kernel 注册 wait condition 推断，而不是 submit-time flag |
| [#692](https://github.com/hw-native-sys/simpler/pull/692) | merged | deferred notification API 对齐 |
| [#700](https://github.com/hw-native-sys/simpler/pull/700) | merged | always pass async context，移除 submit-time deferred flag，关闭 #686 |
| [#696](https://github.com/hw-native-sys/simpler/pull/696) | open | a2a3 SDMA async completion，仍未合入 |

这说明“分布式基座完全没有开始”是不准确的；但“remote L3、统一 send/recv runtime、platform 解耦、URMA completion 完整统一”仍不能视为已完成。

### 4.4 现有 L3/L4 层级仍强依赖本地 fork 与共享内存

根据 `python/simpler/worker.py` 主线代码，L3/L4+ 的 `_start_hierarchical()` 仍通过 `os.fork()` 创建 sub worker、chip worker 和 next-level Worker child。根据 `src/common/hierarchical/worker_manager.h`，PROCESS mode 仍通过 4096B shared-memory mailbox 传 `(callable, config, args_blob)`。

这对本地多进程层次化是合理的，但不能直接推广到远端 L3，因为远端进程不共享父进程地址空间，也不能继承 Python registry、HeapRing mmap 或裸指针 callable。

把这句话展开成 runtime 形状，大致是下面这样：

```text
Local L3/L4 hierarchical start, implemented shape
-------------------------------------------------
parent Worker process
  1. 建立 Python-side callable registry
  2. mmap / allocate HeapRing, TensorMap, mailbox 等本机共享对象
  3. os.fork()

child process after fork
  4. 继承 parent 当前进程的地址空间快照
  5. 看到同一批 Python registry entries 和 mmap-backed objects
  6. 进入 child worker loop，等待 parent 通过 mailbox 派发任务

PROCESS mailbox payload, source-shaped
--------------------------------------
state       : IDLE | TASK_READY | TASK_DONE | SHUTDOWN | ERROR
callable    : parent/child 本地都能解释的 callable pointer 或 callable id
config      : serialized CallConfig / worker dispatch config
args_blob   : serialized TaskArgs / argument bytes
result_blob : child 写回的返回值或错误摘要
```

这里的关键不是 `fork` 这个系统调用本身，而是它给了 runtime 一个“本机继承”的便利条件：child 启动时已经拥有和 parent 对齐的地址解释、Python 对象身份、mmap 映射、文件描述符和部分 runtime registry。mailbox 只需要传很短的任务描述，因为大量上下文已经通过 fork 继承好了。

远端 L3 的问题正好相反：

```text
Remote L3 target shape
----------------------
host A parent Worker
  cannot fork host B
  cannot assume host B has same Python object addresses
  cannot send a raw callable pointer to host B
  cannot rely on one mmap object being visible on both hosts

host B remote L3 Worker
  must be launched/discovered by another mechanism
  must receive a stable callable name/id plus versioned registration data
  must allocate or attach its own local HeapRing/TensorMap/mailbox resources
  must report liveness, errors, and completion back over a host-to-host control plane
```

因此，“通过 RoCE 网络管理远端 L3”不能理解成把现在的 shared-memory mailbox 换成网络 socket 就结束。需要重新定义至少四层语义：远端进程生命周期、callable 注册协议、参数与 Tensor identity 的可序列化表达、失败与资源回收。RoCE/RDMA 只可能提供某些跨 host 数据通路或低延迟传输能力，不会自动提供这些 control-plane 语义。

### 4.5 HCCL/comm window 已是已合入基座，但它不是完整 remote L3 管理

根据 PR #592 与主线 `src/a2a3/platform/onboard/host/comm_hccl.cpp`，项目已经有 `comm_init`、`comm_alloc_windows`、`comm_barrier`、`comm_destroy` 等 platform comm API，并通过 HCCL/private hcomm 能力生成 `CommContext`。这解决的是 L2/L1 侧通信窗口和通信域问题。

但 remote L3 管理还需要 host-to-host control plane：远端进程发现、启动、心跳、任务派发、callable 注册、错误处理、资源回收。这不是 HCCL window 自身能解决的。

## 5. 术语速查

| 术语 | 英文/别名 | 本项目含义 |
| --- | --- | --- |
| PTO-Runtime | runtime, simpler runtime | 支撑 orchestration、task dispatch、TensorMap、worker 层级和设备执行的运行时 |
| PTO-ISA | instruction/runtime interface | PTO 的设备侧通信/异步/内核接口栈，runtime 需要依赖其事件、counter、URMA/SDMA 等能力 |
| L1 | AICore kernel | 真正执行计算或通信指令的 kernel 层 |
| L2 | ChipWorker, AICPU runtime | 单 NPU chip 上的调度/执行层，常由 AICPU runtime 管理 AICore task |
| L3 | host worker, multi-chip worker | host 侧管理多个 L2 chip worker 和 sub worker 的层 |
| L4+ | parent worker, POD-level worker | 更高层的 Worker，可以把 L3 Worker 当成 next-level child |
| ChipWorker | cheap worker, chip child | 面向真实 device 的 worker。会议纪要中也出现 Cheap Worker 的说法，应理解为 chip/device 侧 worker |
| SUB Worker | sub worker, host sub process | 软件 worker，用于运行 Python/C++ host 任务，不对应真实 device id |
| next-level worker | child worker | 当前 Worker 的下一层 worker，可以是 chip worker，也可以是嵌套 Worker |
| callable | function, orch fn, chip callable | 被 runtime 派发执行的函数/代码实体。当前 NEXT_LEVEL 和 SUB callable 身份表达仍不完全统一 |
| rank | logical rank | 通信任务组内的逻辑编号，不应等同于物理 device id |
| device id | physical device id | 真实 NPU 设备编号，例如 0、1、4、5 |
| comm window | HCCL window, shared window | 通信域内各 rank 暴露给 peer 访问的 device buffer/window |
| CommContext | device comm context | 设备侧通信上下文，包含 rank、rankNum、window 地址数组等 |
| deferred completion | async completion | kernel 返回后任务并不立即完成，而是等异步条件满足后才释放依赖 |
| completion ingress | deferred ingress | kernel 向 runtime 注册异步完成条件的 per-dispatch buffer |
| control plane | 控制面 | host 侧 worker 管理、callable 注册、任务派发、心跳等 |
| data plane | 数据面 | L2/L1 数据通信、comm window、HCCL/HCOMM/URMA/RoCE 数据通路 |

## 6. 最小全局图

```text
                         serving-lib / model serving
                                   |
                                   v
                       pto-lib / model-specific logic
                                   |
                                   v
             +---------------------------------------------+
             | pypto frontends                             |
             |                                             |
             |  Tensor Programming Frontend                |
             |  Orchestration and Incor(e) Frontend        |
             |  PTOAS                                      |
             +----------------------+----------------------+
                                    |
                                    v
             +---------------------------------------------+
             | distributed runtime extension               |
             |                                             |
             |  Worker hierarchy / remote L3 / comm domain |
             |  callable registry / async completion       |
             |  send-recv run_loop                         |
             +----------------------+----------------------+
                                    |
                                    v
             +---------------------------------------------+
             | simpler                                     |
             |  Runtime                                    |
             |  Platform: cpu-sim / npu-onboard            |
             +----------------------+----------------------+
                                    |
                       +------------+-------------+
                       |                          |
                       v                          v
                    OS utils                    CANN
```

上图来自 `overview.jpg` 的图片理解，并按当前文档目标重绘为纯文本结构。

## 7. 如何阅读“来源”

本文档不使用独立编号的证据索引。正文会在必要位置直接说明来源，例如：

- “根据 `RUNTIME_OPEN_PROBLEMS.md` 的代码调研……”
- “根据 2026-04-17 聊天记录……”
- “根据 GitHub PR #700……”
- “根据华为昇腾 HCCL API 文档……”

如果某个结论只来自聊天记录，会明确标为“讨论线索”或“待代码确认”，不会写成已实现事实。
