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

## Target-Set Coverage And Ownership Gaps

This wiki currently profiles only part of the configured target set. Do not assign ownership for unprofiled repositories from this wiki alone.

| Area | Current wiki coverage | Maintainer implication |
| --- | --- | --- |
| `simpler`, `pto-isa`, `pypto` | profiled with source commits and examples | safe primary reading path for this documentation pass |
| `pypto_top_level_documents` | evidence-only through Lingqu design file | useful for design alignment, not full repo ownership |
| `distributed-runtime` | not profiled | inspect before deciding remote L3 / DistWorker ownership |
| `serving-lib`, `pto-li`, `ptoas` | not profiled | do not infer serving/library/toolchain behavior yet |
| `hccl` | partial supporting evidence | safe only for HCCL data-plane context |
| `hcomm`, `shmem`, `hixl`, `cann-recipes-infer` | not profiled | add CANN-side documentation pass before using them as authority |

## Status Labels

Use the shared labels in [Evidence Status Labels](../evidence/#status-labels). For maintainer work, the key distinction is: `implemented` means source/test/example/merged PR evidence exists; it does not mean the wiki pass ran the code locally. Use `not-run` for documented example commands that were not executed during the pass.

## Safe First Tasks

| Task | Repo | First command / action | Done signal | Update target |
| --- | --- | --- | --- | --- |
| Reproduce a source-only PyPTO example | `pypto` | `python examples/hello_world.py` | `HelloWorldProgram.as_python()` prints | [Examples Feature Map](./examples-feature-map.md#run-surface-and-caveats) if command changes |
| Reproduce a simulator runtime example | `simpler` | `python examples/workers/l2/vector_add/main.py -p a2a3sim -d 0` | vector_add golden check passes | [simpler](../repositories/simpler.md#try-first) |
| Reproduce a kernel/operator package | `pto-isa` | follow `demos/baseline/add/README.md` or `./run.sh` | wheel installs and `test.py` passes | [pto-isa](../repositories/pto-isa.md#try-first) |
| Trace TensorMap dependency | `simpler` | read `docs/orchestrator.md` and `examples/workers/l3/ffn_tp_parallel` | producer/consumer relation is explainable from tensor address | [Distributed Execution](./distributed-execution.md) or evidence ledger |
| Classify a distributed claim | cross-repo | compare source/PR/material with [status labels](../evidence/#status-labels) | label is `implemented`, `emerging`, `design-intended`, `TODO`, `stale`, or `open question` | paired topic + evidence pages |

## Maintenance Rules

- Preserve source-native code identifiers and file paths, even when product terminology uses corrected spelling.
- Treat materials as evidence inputs, not ground truth when source code disagrees.
- Status labels are part of the API of this wiki. Do not mark remote runtime behavior as `implemented` without a stable example, test, or merged PR.
- Keep raw materials in `materials/`; put topic evidence in `wiki/evidence/`.
- Update topic pages and evidence ledgers together when material/GitHub/cross-repo synthesis changes.

## Current High-Risk Areas

| Risk | Why it matters | Current status | Next maintainer action | Evidence needed to change status |
| --- | --- | --- | --- | --- |
| Remote L3 / DistWorker | Easy to overstate from design docs | `design-intended` | inspect `distributed-runtime` and future `simpler` remote-worker PRs | stable remote worker example, merged PR, or source docs |
| PyPTO collectives | API issues exist, but implementation boundary is not settled | `design-intended` / `emerging` | follow PyPTO issue `#1189` and codegen/runtime changes | merged API + lowering tests + runtime example |
| deferred + async completion | Multiple PRs exist; final ABI still needs follow-up | `implemented` + `emerging` | track [simpler PR #696](https://github.com/hw-native-sys/simpler/pull/696) and any replacement completion backend | merged async completion PR + updated examples/tests |
| complete distributed NN example | Current evidence has complete NN non-distributed examples and distributed partial examples, but not complete distributed NN | `TODO` | design a vertical slice from `llama_mini` plus simpler L3 FFN/collective path | runnable model-level distributed example and evidence ledger update |
| CANN-side ownership | HCCL is partially inspected but HCOMM/SHMEM/HIXL are not | `open question` | run a CANN-side repository documentation pass | CANN repository profiles with source refs |

## Definition Of Ready For New Wiki Claims

Before adding a durable claim, capture:

- exact repository path and commit SHA
- material file and checksum when material-derived
- GitHub issue/PR/commit URL when status-derived
- whether the claim is implemented, emerging, design-intended, TODO, stale, inferred, not-run, or open question
- which topic page and evidence page should carry it
