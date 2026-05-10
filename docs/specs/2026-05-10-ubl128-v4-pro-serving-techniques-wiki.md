# UBL128 V4 Pro Serving Techniques Wiki Spec

Status: draft for PR review
Date: 2026-05-10
Scope: specification and PR content alignment for `codex/ubl128-v4-pro-serving-techniques`

## Goal

Upgrade PR #8 from a single survey page into a small Future learning package about the techniques required for DeepSeek V4 Pro serving on UBL128 HBD.

The package should help a developer understand:

- what the UBL128 V4 Pro serving target requires;
- what to learn from NVIDIA-targeted large LLM serving stacks;
- how kernels, collectives, KV transfer, and serving orchestration compose from one device to hundreds of devices;
- which ideas should be extracted as reusable lessons for `simpler` distributed runtime design;
- which parts are verified source survey, UBL128 design intent, or recommendation rather than implemented behavior.

This PR should remain a documentation PR. It should not implement runtime code or claim that `simpler` already supports UBL128 serving.

## Placement Decision

The new pages must live under `wiki/future/`, not `wiki/topics/` or `wiki/concepts/`.

Reason:

- `wiki/topics/` should remain focused on implemented or stable target-set behavior.
- The UBL128 V4 Pro work is target architecture, source survey, and design-intended runtime requirements.
- The pages can still be concept/topic-like in writing style: self-contained, visual, code/pseudocode-rich, and structured for learning.
- Once `simpler` has merged implementation evidence, selected sections can later be promoted into `wiki/topics/` or `wiki/concepts/` with new evidence labels.

## Source Scope

### Target Materials

Mandatory target materials:

- `wiki/materials/UBL128_serving.md`
- `wiki/materials/simpler_distributed_runtime_design.md`

These are the goal and design foundation. `UBL128_serving.md` defines the serving target. `simpler_distributed_runtime_design.md` defines the current recursive worker design that future serving work must build on or deliberately extend.

### Reference Systems

The PR should survey cloned source and documentation for:

- `ai-dynamo/dynamo`
- `NVIDIA/TensorRT-LLM`
- `NVIDIA/Megatron-LM`
- `ai-dynamo/nixl`
- `triton-inference-server/tensorrtllm_backend`

The survey should prefer source files, official repository docs, examples, deployment recipes, and implementation-facing design docs over external articles. Internet lookup may be used for current or missing concepts, but the wiki must cite exact source snapshots in the evidence ledger when the claim is about a repository.

### What To Learn From Each Source

#### Dynamo

Learn:

- datacenter-scale inference orchestration above engines;
- disaggregated prefill/decode pool structure;
- KV-aware routing and KVBM;
- planner / placement / scaling concepts;
- DeepSeek-V4-Pro and gpt-oss recipe shapes;
- how deployment recipes encode topology, model size, parallelism, and data-plane assumptions.

Extract:

- a serving orchestration mental model;
- a request lifecycle from frontend/router to prefill/decode workers;
- lessons for keeping `simpler` runtime primitives below, not inside, a fleet serving platform.

#### TensorRT-LLM

Learn:

- engine runtime responsibilities beyond kernel launch;
- TP, PP, DP, EP, CP, Wide-EP parallelism choices;
- KV cache block/page management and reuse;
- disaggregated serving and KV cache exchange;
- scheduler interaction with KV capacity and batching;
- DeepSeek/gpt-oss-related deployment and optimization concepts.

Extract:

- kernel/runtime composition from single rank to parallel group;
- KV cache lifecycle concepts;
- module-level parallelism instead of one global parallelism flag;
- MoE expert slot / placement lessons.

#### Megatron-LM

Learn:

- explicit process group construction for TP/PP/CP/EP/DP;
- pipeline P2P send/receive model;
- MoE token dispatch/combine all-to-all;
- dynamic token-count synchronization and communication overlap;
- what is transferable from training-oriented code and what is not.

Extract:

- a Future page section explaining large-domain synchronization as rank groups;
- a warning that Megatron training schedules are not serving implementation proof;
- MoE dispatch metadata requirements for `simpler`.

#### NIXL

Learn:

- memory section, transfer backend, metadata handler, transfer agent;
- initialization-time memory registration and remote metadata exchange;
- async transfer handles, completion checks, notifications, and backend plugins;
- CPU/GPU/storage memory abstraction for inference transfer.

Extract:

- a data-plane abstraction model for SO/Urma/SSU;
- lessons for registered memory pools, descriptor exchange, and transfer completion;
- a boundary between serving conductor and transfer backend.

#### Triton TensorRT-LLM Backend

Learn:

- endpoint/model repository layer;
- preprocessing/postprocessing/ensemble boundary;
- inflight batching configuration;
- MPI leader/orchestrator deployment boundary;
- why an endpoint is not the runtime.

Extract:

- a Future section explaining `F` as endpoint/router and why kernel orchestration must live below it;
- lessons for external API, cancellation, streaming, and deployment boundary.

## Required Future Page Split

The PR should split the current single Future page into a small package. The existing `wiki/future/ubl128-v4-pro-serving-techniques.md` becomes the index / synthesis / reading path.

### `wiki/future/ubl128-v4-pro-serving-techniques.md`

Role: package entry and synthesis.

Required content:

- one-screen statement of the goal;
- reading path across the subpages;
- summary of the four-layer model:
  - `KernelRuntime`
  - `ParallelGroupRuntime`
  - `ServingRuntime`
  - `FleetRuntime`
- status boundary: source survey and recommendations, not implemented behavior;
- links to the paired evidence ledger.

This page should be shorter than the first PR version. Detailed explanations move into the subpages.

### `wiki/future/ubl128-serving-target.md`

Role: explain the target system that every later page is trying to satisfy.

Required content:

- UBL128 HBD / PC16 / Ascend 950 / SSU / SSU12 explanation;
- SU, SO, DCN network roles and protocol boundary;
- scenario C as the main V4 Pro target;
- F/M/PC/PN/DC/DN/S roles;
- prefill, decode, KV Meta, SSU, prefix cache and external ingress in one diagram;
- why this target is not equivalent to NVIDIA GB200/NVL72 even when the design lessons rhyme.

Acceptance:

- A reader can understand the UBL128 target without opening `UBL128_serving.md`.
- The page keeps Chinese narrative and English identifiers.
- The page clearly labels target claims as `design-intended`.

### `wiki/future/nvidia-llm-serving-stack-map.md`

Role: explain the reference systems and what each contributes to the survey.

Required content:

- Dynamo, TensorRT-LLM, Megatron-LM, NIXL, Triton TensorRT-LLM backend;
- a layered stack diagram;
- what to learn and what not to copy from each;
- DeepSeek-V4-Pro and gpt-oss recipe relevance;
- evidence links to the source inventory.

Acceptance:

- The page is not a list of links.
- It teaches why these systems are relevant to UBL128.
- It avoids implying CUDA/NCCL/NVLink compatibility with UBL128.

### `wiki/future/kernel-and-parallel-orchestration.md`

Role: explain how kernels and synchronization compose from one device to hundreds.

Required content:

- single-rank kernel sequence for decode/prefill;
- stream/event/graph capture intuition where relevant;
- TP, PP, DP, EP, CP and Wide-EP as runtime group patterns;
- MoE router -> token dispatch -> local expert compute -> combine flow;
- all-reduce, all-gather, reduce-scatter, P2P, all-to-all as synchronization patterns;
- UBL128 mapping: which traffic wants SU and which traffic must not pollute SU;
- source-shaped pseudocode for an engine iteration and MoE dispatch metadata.

Acceptance:

- A reader can explain why `remote Worker.run()` is insufficient for V4 Pro serving.
- The page includes diagrams and pseudocode, not only prose.
- The page distinguishes training-oriented Megatron evidence from serving recommendations.

### `wiki/future/kv-prefill-decode-handoff.md`

Role: explain KV cache and disaggregated prefill/decode as a protocol.

Required content:

- prefill vs decode compute characteristics;
- KV block/page/chunk mental model;
- prefix reuse and metadata;
- TensorRT-LLM KV cache and disaggregated serving lessons;
- Dynamo/KVBM/NIXL lessons;
- UBL128 KV Meta / `ChunkRecord` / SSU LBA / SO Urma mapping;
- handoff metadata fields and lifecycle:
  - request id
  - prefix hash
  - token range
  - layer/chunk ids
  - storage location
  - completion fence
  - lease/refcount
  - cancellation/failure action

Acceptance:

- A reader understands that prefill-to-decode handoff is not just `send_tensor`.
- The page states the unresolved NPU-direct SSU vs CPU/agent LBA-client boundary as an open question if still unresolved.
- The page gives design recommendations without claiming implementation.

### `wiki/future/simpler-runtime-lessons-for-ubl128-serving.md`

Role: translate the survey into concrete `simpler` runtime design requirements.

Required content:

- current `simpler_distributed_runtime_design.md` foundation:
  - `IWorker.run(payload)`
  - `ChipWorker`
  - `SubWorker`
  - `DistWorker`
  - L3 HostWorker / fork+shm mailbox
  - L4+ recursive intent;
- required new abstractions:
  - `WorkerGroup`
  - `ExecutionPlan`
  - `TransportPlan`
  - `KVBlockManager`
  - `MoEFragment`
  - async serving request lifecycle;
- staged implementation slices:
  1. group runtime skeleton;
  2. KV block metadata prototype;
  3. MoE dispatch metadata slice;
  4. disaggregated prefill/decode mini serving;
  5. transport domain backend;
- what belongs inside `simpler` and what should remain above it.

Acceptance:

- The page is actionable enough to become a later implementation spec.
- It does not over-prescribe code structure that has not been designed.
- It keeps `simpler` implementation status separate from future recommendations.

## Evidence Strategy

Keep one paired evidence ledger for this PR unless the evidence becomes too large:

- `wiki/evidence/future-ubl128-v4-pro-serving-techniques.md`

The ledger must include:

- local material checksums;
- repository commits;
- source inventory by repository;
- claim map;
- negative findings;
- open questions;
- status-change criteria.

The ledger should support all subpages. Each Future subpage should cite the evidence ledger in frontmatter or nearby prose when it relies on cross-repository/source-survey claims.

## Navigation Requirements

Update:

- `wiki/future/index.md`
- `wiki/evidence/index.md`
- `wiki/.vitepress/config.mts`
- `wiki/index.md`
- `wiki/overview.md`
- `wiki/log.md`

The sidebar should show the Future package in a readable order:

1. Future index
2. UBL128 V4 Pro Serving Techniques
3. UBL128 Serving Target
4. NVIDIA LLM Serving Stack Map
5. Kernel and Parallel Orchestration
6. KV Prefill/Decode Handoff
7. Simpler Runtime Lessons for UBL128 Serving
8. PR 711 Dispatch/Data Plane
9. Runtime Dispatch and Serving Roadmap

## Writing Requirements

All new Future pages must follow the wiki standalone learning standard:

- Chinese-first narrative with English technical identifiers preserved.
- Self-contained explanation before source links.
- Concise but information-rich paragraphs.
- ASCII diagrams for topology, data flow, runtime layers, and synchronization.
- Source-shaped pseudocode where it clarifies runtime behavior.
- Explicit status labels:
  - `design-intended` for UBL128 target claims;
  - `verified source survey` for reference stack claims;
  - `recommendation` for `simpler` design lessons;
  - `open question` where evidence is incomplete or conflicting.
- Tables may summarize, but cannot replace explanation.
- Avoid copying long upstream text or treating upstream docs as the wiki content.

## Non-Goals

- Do not move these pages to `wiki/topics/` or `wiki/concepts/` in this PR.
- Do not document all of TensorRT-LLM, Dynamo, Megatron-LM, NIXL, or Triton backend exhaustively.
- Do not claim UBL128 runs CUDA/NCCL/NVLink or NVIDIA frameworks.
- Do not implement runtime code.
- Do not turn evidence pages into tutorials.
- Do not make the PR depend on running NVIDIA software locally.

## Verification Plan

Run:

- `git diff --check`
- `npm run wiki:links`
- `npm run docs:build:pages`
- `npm run check`

Manual review:

- each Future page has a clear role and first-screen teaching goal;
- every subpage links back to the package entry or evidence ledger;
- no Future recommendation is mislabeled as implemented behavior;
- navigation order matches the designed reading path;
- evidence ledger covers every external/source-survey claim family.

## Open Questions For Review

- Whether `wiki/future/ubl128-serving-target.md` should cite `UBL128_serving.md` as the single source of truth or duplicate enough topology detail to fully stand alone.
- Whether `simpler-runtime-lessons-for-ubl128-serving.md` should remain a learning page or become a later implementation design spec.
- Whether more source repositories should be surveyed before implementation, such as vLLM, SGLang, DeepEP, FlashInfer, or DeepGEMM. They are intentionally out of the first package unless review says they are necessary.
