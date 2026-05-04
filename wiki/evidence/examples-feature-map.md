---
title: "Examples Feature Map Evidence"
type: evidence
status: draft
sources:
  - repositories/simpler/examples/
  - repositories/pto-isa/demos/
  - repositories/pypto/examples/
  - repositories/pypto/tests/st/distributed/
  - materials/pto-runtime-distributed/05_progress_and_timeline.md
last_updated: 2026-05-04
---

# Examples Feature Map Evidence

This ledger supports [Examples Feature Map](../topics/examples-feature-map.md). It explains why the topic orders examples from non-distributed foundations to distributed behavior and why each example receives its status label.

## Source Set

| Source | Ref | Role |
| --- | --- | --- |
| `repositories/pypto/examples/hello_world.py` | `pypto` commit `f21c2dd48cfe1e5c4add78b0e391a31196420862` | minimal DSL/InCore/orchestration example |
| `repositories/pypto/examples/kernels/` | same | ordinary non-distributed kernel examples |
| `repositories/pto-isa/demos/baseline/add` | `pto-isa` commit `a977dd1161222a8b779fb5ff5d1c8b7f4518c3a2` | PTO kernel as `torch_npu` custom operator |
| `repositories/pto-isa/demos/baseline/gemm_basic` | same | tile GEMM and pipeline example |
| `repositories/pto-isa/demos/cpu/` | same | CPU simulation learning path |
| `repositories/pto-isa/demos/baseline/allgather_async` | same | SDMA/URMA communication demo |
| `repositories/simpler/examples/workers/l2/` | `simpler` commit `5029466197ab26cdef80c34b5d2cdcfca86b71d7` | L2 lifecycle and vector add launch path |
| `repositories/simpler/examples/a2a3/tensormap_and_ringbuffer/paged_attention` | same | production runtime variant |
| `repositories/simpler/examples/workers/l3/` | same | host orchestration, HCCL window, TensorMap dependency |
| `repositories/pypto/tests/st/distributed/` | `pypto` commit above | PyPTO distributed execution and skipped emerging case |
| `materials/pto-runtime-distributed/05_progress_and_timeline.md` | material bundle SHA256 `aa8d92ae9892a6fbda4f9dbfb49111724ad61b286ca081f2a4f02d426a4634a0` | PR/example timeline and status cross-check |

## Claim Map

| Topic claim | Evidence | Destination |
| --- | --- | --- |
| Reading order starts with PyPTO hello world, PTO-ISA add/GEMM/CPU demos, then simpler L2, then distributed examples. | User review required non-distributed foundations first; PyPTO README/examples; PTO-ISA demos; simpler L2 README. | [Examples Feature Map](../topics/examples-feature-map.md#阅读顺序) |
| PyPTO hello world is the minimal DSL/InCore/orchestration example. | `pypto/examples/hello_world.py`. | [Examples Feature Map](../topics/examples-feature-map.md#示例矩阵) |
| PTO-ISA add/GEMM/CPU demos are non-distributed foundation examples. | `pto-isa/demos/README.md`; `demos/baseline/add`; `demos/baseline/gemm_basic`; `demos/cpu/*`. | [Examples Feature Map](../topics/examples-feature-map.md#示例矩阵) |
| simpler L2 examples demonstrate Ascend chip launch foundations. | `simpler/examples/workers/l2/README.md`; `hello_worker`; `vector_add`; `docs/chip-level-arch.md`. | [Examples Feature Map](../topics/examples-feature-map.md#示例矩阵) |
| `paged_attention` demonstrates `tensormap_and_ringbuffer` production runtime. | `simpler/src/a2a3/docs/runtimes.md`; `examples/a2a3/tensormap_and_ringbuffer/paged_attention`. | [Examples Feature Map](../topics/examples-feature-map.md#能力映射) |
| `allreduce_distributed` and `ffn_tp_parallel` demonstrate current L3/multi-chip distributed data-plane behavior, not remote multi-host runtime. | simpler L3 example files; material `05_progress_and_timeline.md`; [Distributed Execution Evidence](./distributed-execution.md). | [Examples Feature Map](../topics/examples-feature-map.md#不应误读) |
| `test_l3_parallel_reduce.py` is `emerging` because the test is skipped. | `pypto/tests/st/distributed/test_l3_parallel_reduce.py`. | [Examples Feature Map](../topics/examples-feature-map.md#示例矩阵) |

## Negative Findings

- The matrix is not a complete example index.
- Communication demos prove kernel/rank behavior, not PyPTO orchestration-level collectives.
- Hardware-only L3 examples do not prove remote multi-host runtime.

## Open Questions

- Which example should become the first canonical remote L3 vertical slice once it exists?
- Should skipped PyPTO distributed tests be promoted to implemented once runtime support lands?
