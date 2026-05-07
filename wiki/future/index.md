---
title: Future
type: index
status: maintained
last_updated: 2026-05-07
---

# Future

Future 收纳已经具有持久学习价值、但尚未能写成 `implemented` behavior 的内容：ongoing work、roadmap、task division、planned feature、blocker、missing example、design-intended behavior。

这里不是 scratchpad。每个页面都需要说明目标、约束、当前状态、证据来源，以及它和现有 Repositories、Examples、Topics、Concepts 的关系。Raw QA histories 不放在这里；它们属于 [QA Evidence](../evidence/qa/)。

## Status Labels

- `planned`: 已有目标或路线，但尚未开始实现。
- `ongoing`: 正在进行，证据可能来自 issue、PR、branch、review comment 或 maintainer note。
- `blocked`: 有明确阻塞条件。
- `design-intended`: 设计材料说明了意图，但尚未验证为实现。
- `open question`: 证据不足或存在冲突。
- `superseded`: 后续证据替代了旧计划。
- `done`: 已经实现，应迁移或链接到对应 implemented page。

## Page Shape

Future 页面应该先解释背景和目标，再解释当前状态：

```text
current implemented foundation
  -> future objective
  -> constraints / blockers
  -> roadmap or task split
  -> evidence and status boundary
```

## Pages

- [Runtime Dispatch and Serving Roadmap](./runtime-dispatch-and-serving-roadmap.md): ongoing L4 -> remote L3 dispatch, L4/L3 tensor data plane, A5 send/receive zero-copy dispatch, UBL128 serving target, and runtime blockers.
- [PR 711 gRPC Dispatch Primer](./pr711-grpc-dispatch-primer.md): intuitive primer for gRPC/protobuf basics, generated stubs, L4 `RemoteWorkerProxy`, local mailbox shim, L3 `L3Daemon`, and current PR #711 proof boundaries.
