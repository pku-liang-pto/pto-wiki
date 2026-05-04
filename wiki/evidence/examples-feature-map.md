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

This ledger supports [Examples Feature Map](../topics/examples-feature-map.md). It explains why the topic orders examples from non-distributed foundations to distributed behavior, why common examples are compared across repositories, and why missing complete distributed NN coverage is marked TODO.

## Source Set

| Source | Ref | Role |
| --- | --- | --- |
| `repositories/pypto/examples/hello_world.py` | `pypto` commit `f21c2dd48cfe1e5c4add78b0e391a31196420862` | minimal DSL/InCore/orchestration example |
| `repositories/pypto/examples/kernels/` | same | ordinary non-distributed kernel examples |
| `repositories/pypto/examples/models/03_flash_attention.py` and `04_paged_attention.py` | same | attention and KV-cache model examples |
| `repositories/pypto/examples/models/08_llama_mini.py` | same | compact complete LLaMA-style NN baseline |
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
| Examples need beginner-to-expert ordering from kernel basics to complete NN and distributed TODOs. | User review; PyPTO hello/kernels/models; PTO-ISA demos; simpler L2/L3 examples. | [Examples Feature Map](../topics/examples-feature-map.md#beginner-to-expert-path) |
| The page should provide concise LLM concepts before implementation detail. | PyPTO model examples cover Flash Attention, Paged Attention, and LLaMA mini. | [Examples Feature Map](../topics/examples-feature-map.md#llm-intuition-before-examples) |
| Similar add/GEMM/attention/communication examples should be mapped across repositories. | PyPTO examples, PTO-ISA demos, simpler examples. | [Examples Feature Map](../topics/examples-feature-map.md#common-example-families) |
| Expert examples should identify optimization techniques. | PTO-ISA GEMM/Flash Attention, PyPTO attention, simpler `tensormap_and_ringbuffer`, L3 HCCL-window examples. | [Examples Feature Map](../topics/examples-feature-map.md#optimization-techniques-to-notice) |
| The current complete NN example is PyPTO `llama_mini`; complete distributed NN remains TODO. | `pypto/examples/models/08_llama_mini.py`; no stable complete distributed NN example found in inspected examples. | [Examples Feature Map](../topics/examples-feature-map.md#missing-example-roadmap) |
| `allreduce_distributed` and `ffn_tp_parallel` demonstrate current L3/multi-chip distributed data-plane behavior, not remote multi-host runtime. | simpler L3 example files; material `05_progress_and_timeline.md`; [Distributed Execution Evidence](./distributed-execution.md). | [Examples Feature Map](../topics/examples-feature-map.md#what-not-to-infer) |
| `test_l3_parallel_reduce.py` is `emerging` because the test is skipped. | `pypto/tests/st/distributed/test_l3_parallel_reduce.py`. | [Examples Feature Map](../topics/examples-feature-map.md#what-not-to-infer) |

## Negative Findings

- The matrix is not a complete example index.
- Communication demos prove kernel/rank behavior, not PyPTO orchestration-level collectives.
- Hardware-only L3 examples do not prove remote multi-host runtime.
- No inspected example combines complete NN, PyPTO distributed execution, simpler runtime, and PTO-ISA optimized kernels end to end.

## Open Questions

- Which example should become the first canonical remote L3 vertical slice once it exists?
- Should skipped PyPTO distributed tests be promoted to implemented once runtime support lands?
