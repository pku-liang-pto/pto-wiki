---
title: "Materials"
type: index
status: draft
sources:
  - wiki/materials/pto-runtime-distributed/
last_updated: 2026-05-05
---

# Materials

这里公开存放用户提供、并已经被 wiki 使用的 source materials。它们既可直接阅读，也可以作为学习如何写长篇、结构化、source-backed 技术材料的参考。合成后的 Examples、Topics、Repositories 仍是 canonical wiki layer；Materials 保留原始论述、PR timeline、材料覆盖和设计目标，便于读者追溯。

```text
Materials
  -> original/source-material narrative
Synthesized wiki pages
  -> current learning layer with status labels and source boundaries
Evidence ledgers
  -> audit trail for claims, checksums, PRs/issues, and negative findings
```

## How To Read This Area

Materials 是公开资料库，不是 wiki 的最终答案。读者可以直接阅读材料来理解原始设计语境和写作风格，但当材料与源码状态不同步时，以 Examples、Topics、Repositories 中带状态标签的 synthesis 为准。尤其是 remote L3、DistWorker、RoCE/URMA control plane 等内容，材料中可以是目标蓝图，学习页必须继续标成 `design-intended`，直到源码、测试或 PR 证据改变。

## PTO Runtime Distributed Bundle

材料包来自 2026-05-04 的 `materials/pto-runtime-distributed.zip`，已排除 `__MACOSX` 和 `._*` archive metadata。对应证据 ledger 见 [Distributed Execution Evidence](../evidence/distributed-execution.md)。

- [Bundle overview](./pto-runtime-distributed/)
- [00 README](./pto-runtime-distributed/00_README.md)
- [01 Hardware and Software Stack](./pto-runtime-distributed/01_hardware_and_software_stack.md)
- [02 PTO ISA and Runtime Basics](./pto-runtime-distributed/02_pto_isa_and_runtime_basics.md)
- [03 Distributed Blueprint](./pto-runtime-distributed/03_distributed_blueprint.md)
- [04 Feature Deep Dives](./pto-runtime-distributed/04_feature_deep_dives.md)
- [05 Progress and Timeline](./pto-runtime-distributed/05_progress_and_timeline.md)
- [06 Development Tasks](./pto-runtime-distributed/06_development_tasks.md)
- [07 Source Notes](./pto-runtime-distributed/07_source_notes.md)
- [08 Top Level Design Alignment](./pto-runtime-distributed/08_top_level_design_alignment.md)
- [PTO Runtime 分布式拓展文档系统设计](./pto-runtime-distributed/PTO-Runtime分布式拓展文档系统设计.md)
