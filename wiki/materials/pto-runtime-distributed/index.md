---
title: "PTO Runtime Distributed Material Bundle"
type: index
status: draft
sources:
  - wiki/materials/pto-runtime-distributed/
last_updated: 2026-05-05
---

# PTO Runtime Distributed Material Bundle

本目录公开保留 PTO Runtime distributed 材料包的 Markdown 文件。它们现在承担双重角色：一方面是 public source-material library，用来追溯本轮 wiki rewrite 的输入；另一方面也是公开学习材料，读者应该能直接在本目录读懂背景、术语、设计蓝图、风险和证据边界，而不是被不断推回外部源码。

学习页面已经把主要知识综合到 [Distributed Execution](../../topics/distributed-execution.md)、[PTO Examples](../../examples/pto/) 和 [simpler Runtime Architecture](../../topics/simpler-runtime-architecture.md)。这些 synthesized pages 仍是当前状态的 canonical layer；本目录提供更接近原材料的长篇上下文。二者的差别不是“材料可以粗略、学习页才精细”，而是：材料页按材料包顺序解释设计语境，学习页按读者任务重新组织知识。

其中 [PTO Runtime 分布式拓展文档系统设计](./PTO-Runtime分布式拓展文档系统设计.md) 是本轮 standalone-learning rewrite 的写作参照：它强调背景先行、目标读者清楚、feature deep dive 要有 design/status/risk/code/evidence、复杂流程用 ASCII 图解释、中文叙述保留 English technical identifiers。后续 Examples、Topics、Repository chapters 和 Materials pages 都应学习它的组织方式，但不能把材料整段复制成 synthesized wiki 内容。

Canonical raw artifact 仍是 `materials/pto-runtime-distributed.zip`，其 checksum 记录在 [Distributed Execution Evidence](../../evidence/distributed-execution.md#source-set)。本目录中的 Markdown 文件是为了公开渲染而移动到 `wiki/materials/` 的 public copy；后续允许为了自包含阅读而补充定义、图示、source-shaped pseudocode、外部背景引用和更清楚的状态说明。若修改会改变材料原本的状态判断或证据解释，必须在 [Wiki Log](../../log.md) 或 evidence ledger 记录，不允许 silently rewrite material meaning。

## Files

- [00 Overview and Reading Paths](./00_README.md)
- [01 Hardware, CANN, HCCL, RoCE](./01_hardware_and_software_stack.md)
- [02 PTO-ISA and Runtime Basics](./02_pto_isa_and_runtime_basics.md)
- [03 Distributed Runtime Blueprint](./03_distributed_blueprint.md)
- [04 Feature Deep Dives](./04_feature_deep_dives.md)
- [05 Progress and Timeline](./05_progress_and_timeline.md)
- [06 Development Tasks](./06_development_tasks.md)
- [07 Source and Evidence Notes](./07_source_notes.md)
- [08 HostWorker / DistWorker Alignment](./08_top_level_design_alignment.md)
- [PTO Runtime 分布式拓展文档系统设计](./PTO-Runtime分布式拓展文档系统设计.md)

## Reading Rule

材料中的 remote L3、DistWorker、RoCE/URMA control plane 和 cross-host callable registry 仍按 wiki evidence labels 判断：没有 stable source/test/example 前，学习页面必须写成 `design-intended` 或 `open question`，不能写成已实现能力。

材料可以作为学习正文来读，也可以作为 claim source 来审计；这两个角色要分开。读者想学设计背景，可以直接读本目录；维护者想改 Examples/Topics/Repositories，必须把材料内容重新综合成当前 source-backed page，并在 paired evidence ledger 记录状态边界。

材料页首次引入不常见缩写或平台词时，应就地解释，例如 `RoCE`、`RDMA`、`URMA`、`HCCL`、`HCOMM`、`HCCS`、`GM`、`CQ`、`QP`。外部链接可以支持解释，但不能代替解释。
