---
title: "Developer Takeover Guide"
type: topic
status: draft
sources:
  - materials/pto-runtime-distributed/
  - repositories/simpler/
  - repositories/pto-isa/
  - repositories/pypto/
  - wiki/evidence/developer-takeover-guide.md
last_updated: 2026-05-04
---

# Developer Takeover Guide

本页面向准备接手 PTO Runtime / PTO-ISA / PyPTO 工作的开发者和维护者。目标不是替代 repo README，而是给出接手顺序、边界判断、风险点和下一步工作入口。证据 ledger 见 [Developer Takeover Guide Evidence](../evidence/developer-takeover-guide.md)。

## First Week Reading Path

```text
Day 1: Basic Terms + Non-Distributed Execution
Day 2: simpler L0-L2 launch path and tensormap_and_ringbuffer
Day 3: PyPTO DSL -> IR -> compile/run
Day 4: PTO-ISA tile examples and comm primitives
Day 5: Distributed Execution + Lingqu Level Map + open questions
```

Start here:

1. [Basic Terms](../concepts/basic-terms.md)
2. [Non-Distributed Execution](./non-distributed-execution.md)
3. [simpler](../repositories/simpler.md)
4. [pypto](../repositories/pypto.md)
5. [pto-isa](../repositories/pto-isa.md)
6. [Distributed Execution](./distributed-execution.md)
7. [Examples Feature Map](./examples-feature-map.md)

## Ownership Boundaries

| Area | Primary owner mindset | Watch for |
| --- | --- | --- |
| PyPTO | compiler/runtime-facing DSL owner | whether a feature is syntax, IR lowering, codegen, or runtime execution |
| PTO-ISA | kernel instruction and operator-demo owner | whether a claim is kernel-level only or implies host scheduler behavior |
| simpler | runtime/worker/scheduler owner | whether behavior is L2 local, L3 single-host, or remote design-intended |
| HCCL / HCOMM / URMA | data-plane support evidence | do not treat comm backend as runtime control plane |

## Safe First Tasks

- Reproduce and document a non-distributed example: PyPTO hello world, PTO-ISA add/GEMM, or simpler L2 vector add.
- Trace one tensor from PyPTO `Orchestration` through generated artifact into simpler `TaskArgs`.
- Trace one `tensormap_and_ringbuffer` example from submit to TensorMap dependency wiring.
- Compare an L3 example with [Distributed Execution](./distributed-execution.md) and mark whether the claim is `implemented`, `emerging`, or `design-intended`.

## Maintenance Rules

- Preserve source-native code identifiers and file paths, even when product terminology uses corrected spelling.
- Treat materials as evidence inputs, not ground truth when source code disagrees.
- Status labels are part of the API of this wiki. Do not mark remote runtime behavior as `implemented` without a stable example, test, or merged PR.
- Keep raw materials in `materials/`; put topic evidence in `wiki/evidence/`.
- Update topic pages and evidence ledgers together when material/GitHub/cross-repo synthesis changes.

## Current High-Risk Areas

| Risk | Why it matters | Current status |
| --- | --- | --- |
| Remote L3 / DistWorker | Easy to overstate from design docs | `design-intended` |
| PyPTO collectives | API issues exist, but implementation boundary is not settled | `design-intended` / `emerging` |
| deferred + async completion | Multiple PRs exist; final ABI still needs follow-up | `implemented` + `emerging` |
| complete distributed NN example | Current evidence has complete NN non-distributed examples and distributed partial examples, but not complete distributed NN | `TODO` |

## Definition Of Ready For New Wiki Claims

Before adding a durable claim, capture:

- exact repository path and commit SHA
- material file and checksum when material-derived
- GitHub issue/PR/commit URL when status-derived
- whether the claim is verified, inferred, stale, design-intended, or open question
- which topic page and evidence page should carry it
