---
title: "Developer Takeover Guide Evidence"
type: evidence
status: draft
sources:
  - materials/pto-runtime-distributed/
  - repositories/simpler/
  - repositories/pto-isa/
  - repositories/pypto/
last_updated: 2026-05-04
---

# Developer Takeover Guide Evidence

This ledger supports [Developer Takeover Guide](../topics/developer-takeover-guide.md).

## Source Set

| Source | Ref / checksum | Role |
| --- | --- | --- |
| `materials/pto-runtime-distributed/PTO-Runtime分布式拓展文档系统设计.md` | bundle SHA256 `aa8d92ae9892a6fbda4f9dbfb49111724ad61b286ca081f2a4f02d426a4634a0` | audience and writing-priority guidance |
| `materials/pto-runtime-distributed/00_README.md` | same bundle | runtime gaps and current state summary |
| `materials/pto-runtime-distributed/06_development_tasks.md` | same bundle | P0/P1/P2 follow-up task framing |
| repository profile pages | current wiki repo profiles | repo-specific reading order and boundaries |
| topic evidence pages | current `wiki/evidence/` | status labels and open questions |

## Claim Map

| Topic claim | Evidence | Destination |
| --- | --- | --- |
| Maintainers should start from non-distributed foundations before distributed topics. | material writing priority; PR review comments; non-distributed topic evidence. | [Developer Takeover Guide](../topics/developer-takeover-guide.md#first-week-reading-path) |
| Ownership boundaries should separate PyPTO DSL/codegen, PTO-ISA kernel layer, simpler runtime, and HCCL data-plane support. | repo profiles and [Distributed Execution Evidence](./distributed-execution.md). | [Developer Takeover Guide](../topics/developer-takeover-guide.md#ownership-boundaries) |
| Remote L3, collectives, async completion, and complete distributed NN example are high-risk areas. | material gaps, GitHub PR/issue map, examples evidence. | [Developer Takeover Guide](../topics/developer-takeover-guide.md#current-high-risk-areas) |

## Open Questions

- Which team or repo should own the first complete distributed NN example?
- Should maintainer onboarding eventually become a checklist with commands once stable examples are selected?
