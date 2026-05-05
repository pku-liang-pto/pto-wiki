---
title: "PTO Runtime Distributed Material Bundle"
type: index
status: draft
sources:
  - wiki/materials/pto-runtime-distributed/
last_updated: 2026-05-05
---

# PTO Runtime Distributed Material Bundle

本目录公开保留 PTO Runtime distributed 材料包的原始 Markdown 文件。它们是 public source-material library：可直接阅读，也可用于学习如何组织长篇技术材料。学习页面已经把主要知识综合到 [Distributed Execution](../../topics/distributed-execution.md)、[PTO Examples](../../examples/pto/) 和 [simpler Runtime Architecture](../../topics/simpler-runtime-architecture.md)；需要核对原始论述时再回到这里。

原始材料文件保持内容完整，避免 wiki 在 public source-material library 中改写证据本身。后续如果需要修正材料里的状态判断，应在 synthesized wiki page 或 evidence ledger 中标注，而不是 silently rewrite material text。

## Files

- [00 README](./00_README.md)
- [01 Hardware and Software Stack](./01_hardware_and_software_stack.md)
- [02 PTO ISA and Runtime Basics](./02_pto_isa_and_runtime_basics.md)
- [03 Distributed Blueprint](./03_distributed_blueprint.md)
- [04 Feature Deep Dives](./04_feature_deep_dives.md)
- [05 Progress and Timeline](./05_progress_and_timeline.md)
- [06 Development Tasks](./06_development_tasks.md)
- [07 Source Notes](./07_source_notes.md)
- [08 Top Level Design Alignment](./08_top_level_design_alignment.md)
- [PTO Runtime 分布式拓展文档系统设计](./PTO-Runtime分布式拓展文档系统设计.md)

## Reading Rule

材料中的 remote L3、DistWorker、RoCE/URMA control plane 和 cross-host callable registry 仍按 wiki evidence labels 判断：没有 stable source/test/example 前，学习页面必须写成 `design-intended` 或 `open question`，不能写成已实现能力。
