---
title: "Examples Feature Map Evidence"
type: evidence
status: draft
sources:
  - repositories/simpler/examples/
  - repositories/pto-isa/demos/
  - repositories/pypto/examples/
  - repositories/pypto/tests/st/distributed/
  - wiki/materials/pto-runtime-distributed/05_progress_and_timeline.md
last_updated: 2026-05-05
---

# Examples Feature Map Evidence

本 ledger 支撑公开的 [PTO Examples](../examples/pto/) 区域。它记录本轮检查到的 PyPTO、PTO-ISA、`simpler` examples 覆盖范围、run-surface 证据、missing-example negative findings，以及为什么 complete distributed NN 仍标为 `TODO`。

读学习内容时优先看 [PTO Examples](../examples/pto/)；本页只用于核对 example ordering、run-surface caveats、missing-example status 和 source anchors。

## Source Set

| Source | Ref | Role |
| --- | --- | --- |
| `repositories/pypto/examples/hello_world.py` | `pypto` commit `f21c2dd48cfe1e5c4add78b0e391a31196420862` | minimal DSL/InCore/orchestration example |
| `repositories/pypto/examples/kernels/` | same | ordinary non-distributed kernel examples |
| `repositories/pypto/examples/models/03_flash_attention.py` and `04_paged_attention.py` | same | attention and KV-cache model examples |
| `repositories/pypto/examples/models/08_llama_mini.py` | same | compact complete LLaMA-style NN baseline |
| `repositories/pypto/README.md` | same | documented example and unit-test commands |
| `repositories/pto-isa/demos/baseline/add` | `pto-isa` commit `a977dd1161222a8b779fb5ff5d1c8b7f4518c3a2` | PTO kernel as `torch_npu` custom operator |
| `repositories/pto-isa/demos/baseline/gemm_basic` | same | tile GEMM and pipeline example |
| `repositories/pto-isa/demos/baseline/add/run.sh` and `README.md` | same | add operator build/install/test entrypoint and CANN/PTO_LIB requirements |
| `repositories/pto-isa/demos/baseline/gemm_basic/README.md` | same | GEMM build/test sequence, shapes, tiling, pipeline notes |
| `repositories/pto-isa/demos/baseline/allgather_async/README.md` and `run.sh` | same | MPI/rank/SoC run surface and communication demo prerequisites |
| `repositories/pto-isa/demos/cpu/` | same | CPU simulation learning path |
| `repositories/pto-isa/demos/baseline/allgather_async` | same | SDMA/URMA communication demo |
| `repositories/simpler/README.md` | `simpler` commit `5029466197ab26cdef80c34b5d2cdcfca86b71d7` | platform/test commands and sim vs hardware assumptions |
| `repositories/simpler/examples/workers/l2/` | `simpler` commit `5029466197ab26cdef80c34b5d2cdcfca86b71d7` | L2 lifecycle and vector add launch path |
| `repositories/simpler/examples/workers/l2/hello_worker/main.py` and `vector_add/README.md` | same | concrete L2 entrypoints and run caveats |
| `repositories/simpler/examples/a2a3/tensormap_and_ringbuffer/paged_attention` | same | production runtime variant |
| `repositories/simpler/examples/workers/l3/` | same | host orchestration, HCCL window, TensorMap dependency |
| `repositories/pypto/tests/st/distributed/` | `pypto` commit above | PyPTO distributed execution and skipped emerging case |
| `wiki/materials/pto-runtime-distributed/05_progress_and_timeline.md` | material bundle SHA256 `aa8d92ae9892a6fbda4f9dbfb49111724ad61b286ca081f2a4f02d426a4634a0` | PR/example timeline and status cross-check |

## Claim Map

| Claim ID | Evidence claim | Observed facts | Evidence | Destination |
| --- | --- | --- | --- | --- |
| EX-001 | inspected examples span from basic expression to current L3 distributed partials. | Source set contains minimal PyPTO hello/kernel examples, PTO-ISA add/GEMM/comm demos, `simpler` L2/L3 runtime examples, and PyPTO `llama_mini`; no inspected complete distributed NN example closes the ladder. | PyPTO hello/kernels/models; PTO-ISA demos; `simpler` L2/L3 examples. | [PTO Examples](../examples/pto/) |
| EX-002 | PyPTO model examples expose FFN、attention 和 complete non-distributed decoder concepts. | PyPTO model examples cover FFN, Flash Attention, Paged Attention, and `llama_mini`; these map to QKV projection, softmax, KV cache, MLP, residual, and LM head. | PyPTO model examples and `08_llama_mini.py` docstring. | [Softmax / Attention](../examples/pto/softmax-attention.md), [Complete Models](../examples/pto/complete-models.md) |
| EX-003 | add/GEMM/attention/communication examples appear at different abstraction layers. | Add exists as PyPTO DSL, PTO-ISA custom op, and `simpler` L2 launch; GEMM/attention/communication each appear at different layers with different proof strength. | PyPTO examples, PTO-ISA demos, `simpler` examples. | [Hello / Elementwise](../examples/pto/hello-elementwise.md), [GEMM / FFN](../examples/pto/gemm-ffn.md), [Distributed Runtime](../examples/pto/distributed-runtime.md) |
| EX-004 | expert examples include concrete optimization/runtime mechanisms. | PTO-ISA GEMM README documents fixed shapes, 24-core split, K tiling, and double buffering; PyPTO attention examples expose online softmax/KV-cache behavior; `simpler` docs explain TensorMap/ring-buffer dependency and storage model. | PTO-ISA GEMM/Flash Attention, PyPTO attention, `simpler` `tensormap_and_ringbuffer`, L3 HCCL-window examples. | [GEMM / FFN](../examples/pto/gemm-ffn.md), [Softmax / Attention](../examples/pto/softmax-attention.md) |
| EX-005 | run surfaces are documented from source/README, but commands were not executed in this wiki pass. | README/docstrings expose commands and prerequisites; this wiki pass did not execute the example commands, so affected rows are marked `not-run`. | PyPTO README/docstrings; PTO-ISA demo READMEs and `run.sh`; `simpler` README, L2 example README, L3 pytest markers. | Run-surface tables under [PTO Examples](../examples/pto/). |
| EX-006 | current complete NN example is PyPTO `llama_mini`; complete distributed NN remains TODO. | `08_llama_mini.py` defines a single-head LLaMA-style decoder builder with RMSNorm, QKV, RoPE, attention, SwiGLU MLP, final norm, and LM head; no inspected example combines complete model + distributed runtime + PTO-ISA kernels end to end. | `pypto/examples/models/08_llama_mini.py`; no stable complete distributed NN example found in inspected examples. | [Complete Models](../examples/pto/complete-models.md), [Missing Roadmap](../examples/pto/missing-roadmap.md) |
| EX-007 | `allreduce_distributed` and `ffn_tp_parallel` demonstrate current L3/multi-chip data-plane behavior, not remote multi-host runtime. | `simpler` L3 examples are under `examples/workers/l3`; docs describe L3 as one host process managing chip workers/SubWorkers; remote worker lifecycle is absent from inspected examples. | `simpler` L3 example files; material `05_progress_and_timeline.md`; [Distributed Execution Evidence](./distributed-execution.md). | [Distributed Runtime](../examples/pto/distributed-runtime.md), [Missing Roadmap](../examples/pto/missing-roadmap.md#what-not-to-infer) |
| EX-008 | `test_l3_parallel_reduce.py` is `emerging` because the test is skipped. | The skipped PyPTO distributed test is evidence of an intended/partial path, not a stable implemented example. | `pypto/tests/st/distributed/test_l3_parallel_reduce.py`. | [Distributed Runtime](../examples/pto/distributed-runtime.md), [Missing Roadmap](../examples/pto/missing-roadmap.md#what-not-to-infer) |

## Material Routing

| Material file | Details used | Destination |
| --- | --- | --- |
| `wiki/materials/pto-runtime-distributed/05_progress_and_timeline.md` | PR/demo timeline and distributed example status, especially FFN TP, HCCL backend, deferred completion, SDMA async completion | beginner-to-expert distributed rows and missing-example roadmap |
| `wiki/materials/pto-runtime-distributed/PTO-Runtime分布式拓展文档系统设计.md` | writing priority: examples are high-value maintainer evidence and distributed is a second reading layer | examples-first structure and non-distributed-before-distributed ordering |
| `wiki/materials/pto-runtime-distributed/02_pto_isa_and_runtime_basics.md` | L2/L3 runtime concepts, TensorMap, comm window, deferred completion | optimization notes and L2/L3 example interpretation |

## Negative Findings

- The matrix is not a complete example index; it records source surfaces used by current public example chapters.
- Communication demos prove kernel/rank behavior, not PyPTO orchestration-level collectives.
- Hardware-only L3 examples prove current single-host L3 and data-plane paths, not remote multi-host runtime.
- No inspected example combines complete NN, PyPTO distributed execution, `simpler` runtime, and PTO-ISA optimized kernels end to end.
- `wiki/topics/examples-feature-map.md` is no longer a thin redirect; it explains the examples system and delegates concrete learning to [PTO Examples](../examples/pto/).

## Status-Change Criteria

| Current claim | Required evidence to change status |
| --- | --- |
| complete distributed NN is `TODO` | runnable example or test that combines model graph, partitioning, PyPTO lowering, `simpler` execution, kernel/data-plane support, and validation |
| PyPTO orchestration-level collectives are `design-intended` | source/API/test evidence for stable collective expression and lowering path |
| remote L3 examples are `design-intended` | source/example/test evidence for remote worker lifecycle, callable registration, and cross-host control channel |
| skipped PyPTO parallel reduce is `emerging` | unskipped passing test or equivalent source-backed run surface |

## Open Questions

- Which example should become the first canonical remote L3 vertical slice once it exists?
- Should skipped PyPTO distributed tests be promoted to implemented once runtime support lands?
