---
title: "Non-Distributed Execution Evidence"
type: evidence
status: draft
sources:
  - repositories/pypto/
  - repositories/pto-isa/
  - repositories/simpler/
last_updated: 2026-05-05
---

# Non-Distributed Execution Evidence

This ledger supports [Non-Distributed Execution](../topics/non-distributed-execution.md). It exists because the topic combines three repositories into one normal execution path.

读者不需要从本页学习普通执行路径；普通执行的解释在 topic page。这里保留 source anchors、claim map 和 negative findings，用来证明 wiki 没有把 distributed material 盖过 foundation layer。

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

| Claim ID | Topic claim | Observed facts | Evidence | Destination |
| --- | --- | --- | --- | --- |
| ND-001 | Normal flow starts with PyPTO DSL/parser/IR/pass/codegen before runtime execution. | PyPTO README and examples expose Python DSL/program examples; `compile.py` contains ordinary compile behavior and a separate distributed branch; `runner.py` provides runtime-facing execution config. | PyPTO README, `hello_world.py`, `compile.py`, `runner.py`. | [Non-Distributed Execution](../topics/non-distributed-execution.md#normal-pypto-flow) |
| ND-002 | PTO-ISA is the kernel/tile instruction layer, not the worker scheduler. | PTO-ISA README/header docs describe tile-oriented APIs; baseline demos package kernels/operators; no PTO-ISA evidence owns `Worker` lifecycle or host DAG scheduling. | PTO-ISA README, `include/pto/README.md`, baseline demos. | [Non-Distributed Execution](../topics/non-distributed-execution.md#normal-pto-isa-flow) |
| ND-003 | simpler L2 owns device launch and task graph execution. | `chip-level-arch.md` describes host runtime, AICPU scheduler, AICore/AIV kernels, C/Python API layers, and execution flow; L2 worker examples show lifecycle and vector add launch. | `simpler/docs/chip-level-arch.md`; L2 examples. | [Non-Distributed Execution](../topics/non-distributed-execution.md#normal-simpler-l2-flow) |
| ND-004 | Distributed execution should be read as a later layer on top of these foundations. | `compile.py` only returns `DistributedCompiledProgram` for Lingqu level >= 3; `simpler` L3 examples compose L2 chip workers and SubWorkers rather than replacing L2. | `compile.py`; simpler L3 examples and docs. | [Non-Distributed Execution](../topics/non-distributed-execution.md#what-this-foundation-enables) |

## Negative Findings

- PyPTO's ordinary examples do not themselves prove remote runtime behavior.
- PTO-ISA demos prove kernel/operator behavior, not host-level scheduler semantics.
- simpler L2 launch path does not imply cross-host worker discovery.

## Open Questions

- Which model example should become the canonical complete-NN non-distributed baseline?
