---
title: "Overview"
type: overview
status: draft
sources:
  - config/target-set.yml
  - wiki/evidence/non-distributed-execution.md
  - wiki/evidence/distributed-execution.md
last_updated: 2026-05-04
---

# Overview

This page is the living synthesis for the configured target set. It should summarize durable knowledge that cuts across individual pages and help readers decide where to go next.

The current target set is defined in `config/target-set.yml`. The wiki starts as a map and grows through source-backed lookup, repository documentation, dependency analysis, and topic synthesis work.

## Current Shape

- [Projects](./projects.md) lists configured repositories and their target-set roles.
- [Toolchain Map](./toolchain-map.md) records the current high-level relationship map.
- [Repository Profiles](./repositories/) holds per-repository documentation as it is created.
- [Evidence](./evidence/) holds topic-scoped evidence ledgers for material, GitHub, and cross-repository claims.
- [Topics](./topics/) holds feature, workflow, behavior, and issue-family syntheses.
- [Concepts](./concepts/) holds reusable concepts, APIs, protocols, acronyms, and architecture ideas.
- [Glossary](./glossary.md) collects terms encountered during wiki growth.

## Positioning

This wiki must cover the whole PTO/PyPTO/simpler knowledge path, not only distributed runtime work. Non-distributed features are the basis: terms, normal execution, kernel programming, L2 launch, examples, and maintainer onboarding must stay visible as first-class pages.

Examples deserve high attention because they connect architecture to runnable understanding. The wiki should explain their background concepts, organize them from beginner to expert, compare similar examples across repositories, call out optimization techniques, and preserve TODO/design-intended gaps for examples that do not exist yet.

For a first reading, use [Basic Terms](./concepts/basic-terms.md) -> [Non-Distributed Execution](./topics/non-distributed-execution.md) -> [Examples Feature Map](./topics/examples-feature-map.md) -> [Repository Profiles](./repositories/) -> [Distributed Execution](./topics/distributed-execution.md). For a practical maintainer path, use [Developer Takeover Guide](./topics/developer-takeover-guide.md).

## Maintenance Notes

Update this page when new evidence changes the broad synthesis of the target set. Do not rewrite it for every small page edit.

## Current PTO Runtime Synthesis

当前阅读顺序应先从 non-distributed execution 开始：PyPTO 表达 DSL/IR/pass/codegen，PTO-ISA 提供 kernel-level tile instructions，simpler L2 负责 single-chip launch、AICPU scheduler 和 AICore/AIV execution。

在这层基础上，当前已验证的 distributed path 是 single-host L3 execution：PyPTO 表达 hierarchy programs，PyPTO distributed codegen/runner 调用 `simpler.Worker(level=3)`，`simpler` 管理 local host/chip/SubWorker execution，PTO-ISA 提供 kernel-level tile 和 communication primitives。HCCL 支撑 data-plane communication/window behavior，但不替代 PTO Runtime control plane。证据见 [Distributed Execution Evidence](./evidence/distributed-execution.md#claim-map)。

Remote L3、DistWorker、cross-host callable registration、RoCE/URMA-backed remote runtime control 在仓库证据改变前都记录为 `design-intended`，不能写成已实现能力；对应 negative findings 和 open questions 见 [Distributed Execution Evidence](./evidence/distributed-execution.md#negative-findings)。
