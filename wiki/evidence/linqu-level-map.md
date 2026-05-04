---
title: "Linqu Level Map Evidence"
type: evidence
status: draft
sources:
  - repositories/pypto_top_level_documents/linqu_runtime_design.md
  - repositories/pypto/include/pypto/ir/function.h
  - materials/pto-runtime-distributed/08_top_level_design_alignment.md
  - materials/pto-runtime-distributed/03_distributed_blueprint.md
last_updated: 2026-05-04
---

# Linqu Level Map Evidence

This ledger supports [Linqu Level Map](../topics/linqu-level-map.md). It exists because the topic combines a top-level design document, PyPTO enum evidence, simpler runtime behavior, and material-derived distributed targets.

## Source Set

| Source | Ref / checksum | Role |
| --- | --- | --- |
| `repositories/pypto_top_level_documents/linqu_runtime_design.md` | `main` commit `7faac0b910e40989a6bbd381a80595b65ab29708` | top-level Linqu runtime design |
| `repositories/pypto/include/pypto/ir/function.h` | `pypto` commit `f21c2dd48cfe1e5c4add78b0e391a31196420862` | `Level`, `Role`, and `LevelToLinquLevel()` code evidence |
| `materials/pto-runtime-distributed/08_top_level_design_alignment.md` | extracted from bundle SHA256 `aa8d92ae9892a6fbda4f9dbfb49111724ad61b286ca081f2a4f02d426a4634a0` | HostWorker/DistWorker and L0-L6 alignment |
| `materials/pto-runtime-distributed/03_distributed_blueprint.md` | same bundle | L4-L6 remote/distributed target context |
| `repositories/simpler/docs/chip-level-arch.md` and `examples/workers/l3/README.md` | `simpler` commit `5029466197ab26cdef80c34b5d2cdcfca86b71d7` | L2/L3 runtime execution evidence |

## Claim Map

| Topic claim | Evidence | Destination |
| --- | --- | --- |
| L0 maps to PyPTO `AIV` / `AIC` / `CORE_GROUP` and is implemented through PTO-ISA/PyPTO kernel path. | `function.h` enum and Linqu mapping; PTO-ISA tile instruction evidence; PyPTO hello-world/InCore examples. | [Linqu Level Map](../topics/linqu-level-map.md#层级映射) |
| L2 maps to `CHIP` and is implemented in simpler local hierarchy. | `simpler/docs/chip-level-arch.md`; `simpler/examples/workers/l2/README.md`; `function.h` mapping. | [Linqu Level Map](../topics/linqu-level-map.md#层级映射) |
| L3 maps to `HOST` and is implemented for single-host path. | `simpler/examples/workers/l3/README.md`; PyPTO `distributed_runner.py`; material `08_top_level_design_alignment.md`. | [Linqu Level Map](../topics/linqu-level-map.md#层级映射) |
| L4-L6 are design-intended rather than implemented. | `linqu_runtime_design.md`; material `03_distributed_blueprint.md`; no stable inspected remote L4-L6 example. | [Linqu Level Map](../topics/linqu-level-map.md#设计文档判断) |
| PyPTO `GLOBAL` enum exists, but runtime semantics are open. | `function.h` contains `GLOBAL`; no corresponding stable runtime behavior found. | [Linqu Level Map](../topics/linqu-level-map.md#层级映射) |
| `HostWorker`, `DistWorker`, `SubWorker`, and `Orchestrator` need separate meanings. | material `08_top_level_design_alignment.md`; PyPTO `Role`; simpler L3 README and worker registration behavior. | [Linqu Level Map](../topics/linqu-level-map.md#术语对齐) |

## Negative Findings

- PyPTO enum presence alone does not prove runtime support.
- No inspected source made `GLOBAL` a stable runtime execution level.
- Remote L4-L6 evidence is design material, not an implemented example.

## Open Questions

- Will `GLOBAL` become a real runtime level or remain a compiler-side label?
- How will `DistWorker` map to actual process, host, and device ownership once remote L3 lands?
