---
title: "UBL128 V4 Pro Serving Techniques Evidence"
type: evidence
status: draft
sources:
  - ../future/ubl128-v4-pro-serving-techniques.md
  - ../materials/UBL128_serving.md
  - ../materials/simpler_distributed_runtime_design.md
  - https://github.com/ai-dynamo/dynamo
  - https://github.com/NVIDIA/TensorRT-LLM
  - https://github.com/NVIDIA/Megatron-LM
  - https://github.com/ai-dynamo/nixl
  - https://github.com/triton-inference-server/tensorrtllm_backend
last_updated: 2026-05-10
---

# UBL128 V4 Pro Serving Techniques Evidence

This ledger supports [UBL128 V4 Pro Serving Techniques](../future/ubl128-v4-pro-serving-techniques.md). It records source snapshots, what each source was used for, which claims are verified, which are recommendations, and what would change the page status.

## Source Inventory

### Local Target Materials

| Source | Snapshot | Used For |
| --- | --- | --- |
| `wiki/materials/UBL128_serving.md` | `sha256: dec075d4aa80a917ede42474242d564521a9b466050b2f0950a6bce3212d87a6` | UBL128 HBD/PC16/SSU target, SU/SO/DCN boundary, F/M/PC/PN/DC/DN/S roles, scenario C, KV Meta / ChunkRecord / SSU / LBA target, V4 Pro serving goal. |
| `wiki/materials/simpler_distributed_runtime_design.md` | `sha256: 3f85e3d6329aeff8cee43e6afc9856658e0a2e743fb753f424ad5be995faedcd` | Current design foundation for `IWorker.run(payload)`, `ChipWorker`, `SubWorker`, `DistWorker`, L3 HostWorker / DistWorker, fork+shared-memory mailbox, recursive L4+ intent. |

### Cloned Reference Repositories

| Repository | Local Snapshot | Main Files Inspected | Used For |
| --- | --- | --- | --- |
| [`ai-dynamo/dynamo`](https://github.com/ai-dynamo/dynamo) | `9db71762e6d1a47bff42d55938e0ec27583fcef7` | `README.md`, `components/README.md`, `recipes/deepseek-v4/deepseek-v4-pro/README.md`, `recipes/gpt-oss-120b/README.md`, `lib/backend-common/src/engine.rs`, `lib/kvbm-*`, router/planner/KVBM paths found by repository search. | Datacenter-scale inference orchestration, disaggregated prefill/decode, DeepSeek-V4-Pro recipe, gpt-oss recipe, KV-aware routing, KVBM, planner, NIXL-backed transfer. |
| [`NVIDIA/TensorRT-LLM`](https://github.com/NVIDIA/TensorRT-LLM) | `7ce209b4619e6dc4cc2b0778c63b03cf355c5b38` | `docs/source/features/disagg-serving.md`, `docs/source/features/kvcache.md`, `docs/source/features/parallel-strategy.md`, `docs/source/developer-guide/kv-transfer.md`, deployment guides/blogs found by search, `cpp/include/tensorrt_llm/batch_manager/*`, `tensorrt_llm/_mnnvl_utils.py`. | Engine/runtime layer, KV cache block system, disaggregated KV exchange, TP/PP/DP/EP/CP/Wide-EP strategy, scheduler/KV cache interactions, DeepSeek/gpt-oss-oriented deployment evidence. |
| [`NVIDIA/Megatron-LM`](https://github.com/NVIDIA/Megatron-LM) | `708c6f5296920441590b8793f6bb6c7ef9187f12` | `docs/user-guide/parallelism-guide.md`, `megatron/core/parallel_state.py`, `megatron/core/transformer/moe/README.md`, `megatron/core/transformer/moe/*`, `megatron/core/pipeline_parallel/*`, `megatron/core/inference/*`. | Explicit TP/PP/CP/EP/DP process group model, MoE all-to-all dispatch/combine, pipeline P2P, batch dimension sync, inference scheduling concepts. |
| [`ai-dynamo/nixl`](https://github.com/ai-dynamo/nixl) | `a5f613eb17328f4e54b97ba88a905c5ff44d7e30` | `README.md`, `docs/nixl.md`, `docs/BackendGuide.md`. | Data-plane transfer abstraction, memory section, transfer backend, metadata handler, initialization-time registration, async transfer handles, GPU/CPU/storage memory boundary. |
| [`triton-inference-server/tensorrtllm_backend`](https://github.com/triton-inference-server/tensorrtllm_backend) | `8addf2fdc58ac63cc6bfceded34e0960d241791f` | `README.md`, `docs/model_config.md`, `docs/llama_multi_instance.md`. | Endpoint/model repository layer, inflight batching configuration, MPI leader/orchestrator deployment boundary, Triton serving layer vs TensorRT-LLM runtime separation. |

## Claim Map

| Claim | Status | Evidence |
| --- | --- | --- |
| UBL128 scenario C targets one UBL128 prefill HBD, one UBL128 decode HBD, and 12 SSU12 frames for KV storage. | `design-intended` | `wiki/materials/UBL128_serving.md` sections around scenario C and topology. |
| UBL128 separates SU, SO, and DCN roles; hot internal SO/SU RPC is `uRPC over UB Urma`, external/non-hot DCN RPC is gRPC/HTTP. | `design-intended` | `wiki/materials/UBL128_serving.md` network boundary and protocol rules. |
| `simpler_distributed_runtime_design.md` defines a recursive worker model with blocking `IWorker.run(payload)` and L3 HostWorker / DistWorker. | `design-intended` | `wiki/materials/simpler_distributed_runtime_design.md` sections 2, 3, 7.4, 8. |
| NVIDIA Dynamo positions itself as an orchestration layer above engines such as SGLang, TensorRT-LLM, and vLLM, with disaggregated serving, KV-aware routing, KVBM, and planner. | `verified source survey` | `ai-dynamo/dynamo` `README.md`, `components/README.md`. |
| Dynamo contains DeepSeek-V4-Pro recipes and gpt-oss-120B TensorRT-LLM recipes, including aggregated and disaggregated deployment shapes. | `verified source survey` | `recipes/deepseek-v4/deepseek-v4-pro/README.md`, `recipes/gpt-oss-120b/README.md`. |
| TensorRT-LLM documents disaggregated serving as context/prefill and generation/decode on separate GPU pools with KV cache exchange. | `verified source survey` | `NVIDIA/TensorRT-LLM` `docs/source/features/disagg-serving.md`. |
| TensorRT-LLM describes KV cache as block/page-managed state with reuse, radix-style prefix search, optional offload, and configurable memory fraction. | `verified source survey` | `docs/source/features/kvcache.md`. |
| TensorRT-LLM supports deployment parallelism strategies including TP, PP, DP, EP, CP, and Wide-EP. | `verified source survey` | `docs/source/features/parallel-strategy.md`. |
| Megatron Core explicitly constructs and uses TP/PP/CP/EP/DP process groups. | `verified source survey` | `docs/user-guide/parallelism-guide.md`, `megatron/core/parallel_state.py`. |
| Megatron Core MoE supports all-to-all/flex token dispatch, DeepEP, grouped GEMM, router/permutation fusion, and overlap techniques. | `verified source survey` | `megatron/core/transformer/moe/README.md`, `megatron/core/transformer/moe/*`. |
| NIXL separates transfer agent, memory sections, transfer backend, and metadata handler, and recommends metadata exchange/registration outside the per-transfer hot path. | `verified source survey` | `ai-dynamo/nixl` `docs/nixl.md`, `docs/BackendGuide.md`. |
| Triton TensorRT-LLM backend is an endpoint/model-serving wrapper around TensorRT-LLM runtime, with leader/orchestrator modes relying on MPI for multi-GPU/multi-node model execution. | `verified source survey` | `triton-inference-server/tensorrtllm_backend` `README.md`, `docs/model_config.md`, `docs/llama_multi_instance.md`. |
| `simpler` should add worker group, execution plan, transport plan, KV block manager, MoE dispatch metadata, and async serving lifecycle to support UBL128 V4 Pro serving. | `recommendation` | Inference from UBL128 requirements plus reference stack design patterns. Not implemented by this PR. |

## Source-Specific Notes

### Dynamo

The Dynamo README explicitly frames Dynamo as a datacenter-scale inference stack and an orchestration layer above existing engines. The DeepSeek-V4-Pro recipe is especially relevant because it records practical deployment choices for a very large MoE model: TP=8, Expert Parallel, disaggregated prefill/decode variants, NIXL KV transfer, and topology-aware placement. These values are not copied into UBL128. They are used as evidence that large MoE serving needs separate placement, parallelism, and KV transfer design.

### TensorRT-LLM

TensorRT-LLM provides the clearest engine-level evidence. `features/parallel-strategy.md` describes module-level parallelism choices; `features/disagg-serving.md` describes context/generation split and KV cache exchange; `developer-guide/kv-transfer.md` gives transfer components such as transceiver, sender/receiver, formatter, connection, and transfer agent. The page uses these as architectural patterns, not as platform dependencies.

### Megatron-LM

Megatron-LM is mainly used for process group and MoE communication concepts. It is training-oriented in many files, so claims must not be written as direct serving implementation advice without qualification. The valid lesson is the representation of parallel domains and collectives, not the adoption of Megatron training loop semantics.

### NIXL

NIXL validates that an inference transfer plane should abstract memory/storage types, backend selection, remote metadata, async transfer handles, and registration lifecycle. UBL128's SO/Urma/SSU backend would need its own implementation and semantics.

### Triton TensorRT-LLM Backend

The Triton backend is used only to clarify endpoint/runtime boundaries. It shows that production serving often separates HTTP/gRPC endpoint, preprocessing/postprocessing, model repository configuration, inflight batching, and runtime MPI execution.

## Negative Findings

- No surveyed NVIDIA repository directly implements UBL128, Ascend 950, UB, Urma, SU/SO/DCN, or SSU semantics.
- The survey did not run TensorRT-LLM, Dynamo, Megatron-LM, NIXL, or Triton backend locally. Claims are from source and documentation inspection.
- Dynamo/TensorRT-LLM DeepSeek recipes target NVIDIA hardware and software stacks. They are evidence for design patterns, not implementation compatibility.
- Megatron-LM is primarily a training framework; its process group and MoE communication concepts transfer better than its training schedules.
- `simpler` current public materials establish recursive worker design, but not a complete UBL128 serving runtime.

## Open Questions

- What is the exact DeepSeek V4 Pro operator and kernel set expected on Ascend 950, including attention variants, MoE experts, precision, speculative decoding, and fused kernels?
- Should `simpler` own the top-level serving router/planner, or expose primitives for a separate serving system?
- How will SO/Urma and SSU expose memory registration, remote descriptor exchange, completion notification, cancellation, and retry?
- What is the final boundary between NPU direct SSU read/write and CPU/agent-mediated LBA client behavior in the UBL128 materials?
- Which synchronization semantics should be blocking worker completion, streaming request progress, group collective completion, and KV transfer completion?

## Status-Change Criteria

This page can move from `draft` to `maintained` when:

- UBL128 V4 Pro target assumptions are confirmed against current model/platform design.
- `simpler` has a written design for worker groups, rank topology, transport domains, and KV block lifecycle.
- The Future page is linked from any follow-up spec or issue tracking UBL128 serving runtime work.

Claims can move from `recommendation` to `implemented` only after merged source, tests, examples, or official target materials demonstrate the behavior.
