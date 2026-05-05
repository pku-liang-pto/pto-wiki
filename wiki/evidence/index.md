---
title: "Evidence"
type: index
status: draft
sources: []
last_updated: 2026-05-05
---

# Evidence

Evidence pages 是 topic-scoped audit ledger。它们不是主要学习章节，也不是 source-material library；读者应该先读 Examples、Topics、Repositories，再在需要核对 claim 时进入这里。Evidence pages 记录 source sets、material routing、repository anchors、GitHub references、claim maps、negative findings 和 open questions，帮助维护者判断 wiki 里的状态标签是否有依据。

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

- [Distributed Execution Evidence](./distributed-execution.md): evidence for the distributed execution synthesis, material routing, GitHub status labels, and negative findings.
- [Examples Feature Map Evidence](./examples-feature-map.md): evidence for the public Examples area, representative example ordering, and feature/status matrix.
- [Lingqu Level Map Evidence](./lingqu-level-map.md): evidence for Lingqu/PyPTO/runtime level alignment and implementation status labels.
- [Non-Distributed Execution Evidence](./non-distributed-execution.md): evidence for the normal PyPTO -> PTO-ISA -> simpler L2 execution path.
- [Developer Takeover Guide Evidence](./developer-takeover-guide.md): evidence for maintainer onboarding, ownership boundaries, and high-risk follow-up areas.
