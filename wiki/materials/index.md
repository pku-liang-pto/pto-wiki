---
title: "Materials"
type: index
status: draft
sources:
  - wiki/materials/pto-runtime-distributed/
last_updated: 2026-05-05
---

# Materials

这里公开存放用户提供、并已经被 wiki 使用的 source materials。它们不是仓库里的无加工附件，而是可以直接阅读的 public learning materials：保留原始论述、PR timeline、材料覆盖和设计目标，同时补足读者需要的背景、术语解释、图示和状态边界。合成后的 Examples、Topics、Repositories 仍是 canonical wiki layer；Materials 负责让读者理解这些论述从哪里来、为什么这样组织、哪些地方仍是设计目标。

```text
Materials
  -> original/source-material narrative
Synthesized wiki pages
  -> current learning layer with status labels and source boundaries
Evidence ledgers
  -> audit trail for claims, checksums, PRs/issues, and negative findings
```

## How To Read This Area

Materials 是公开资料库，也是可读学习材料。读者可以直接阅读材料来理解原始设计语境和写作风格；维护者可以继续改进材料页的标题、定义、图示、source-shaped pseudocode 和解释密度。唯一不能改变的是状态边界：当材料与源码状态不同步时，以 Examples、Topics、Repositories 中带状态标签的 synthesis 为准。尤其是 remote L3、DistWorker、RoCE/URMA control plane 等内容，材料中可以是目标蓝图，学习页必须继续标成 `design-intended`，直到源码、测试或 PR 证据改变。

## PTO Runtime Distributed Bundle

材料包来自 2026-05-04 的 `materials/pto-runtime-distributed.zip`，已排除 `__MACOSX` 和 `._*` archive metadata。对应证据 ledger 见 [Distributed Execution Evidence](../evidence/distributed-execution.md)。

- [PTO Runtime Bundle Guide](./pto-runtime-distributed/)
- [00 Overview and Reading Paths](./pto-runtime-distributed/00_README.md)
- [01 Hardware, CANN, HCCL, RoCE](./pto-runtime-distributed/01_hardware_and_software_stack.md)
- [02 PTO-ISA and Runtime Basics](./pto-runtime-distributed/02_pto_isa_and_runtime_basics.md)
- [03 Distributed Runtime Blueprint](./pto-runtime-distributed/03_distributed_blueprint.md)
- [04 Feature Deep Dives](./pto-runtime-distributed/04_feature_deep_dives.md)
- [05 Progress and Timeline](./pto-runtime-distributed/05_progress_and_timeline.md)
- [06 Development Tasks](./pto-runtime-distributed/06_development_tasks.md)
- [07 Source and Evidence Notes](./pto-runtime-distributed/07_source_notes.md)
- [08 HostWorker / DistWorker Alignment](./pto-runtime-distributed/08_top_level_design_alignment.md)
- [PTO Runtime 分布式拓展文档系统设计](./pto-runtime-distributed/PTO-Runtime分布式拓展文档系统设计.md)
