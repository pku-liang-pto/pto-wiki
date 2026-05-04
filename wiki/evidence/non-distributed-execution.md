---
title: "Non-Distributed Execution Evidence"
type: evidence
status: draft
sources:
  - repositories/pypto/
  - repositories/pto-isa/
  - repositories/simpler/
last_updated: 2026-05-04
---

# Non-Distributed Execution Evidence

This ledger supports [Non-Distributed Execution](../topics/non-distributed-execution.md). It exists because the topic combines three repositories into one normal execution path.

## Source Set

| Source | Ref | Role |
| --- | --- | --- |
| `repositories/pypto/README.md` | commit `f21c2dd48cfe1e5c4add78b0e391a31196420862` | PyPTO purpose, features, examples |
| `repositories/pypto/examples/hello_world.py` | same | minimal DSL/InCore/orchestration example |
| `repositories/pypto/python/pypto/ir/compile.py` | same | normal compile path and `DistributedCompiledProgram` branch |
| `repositories/pypto/python/pypto/runtime/runner.py` | same | `runtime.run()` and `RunConfig` |
| `repositories/pto-isa/README.md` and `include/pto/README.md` | commit `a977dd1161222a8b779fb5ff5d1c8b7f4518c3a2` | tile library and public header layout |
| `repositories/pto-isa/demos/` | same | baseline add/GEMM/Flash Attention and CPU examples |
| `repositories/simpler/docs/chip-level-arch.md` | commit `5029466197ab26cdef80c34b5d2cdcfca86b71d7` | L2 Ascend launch path |
| `repositories/simpler/src/a2a3/docs/runtimes.md` | same | `host_build_graph` vs `tensormap_and_ringbuffer` |

## Claim Map

| Topic claim | Evidence | Destination |
| --- | --- | --- |
| Normal flow starts with PyPTO DSL/parser/IR/pass/codegen before runtime execution. | PyPTO README, `hello_world.py`, `compile.py`, `runner.py`. | [Non-Distributed Execution](../topics/non-distributed-execution.md#normal-pypto-flow) |
| PTO-ISA is the kernel/tile instruction layer, not the worker scheduler. | PTO-ISA README, `include/pto/README.md`, baseline demos. | [Non-Distributed Execution](../topics/non-distributed-execution.md#normal-pto-isa-flow) |
| simpler L2 owns device launch and task graph execution. | `simpler/docs/chip-level-arch.md`; L2 examples. | [Non-Distributed Execution](../topics/non-distributed-execution.md#normal-simpler-l2-flow) |
| Distributed execution should be read as a later layer on top of these foundations. | `compile.py` only returns `DistributedCompiledProgram` for Lingqu level >= 3; simpler L3 examples compose L2 workers. | [Non-Distributed Execution](../topics/non-distributed-execution.md#what-this-foundation-enables) |

## Negative Findings

- PyPTO's ordinary examples do not themselves prove remote runtime behavior.
- PTO-ISA demos prove kernel/operator behavior, not host-level scheduler semantics.
- simpler L2 launch path does not imply cross-host worker discovery.

## Open Questions

- Which model example should become the canonical complete-NN non-distributed baseline?
