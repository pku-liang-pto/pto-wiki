---
title: "Developer Takeover Guide Evidence"
type: evidence
status: draft
sources:
  - wiki/materials/pto-runtime-distributed/
  - repositories/simpler/
  - repositories/pto-isa/
  - repositories/pypto/
last_updated: 2026-05-05
---

# Developer Takeover Guide Evidence

This ledger supports [Developer Takeover Guide](../topics/developer-takeover-guide.md).

Maintainer-facing knowledge lives in the guide itself. This ledger records why the guide emphasizes layer ownership, examples-first learning, high-risk status labels, and unprofiled-repository caution.

## Source Set

| Source | Ref / checksum | Role |
| --- | --- | --- |
| `wiki/materials/pto-runtime-distributed/00_README.md` | same bundle | runtime gaps and current state summary |
| `wiki/materials/pto-runtime-distributed/06_development_tasks.md` | same bundle | P0/P1/P2 follow-up task framing |
| repository profile pages | current wiki repo profiles | repo-specific standalone explanations and boundaries |
| topic evidence pages | current `wiki/evidence/` | status labels and open questions |

## Material Routing

| Material file | Details used | Destination |
| --- | --- | --- |
| `00_README.md` | current runtime gaps and remote-L3 caution | [Current High-Risk Areas](../topics/developer-takeover-guide.md#current-high-risk-areas) |
| `06_development_tasks.md` | P0/P1/P2 task categories and future-work framing | high-risk next actions and open questions |
| `07_source_notes.md` | source priority and trust boundary | definition of ready for new claims |

## GitHub / Review Evidence

| Reference | Role | Limitation |
| --- | --- | --- |
| [Distributed Execution Evidence GitHub table](./distributed-execution.md#github-evidence) | status labels for `simpler` / PyPTO distributed features | reflects the inspected PR/issue state recorded in that ledger |

## Claim Map

| Topic claim | Evidence | Destination |
| --- | --- | --- |
| Maintainers need a standalone layer model before making changes. | material runtime-gap summaries, repository profiles, and [Non-Distributed Execution Evidence](./non-distributed-execution.md). | [Developer Takeover Guide](../topics/developer-takeover-guide.md#maintainer-knowledge-model) |
| Ownership boundaries should separate PyPTO DSL/codegen, PTO-ISA kernel layer, simpler runtime, and HCCL data-plane support. | repo profiles and [Distributed Execution Evidence](./distributed-execution.md). | [Developer Takeover Guide](../topics/developer-takeover-guide.md#ownership-boundaries) |
| Remote L3, collectives, async completion, and complete distributed NN example are high-risk areas. | material gaps, GitHub PR/issue map, examples evidence. | [Developer Takeover Guide](../topics/developer-takeover-guide.md#current-high-risk-areas) |

## Negative Findings

- No profile currently exists for `distributed-runtime`, `hcomm`, `shmem`, `hixl`, `serving-lib`, `pto-li`, `ptoas`, or `cann-recipes-infer`; the takeover guide must not imply ownership for those repositories.
- Materials provide task categories, but the wiki does not copy them into a task tracker because implementation tasks need fresh source and issue verification.
- Hardware/NPU examples were not executed in this wiki pass; example command rows are documentation evidence unless marked otherwise.

## Open Questions

- Which team or repo should own the first complete distributed NN example?
- Should maintainer onboarding eventually become a checklist with commands once stable examples are selected?
