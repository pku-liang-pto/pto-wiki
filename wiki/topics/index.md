---
title: "Topics"
type: index
status: draft
sources: []
last_updated: 2026-05-05
---

# Topics

Topics 是跨仓库学习章节。它们回答 repository profile 不能单独回答的问题：一个普通 PyPTO program 怎样跑完，`simpler` runtime 的 L2/L3 机制如何组合，distributed execution 的当前实现边界在哪里，Lingqu level 与代码 enum 如何对齐，以及维护者接手时该保护哪些边界。

本区页面应当直接讲知识，而不是把读者转去 evidence ledger。Evidence pages 只用于审计 source/material/PR/issue 依据。

## Pages

- [Non-Distributed Execution](./non-distributed-execution.md): 从 PyPTO DSL 到 PTO-ISA kernel，再到 `simpler` L2 single-chip launch 的普通执行闭环。
- [Examples Feature Map](./examples-feature-map.md): 解释 PTO examples 为什么按 expression、kernel、runtime、distributed partial 和 missing vertical slice 组织，并把每类例子连接到 repository source surfaces。
- [simpler Runtime Architecture](./simpler-runtime-architecture.md): `simpler` 上游 docs 的 self-contained runtime synthesis，覆盖 L2 三程序模型、L3+ Orchestrator/Scheduler/Worker、`TaskArgs`、TensorMap、mailbox 和 examples。
- [Distributed Execution](./distributed-execution.md): 跨仓库分布式执行综合说明，重点区分 implemented single-host L3、emerging PyPTO tests 和 design-intended remote L3。
- [Lingqu Level Map](./lingqu-level-map.md): Lingqu、PyPTO `Level` enum 与 runtime 层级如何对齐，以及 L1/L4+ 的证据边界。
- [Developer Takeover Guide](./developer-takeover-guide.md): 面向潜在维护者的接手顺序、safe first changes、ownership boundaries 和 high-risk areas。

示例的具体长章节放在公开 [PTO Examples](../examples/pto/) 区域；[Examples Feature Map](./examples-feature-map.md) 负责解释这些例子背后的组织逻辑和 cross-repository source relationship。
