---
title: "Distributed Execution Terms"
type: concept
status: draft
sources:
  - materials/pto-runtime-distributed/00_README.md
  - repositories/simpler/
  - repositories/pypto/
  - repositories/pto-isa/
last_updated: 2026-05-04
---

# Distributed Execution Terms

本页统一本轮 wiki 使用的分布式执行术语。英文 code identifier 保持原样；中文解释只用于帮助阅读。

| 术语 | 标准含义 | 状态 |
| --- | --- | --- |
| PTO Runtime | 本轮主要指 `simpler` 中的 worker/scheduler/task runtime，以及 PyPTO runner 调用它的路径 | `implemented` |
| PTO-ISA | tile/kernel instruction API；包括 compute 和 communication primitive | `implemented` |
| PyPTO | Python DSL、IR、pass、codegen 和 runtime-facing wrapper | `implemented` |
| `Worker(level=3)` | simpler 的 L3 host-level worker；fork chip children/subworkers | `implemented` |
| `Orchestrator` | 提交任务的函数/role，可调用 `submit_next_level` 或 `submit_sub` | `implemented` |
| `SubWorker` | 同层 Python callable worker；通常用于 host-side verification/reduce/postprocess | `implemented` |
| `ChipCallable` | simpler 中提交到 chip worker 的 callable package，包含 orchestration binary 和 children core callables | `implemented` |
| `CoreCallable` | AIC/AIV kernel callable | `implemented` |
| `TaskArgs` | runtime tensor/scalar 参数容器 | `implemented` |
| TensorMap | runtime 依据 tensor buffer identity 建立 producer/consumer 依赖的机制 | `implemented` |
| `child_memory` | 标记 tensor 指针已经是 child/device-visible memory，跳过常规 H2D 路径 | `implemented` |
| `CommContext` | device-visible rank/window metadata ABI | `implemented` |
| comm window | HCCL/sim backend 分配并暴露给 rank 的通信内存窗口 | `implemented` |
| rank | communicator 内的逻辑通信编号 | `implemented` |
| affinity | task/tensor 与 worker/device/rank 的绑定或调度偏好 | `implemented`/`emerging` |
| deferred completion | kernel/register wait condition 后由 runtime 延迟判定完成 | `implemented` |
| SDMA async completion | SDMA transfer 的异步完成语义 | `emerging` |
| remote L3 | 跨 host 或 remote process 的 L3 worker/control plane | `design-intended` |
| DistWorker | 材料中 remote/distributed worker 目标角色 | `design-intended` |
| HCCL | CANN collective communication library；本 wiki 只把它当 data-plane supporting evidence | `implemented` as dependency |
| HCOMM | 材料中更底层通信/transport 相关名词；本轮未深入源码确认 | `open question` |
| URMA/RoCE | remote memory/network data movement 相关目标能力；PTO-ISA 有 URMA async demo，remote runtime control plane 未完成 | `implemented` at primitive/demo level, `design-intended` at runtime level |

## 使用规则

- 写 `implemented` 分布式能力时，必须能落到源码、测试、示例或合并 PR。
- 写 remote L3、DistWorker、跨 host callable registry 时，默认使用 `design-intended`，除非后续出现可运行证据。
- 引用 HCCL 时，只说明 collective/window/data movement 支撑，不把它说成 PTO runtime scheduler。
