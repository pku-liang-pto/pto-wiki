---
title: "Distributed Execution Terms"
type: concept
status: draft
sources:
  - wiki/materials/pto-runtime-distributed/00_README.md
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

Status evidence for these rows is summarized from [Distributed Execution Evidence](../evidence/distributed-execution.md#claim-map), [Lingqu Level Map Evidence](../evidence/lingqu-level-map.md), and [Non-Distributed Execution Evidence](../evidence/non-distributed-execution.md).

## 使用规则

- 写 `implemented` 分布式能力时，必须能落到源码、测试、示例或合并 PR。
- 写 remote L3、DistWorker、跨 host callable registry 时，默认使用 `design-intended`，除非后续出现可运行证据。
- 引用 HCCL 时，只说明 collective/window/data movement 支撑，不把它说成 PTO runtime scheduler。

## Cross-Repository Name Map

同一个分布式概念在三个仓库里的名字不完全一致。写 wiki 时优先使用本页“术语”列的 canonical wording；引用源码时保留 source-native identifier。

| Canonical wording | simpler source wording | PyPTO source wording | PTO-ISA source wording | Status / evidence |
| --- | --- | --- | --- | --- |
| L2 chip execution unit | `Worker(level=2)`, `ChipWorker`, `ChipCallable`, `CoreCallable` | `CHIP`, `CORE_GROUP`, `AIC`, `AIV` levels in `Level` enum | kernel launch / PTO tile kernel | `implemented`; simpler `examples/workers/l2/*`, PyPTO `include/pypto/ir/function.h`, PTO-ISA baseline demos. |
| L3 host orchestration | `Worker(level=3)`, host `Orchestrator`, `submit_next_level`, `submit_sub` | HOST `Orchestrator`; distributed codegen emits `submit_next_level` and `submit_sub`; runner uses `Worker(level=3)` | not a runtime scheduler concept | `implemented` for single-host L3; simpler L3 examples and PyPTO distributed runner/tests. |
| Same-level Python callback | `SubWorker`, registered before `init()` | `Role::SubWorker`; generated Python host module collects subworker callables | not applicable | `implemented`; simple host-side reduce/verification path, not chip collective primitive. |
| Tensor argument dependency | `TaskArgs`, `TensorArgType`, TensorMap lookup/insert | generated `TaskArgs`, `TensorArgType`, `make_tensor_arg` in distributed codegen | tensor descriptors / `GlobalTensor` at kernel level | `implemented`; simpler orchestrator docs and PyPTO unit tests anchor the lowering. |
| Cross-rank communication memory | `ChipCommBootstrapConfig`, `ChipContext`, `CommContext`, comm window | runtime-facing distributed program passes tensor args into simpler; orchestration-level collective API still design-intended | `AsyncSession`, `TPUT_ASYNC`, `TGET_ASYNC`, `TNOTIFY`, `TWAIT` | data plane `implemented`; PyPTO collective API `design-intended` / `open question`. |
| Communication backend | HCCL backend or sim backend behind platform-neutral comm C API | backend selected indirectly through simpler runtime path | SDMA/URMA communication primitive demos | `implemented` as supporting data-plane; not the owner of runtime control flow. |
| Remote distributed worker | remote child worker / remote L3 target in material bundle | higher Lingqu levels and generated hierarchy are partially present | URMA/RoCE primitive direction, not callable registry | `design-intended`; material blueprint, no stable remote control-plane test in inspected source. |
| Lingqu level terminology | L0-L6 runtime model in docs/materials | `LevelToLinquLevel()` source-native identifier maps PyPTO enum to Lingqu level | not primary taxonomy | mixed: L3 implemented; L4-L6 mostly `design-intended` / `open question`. |
