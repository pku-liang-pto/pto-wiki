---
title: "Distributed Execution"
type: topic
status: draft
sources:
  - materials/pto-runtime-distributed/
  - repositories/simpler/
  - repositories/pto-isa/
  - repositories/pypto/
  - repositories/hccl/
  - wiki/evidence/distributed-execution.md
last_updated: 2026-05-04
---

# Distributed Execution

本页综合 PTO Runtime、PTO-ISA、PyPTO 和 HCCL 的分布式执行证据。当前实现的重心是 single-host L3、多 chip、HCCL/sim comm backend 和 PyPTO L3 runner；remote L3、跨 host DistWorker、RoCE/URMA control plane 属于目标设计。状态标签和 material/GitHub/source-file routing 记录在 [Distributed Execution Evidence](../evidence/distributed-execution.md)。

## 总体分工

```text
PyPTO DSL / IR / distributed codegen
        |
        v
simpler Worker(level=3) and orchestration runtime
        |
        +--> chip child process / AICPU orchestration
        |       |
        |       v
        |   PTO-ISA kernel code: tile compute + comm primitives
        |
        +--> SubWorker Python process
        |
        v
HCCL / sim comm backend for window, rank, barrier, remote pointer support
```

## Control Plane vs Data Plane

| 面 | 当前证据 | 状态 |
| --- | --- | --- |
| Local control plane | `simpler.Worker(level=3)`、fork child、mailbox、`submit_next_level`、`submit_sub` | `implemented` |
| Remote control plane | remote L3 worker discovery、remote callable registry、persistent run_loop、RoCE/HCOMM control channel | `design-intended` |
| Data plane | HCCL window、rank/window metadata、PTO-ISA `TPUT/TGET/TWAIT/TNOTIFY`、SDMA/URMA async demos | `implemented` at local/multi-chip level |
| Completion plane | deferred completion PRs merged；SDMA async completion PR still open | `implemented` + `emerging` |

## 当前可验证路径

1. PyPTO 编译 L3 hierarchy program，生成 host orchestration 入口。
2. `pypto.runtime.distributed_runner` 创建 `simpler.Worker(level=3)`。
3. `simpler` 在 `init()` 中 fork chip children/subworkers，并按 `ChipBootstrapConfig` 初始化 chip comm/window。
4. Host orchestrator 调用 `submit_next_level` 或 `submit_sub`。
5. Tensor args 经 `TaskArgs` 进入 scheduler，TensorMap 可发现 producer/consumer 依赖。
6. Chip kernel 使用 PTO-ISA tile/comm API；HCCL/sim backend 提供 window/rank/barrier。

这个路径的状态是 `implemented`，证据包括 `simpler` L3 examples、`pypto` L3 ST、PTO-ISA comm tests 和 HCCL-backed comm API。

## 目标分布式路径

材料包中的目标蓝图把 runtime 推向 remote L3：

```text
Host Orchestrator
  -> local L3 HostWorker
  -> remote DistWorker / remote L3 process
  -> remote chip workers
  -> HCCL/HCOMM/URMA/RoCE-backed data movement
```

目标能力包括：

- remote worker discovery and lifecycle
- callable registration across local/remote worker levels
- stable rank/device affinity model
- comm window bootstrap across process/host boundary
- persistent run_loop send/recv
- deferred completion across remote data movement
- platform runtime/ACL/Comm ABI decoupling

这些能力当前应标为 `design-intended`，除非后续仓库出现可运行 remote example 或合并 PR。

## HCCL 的位置

HCCL 是 supporting evidence，不是 PTO Runtime 的 control-plane 替代品。HCCL 公开 collective、send/recv、all-to-all 等 API，且 HCCL CMake target 包含 AIV collective/send/recv 实现。`simpler` 通过 comm C API 和 `CommContext` 把 HCCL window 暴露给 chip kernel；PTO-ISA 在 kernel 内通过 comm primitive 消费这些地址和同步能力。

因此：

- 可以说 HCCL 支撑 data-plane communication 和 window。
- 不应说 HCCL 已经实现 remote L3 worker lifecycle 或 callable registry。

## 关键状态表

| 主题 | 状态 | 证据 |
| --- | --- | --- |
| L3 host orchestration | `implemented` | `simpler/examples/workers/l3/README.md` |
| HCCL comm API backend | `implemented` | [simpler PR #592](https://github.com/hw-native-sys/simpler/pull/592)；`src/common/platform_comm/comm.h` |
| Device-resident tensor affinity | `implemented` | [simpler PR #579](https://github.com/hw-native-sys/simpler/pull/579)；`child_memory=True` examples |
| Deferred completion | `implemented` | [simpler PR #670](https://github.com/hw-native-sys/simpler/pull/670)、[#692](https://github.com/hw-native-sys/simpler/pull/692)、[#700](https://github.com/hw-native-sys/simpler/pull/700)；[issue #686](https://github.com/hw-native-sys/simpler/issues/686) |
| SDMA async completion | `emerging` | [simpler PR #696](https://github.com/hw-native-sys/simpler/pull/696) open |
| PyPTO L3 runner | `implemented` | `pypto/runtime/distributed_runner.py` |
| PyPTO orchestration collectives | `design-intended` | [pypto issue #1189](https://github.com/hw-native-sys/pypto/issues/1189) open |
| Remote L3 / DistWorker | `design-intended` | material blueprint; no stable repo implementation found |

这些状态判断的 claim map 见 [Distributed Execution Evidence](../evidence/distributed-execution.md#claim-map)。

## 阅读建议

- 想理解 repo 责任边界：先读 [simpler](../repositories/simpler.md)、[pto-isa](../repositories/pto-isa.md)、[pypto](../repositories/pypto.md)。
- 想看具体例子：读 [Examples Feature Map](./examples-feature-map.md)。
- 想对齐层级术语：读 [Lingqu Level Map](./lingqu-level-map.md) 和 [Distributed Execution Terms](../concepts/distributed-execution-terms.md)。

## 未决问题

- remote worker lifecycle 的 owner 和 API 边界尚未定稿。
- orchestration-level collective 先实现为 PyPTO sugar、runtime callable，还是 PTO-ISA primitive lowering 仍未确认。
- HCCL、HCOMM、URMA、RoCE 在目标 runtime 中的 backend boundary 需要后续代码证明。
