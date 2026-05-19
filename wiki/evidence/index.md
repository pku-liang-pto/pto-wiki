---
title: "Evidence"
type: index
status: draft
sources: []
last_updated: 2026-05-19
---

# Evidence

Evidence pages 是 topic-scoped audit ledger。它们不是主要学习章节，也不是 source-material library；读者应该先读 Examples、Topics、Repositories，再在需要核对 claim 时进入这里。Evidence pages 记录 source sets、material routing、repository anchors、GitHub references、claim maps、negative findings 和 open questions，帮助维护者判断 wiki 里的状态标签是否有依据。

本区的写法规则是：先说明证据支持哪个 public page，再说明 source set、claim map、negative findings、open questions，以及什么证据会改变当前状态。它不替代正文解释；如果一个 learning page 只能靠 evidence table 才能读懂，应该修 learning page，而不是把 evidence ledger 写成教程。

## Status Labels

These labels describe the status of target-set claims across topic pages, repository profiles, and evidence ledgers:

| Label | Meaning |
| --- | --- |
| `implemented` | Source, test, example, documentation, or merged PR exists. It does not mean this wiki pass ran the code locally. |
| `emerging` | Open PR/issue, skipped test, partial implementation, or unstable interface exists. |
| `design-intended` | Materials or design docs describe the target, but stable source evidence is missing. |
| `TODO` | The wiki or target project explicitly lacks an example, guide, or implementation slice. |
| `stale` | Older issue/material exists but newer source, PR, or material supersedes it. |
| `inferred` | Architecture conclusion derived from source structure rather than explicit upstream wording. |
| `open question` | Evidence is insufficient, conflicting, or not yet inspected. |
| `not-run` | The example or command was documented from source/README evidence but not executed during the wiki pass. |

## Pages

- [QA Evidence](./qa/): raw QA histories for wiki-first answers, fresh research trails, open questions, and promotion status. It is audit material, not a primary public learning section.
- [Distributed Execution Evidence](./distributed-execution.md): evidence for the distributed execution synthesis, material routing, GitHub status labels, and negative findings.
- [NVIDIA Distributed Communication Evidence](./nvidia-distributed-communication.md): official NVIDIA documentation trail for multi-node, multi-GPU communication concepts used by the platform overview.
- [Examples Feature Map Evidence](./examples-feature-map.md): evidence for the public Examples area, representative example ordering, and feature/status matrix.
- [Lingqu Level Map Evidence](./lingqu-level-map.md): evidence for Lingqu/PyPTO/runtime level alignment and implementation status labels.
- [Non-Distributed Execution Evidence](./non-distributed-execution.md): evidence for the normal PyPTO -> PTO-ISA -> simpler L2 execution path.
- [Developer Takeover Guide Evidence](./developer-takeover-guide.md): evidence for maintainer onboarding, ownership boundaries, and high-risk follow-up areas.
- [Future Runtime Dispatch and Serving Roadmap Evidence](./future-runtime-dispatch-and-serving-roadmap.md): evidence for HostWorker / DistWorker design material, ongoing PR #711 remote L3 dispatch, host-memory tensor data-plane prototype, production data-plane target, A5 zero-copy dispatch, UBL128 serving design, and runtime open problems.

## Audit Boundary

Evidence ledger 可以证明某个 claim 为什么被写成 `implemented`、`emerging`、`design-intended`、`TODO`、`open question` 或 `not-run`。它不能单独提升 claim status。状态改变必须回到 source/test/example/PR/material evidence，并同步更新对应 public page。
