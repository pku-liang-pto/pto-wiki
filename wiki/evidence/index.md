---
title: "Evidence"
type: index
status: draft
sources: []
last_updated: 2026-05-04
---

# Evidence

This area holds topic-scoped evidence ledgers. Evidence pages are not source-material libraries and do not copy whole materials. They record source sets, material routing, repository anchors, GitHub references, claim maps, negative findings, and open questions that support synthesized topic pages.

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
