---
title: "Future Runtime Dispatch and Serving Roadmap Evidence"
type: evidence
status: draft
sources:
  - https://github.com/hw-native-sys/simpler/pull/711
  - https://github.com/hengliao1972/pypto_top_level_design_documents/blob/main/simpler_distributed_runtime_design.md
  - https://github.com/hw-native-sys/pypto_top_level_documents/blob/main/UBL128_serving.md
  - ../materials/simpler_distributed_runtime_design.md
  - ../materials/UBL128_serving.md
  - https://grpc.io/docs/what-is-grpc/introduction/
  - https://grpc.io/docs/languages/python/basics/
  - https://protobuf.dev/overview/
  - https://docs.nvidia.com/networking/display/RDMAAwareProgrammingv17/Key+Concepts
  - https://docs.redhat.com/documentation/pt/red_hat_enterprise_linux/7/html/networking_guide/sec-configuring_soft-_roce
last_updated: 2026-05-08
---

# Future Runtime Dispatch and Serving Roadmap Evidence

This ledger supports [Runtime Dispatch and Serving Roadmap](../future/runtime-dispatch-and-serving-roadmap.md) and [PR 711 Remote Dispatch and Data Plane Primer](../future/pr711-grpc-dispatch-primer.md). It records the exact PR/document/material sources used on 2026-05-06, the first PR #711 gRPC source pass on 2026-05-07, the PR #711 RXE/data-plane sync on 2026-05-08, and the direct material publication of `simpler_distributed_runtime_design.md` / `UBL128_serving.md` on 2026-05-08.

## Source Inventory

### GitHub PR

- Source: [hw-native-sys/simpler PR #711: Add Python distributed L4 to L3 dispatch](https://github.com/hw-native-sys/simpler/pull/711).
- State inspected: `OPEN`, `REVIEW_REQUIRED` on 2026-05-08.
- Head branch: `feat/l4-l3-distributed-dispatch`.
- Base branch: `main`.
- Head commit inspected: `2dd89eeaff9164166a6b4f36edce3c4621777b53`.
- Local inspection path: `/tmp/simpler-pr711`, branch `pr711`, synced to the PR head above.
- PR comment evidence: `jvjhfhg` review comment on 2026-05-07 noted that the original example misleadingly implied remote execution could mutate L4-local closure state. The PR later added `docs(distributed): fix remote result example`, changing the example to return through an `OUTPUT_EXISTING` tensor.

Commits inspected:

| Commit | Role In This Evidence Pass |
| --- | --- |
| `d8dba325c08c2ef02fc3328809e0d87251f3ad9b` | Initial Python distributed L4 -> L3 dispatch, gRPC/protobuf, catalog, daemon, remote worker shim. |
| `2adeb0ae2b01eda3369da903ec5f404a8215d46c` | Adds L4/L3 RXE data plane, transport backend, RXE helper, HCOMM adapter hooks, tensor output writeback path. |
| `92abca766e0093e77e1cb1420f0529ad86103417` | Fixes remote result example so result returns through `OUTPUT_EXISTING` tensor rather than closure mutation. |
| `b6cc6ddcb186a6d7c6f36b1656c09d2bb309486e` | Adds L4/L3 distributed review guide. |
| `a3ea12e8109cab5a464b93bcce601e94d1a35400` | Aligns review guide with serving design. |
| `2dd89eeaff9164166a6b4f36edce3c4621777b53` | Adds L4 review glossary; current inspected head. |

Changed-file anchors used for implementation claims:

- `docs/distributed-l4-control-data-plane-rxe.zh.md`
- `docs/l4-l3-distributed-review-guide.zh.md`
- `docs/distributed-l4-implementation.zh.md`
- `examples/distributed/l4_l3_remote/l4_master.py`
- `examples/distributed/l4_l3_remote/README.md`
- `python/simpler/distributed/proto/dispatch.proto`
- `python/simpler/distributed/remote_proxy.py`
- `python/simpler/distributed/l3_daemon.py`
- `python/simpler/distributed/serialization.py`
- `python/simpler/distributed/tensor_pool.py`
- `python/simpler/distributed/transport_backend.py`
- `python/simpler/distributed/rxe_verbs_helper.c`
- `python/simpler/distributed/hcomm_abi_shim.cc`
- `python/simpler/worker.py`
- `src/common/hierarchical/worker_manager.cpp`
- `tests/ut/py/test_distributed/test_l4_l3_remote.py`
- `tests/ut/py/test_distributed/test_tensor_pool.py`
- `tests/ut/py/test_distributed/test_transport_backend.py`
- `tests/ut/py/test_distributed/test_real_e2e_smoke.py`
- `tests/ut/py/test_distributed/test_rxe_real.py`
- `tools/test_rxe_data_plane.sh`
- `tools/benchmark_rxe_data_plane.py`

### External Top-Level Documents

- Source: [hengliao1972/pypto_top_level_design_documents `simpler_distributed_runtime_design.md`](https://github.com/hengliao1972/pypto_top_level_design_documents/blob/main/simpler_distributed_runtime_design.md).
- Repository main commit inspected: `7faac0b910e40989a6bbd381a80595b65ab29708`, committer date `2026-04-27T17:22:43Z`.
- Blob SHA inspected: `6ae4e40a30a87723432e7c24ec51f587916f4469`.
- Raw source SHA-256: `a701ed6452c2b52f13fa3c0fb2af7132823fcdf7787e9afca504449af2423393`.
- Important anchors: level definitions L1/L2/L3/L4+; `IWorker.run(payload)`; `ChipWorker` / `SubWorker` / `DistWorker` hierarchy; C++ scheduler and worker-thread architecture; HostSubWorker fork+shared-memory mailbox; zero-copy tensor ownership; callable registry inheritance; relationship with Linqu runtime.
- Boundary: design material for HostWorker / DistWorker shape. Specific implementation status still requires `simpler` source/test evidence.

- Source: [hw-native-sys/pypto_top_level_documents `UBL128_serving.md`](https://github.com/hw-native-sys/pypto_top_level_documents/blob/main/UBL128_serving.md).
- Repository main commit inspected: `4f9e0b874156f212417408016288131a392f2dca`, committer date `2026-04-28T08:57:50Z`.
- Blob SHA inspected: `dd1443f7547b3ebb5d0374a352077f1c3bd0323f`.
- Raw source SHA-256: `d8fbe3275e6d51aea4fb16ad4447910d2700b2db1f8bf24f65df8ad35fb133d0`.
- Important anchors: UBL128 hardware/PC16/SU/SO/DCN network roles; one source/build artifact; KV cache and prefix cache; KV Meta Server prefix radix tree and SSU/LBA allocation; F/M/PC/PN/DC/DN/S node matrix; uRPC over UB Urma; end-to-end request lifecycle.
- Boundary: target-level serving design, not inspected as merged `simpler` or PyPTO implementation.

### Published Material Copies

The user explicitly requested these GitHub documents to be present directly under both `materials/` and `wiki/materials/`.

| Material Copy | SHA-256 | Notes |
| --- | --- | --- |
| `materials/simpler_distributed_runtime_design.md` | `a701ed6452c2b52f13fa3c0fb2af7132823fcdf7787e9afca504449af2423393` | Raw copy of upstream source material. |
| `materials/UBL128_serving.md` | `d8fbe3275e6d51aea4fb16ad4447910d2700b2db1f8bf24f65df8ad35fb133d0` | Raw copy of upstream source material. |
| `wiki/materials/simpler_distributed_runtime_design.md` | `3f85e3d6329aeff8cee43e6afc9856658e0a2e743fb753f424ad5be995faedcd` | Public wiki copy; one relative link was rewritten to the upstream GitHub target so the rendered wiki has no broken local link. |
| `wiki/materials/UBL128_serving.md` | `dec075d4aa80a917ede42474242d564521a9b466050b2f0950a6bce3212d87a6` | Public wiki copy; one relative link was rewritten to the upstream GitHub target so the rendered wiki has no broken local link. |

### Older Local User Materials

The following pre-existing local material files were read from `/home/uvxiao/pto-wiki/materials/` in the earlier roadmap pass. They remain separate from the two GitHub top-level documents published above.

| Material | SHA-256 | Ingestion / conversion |
| --- | --- | --- |
| `materials/A5_send_recv_dispatch.pdf` | `4e8a62685184dc4d7c354c68567454838bc36bd659b44f85d5e01e5616007637` | PDF v1.4, 8 pages, converted with `pdftotext` on 2026-05-06. |
| `materials/L4_L3_data_plane_design.md` | `fd2894381e60c3d23f8d5c46dea7577a7a0f4d49b3ba40df7c36fc67557d6244` | Markdown read directly on 2026-05-06. |
| `materials/RUNTIME_OPEN_PROBLEMS.md` | `5c201d2c1b5aa2071d8b80f61577b9b49f1519c738308d44ad8054e26941546e` | Markdown read directly on 2026-05-06; document states it is based on `simpler` git HEAD `08f6f769` / PR #692 era. |

### External Concept Sources

- [gRPC Introduction](https://grpc.io/docs/what-is-grpc/introduction/) and [gRPC Python Basics tutorial](https://grpc.io/docs/languages/python/basics/) stabilize definitions of service, RPC method, client stub, server servicer, generated code, unary RPC, streaming RPC, and Python gRPC code generation.
- [Protocol Buffers Overview](https://protobuf.dev/overview/) stabilizes `.proto` schema, generated message classes, serialization, cross-language compatibility, and protobuf limits for large payloads.
- [NVIDIA RDMA Key Concepts](https://docs.nvidia.com/networking/display/RDMAAwareProgrammingv17/Key+Concepts) stabilizes MR, rkey, QP, CQ, and work-completion language for the RXE explanation.
- [Red Hat Soft-RoCE documentation](https://docs.redhat.com/documentation/pt/red_hat_enterprise_linux/7/html/networking_guide/sec-configuring_soft-_roce) stabilizes the general meaning of Soft-RoCE/RXE as a software RDMA transport. Project-specific RXE behavior comes from PR #711 source files.
- [NVIDIA RoCE documentation](https://docs.nvidia.com/networking/display/Onyxv3104006/RDMA%2BOver%2BConverged%2BEthernet%2B%28RoCE%29) was used in the earlier roadmap pass to stabilize the general definition of RoCE as RDMA capability over Ethernet. Project-specific `UB`, `Urma`, `uRPC`, `SU`, and `SO` meanings come from UBL128 material.

## Claim Map

| Claim | Status | Evidence |
| --- | --- | --- |
| PR #711 adds an emerging Python-first L4 -> remote L3 dispatch path. | `ongoing` / `emerging` | PR #711 metadata and source at head `2dd89ee`; `dispatch.proto`, `remote_proxy.py`, `l3_daemon.py`, `worker.py`. |
| PR #711 now includes host-memory remote tensor prototype, not just scalar dispatch. | `ongoing` / `emerging` | `TensorRef`, `TensorHandle`, `TensorPool` RPCs in `dispatch.proto`; staging/writeback logic in `remote_proxy.py`, `serialization.py`, `tensor_pool.py`; tests in `test_l4_l3_remote.py` and `test_tensor_pool.py`. |
| PR #711 should not be treated as merged or production remote tensor dispatch. | `open question` / `TODO` | PR state is open/review-required; docs list RXE helper, INOUT, descriptor, failure, and cross-node validation limitations. |
| PR #711's control-plane concept map is `.proto` -> generated message/stub code -> `RpcServer`/`RpcClient` -> `RemoteWorkerProxy`/`L3Daemon`. | `emerging` | PR #711 files `dispatch.proto`, generated `dispatch_pb2_grpc.py`, `rpc.py`, `remote_proxy.py`, `l3_daemon.py`; official gRPC Python docs. |
| `Catalog` exists because remote hosts cannot use fork-inherited Python callable pointers. | `emerging` | `catalog.py`, `remote_proxy.py`, `l3_daemon.py`, `worker.py`; PR comment about closure mutation; runtime open problems about fork/local address assumptions. |
| `L3Daemon` uses a backend process because gRPC server threads and `Worker(level=3)` fork behavior should not be mixed in one process. | `emerging` | `l3_daemon.py`; `docs/l4-l3-distributed-review-guide.zh.md`; `docs/distributed-l4-control-data-plane-rxe.zh.md`. |
| `TensorPool` is the bridge between RPC handles and backend storage/registered memory. | `emerging` + `design-intended` | Implemented bytearray pool in `tensor_pool.py`; design target in `materials/L4_L3_data_plane_design.md`; PR docs explain future production pool constraints. |
| PR #711 implements RXE/ibverbs host-memory data-plane MVP. | `emerging` | `RxeTensorTransport`, `RxeDataPlaneClient`, `RxeRuntime`, `_encode_rxe_desc`, `rxe_verbs_helper.c`, `test_rxe_real.py`, `test_real_e2e_smoke.py`, `tools/test_rxe_data_plane.sh`. |
| PR #711 implements large `OUTPUT` / `OUTPUT_EXISTING` RXE local output writeback with fallback. | `emerging` | `_stage_local_output_tensor` and `_is_local_output_ack` in `remote_proxy.py`; `RemoteTensorWriteback` and `encode_output_tensor_refs` in `serialization.py`; PR docs and tests. |
| `INOUT` does not yet have a complete two-way RXE fast path. | `TODO` | PR docs state `INOUT` still uses input staging because it needs initial L4->L3 value plus L3->L4 result; code only classifies `OUTPUT` and `OUTPUT_EXISTING` as remote-output writeback tags. |
| HCOMM support is optional adapter work, not the main proved data-plane path. | `emerging` / `partial` | `HcommRuntime`, `HcommTensorTransport`, `HcommDataPlaneClient`, `hcomm_abi_shim.cc`, HCOMM smoke tests; PR docs name RXE as main real smoke/E2E path. |
| Raw local memory pointers are invalid across host boundary. | `blocked` / constraint | Gemini review on PR #711; user review comment about closure/local state; `RUNTIME_OPEN_PROBLEMS.md`; tensor refs and transport handles replace raw pointer assumptions. |
| HostWorker / DistWorker design uses a recursive `IWorker.run(payload)` model across `ChipWorker`, `SubWorker`, and `DistWorker`. | `design-intended` / `context` | `simpler_distributed_runtime_design.md` sections 1-4 and 8. |
| HostSubWorker design depends on fork-before-threading, shared-memory mailbox, and fork-COW callable registry inheritance. | `design-intended` / `context` | `simpler_distributed_runtime_design.md` sections 4.1-4.6. |
| A5 UB `jetty` send/receive can support zero-copy MoE/BGEMM receive-buffer compute if buffer ordering and stride invariants are preserved. | `design-intended` | `materials/A5_send_recv_dispatch.pdf` converted text, especially sections 1.1-1.8. |
| UBL128 serving design separates SU, SO, and DCN responsibilities and uses `uRPC over UB Urma` for hot-path internal RPC. | `design-intended` | `UBL128_serving.md` sections 1.3, 5.2, and 5.5. |
| UBL128 KV design keeps CPU out of KV byte movement: Meta server returns ChunkRecord/LBA metadata; NPU reads/writes SSU bytes through SO Urma. | `design-intended` | `UBL128_serving.md` sections 3.6 and 5.5. |
| Runtime gaps include no production remote next-level worker management, incomplete callable registration, no async child-worker communication, and coupled platform ABI. | `open question` / `blocked` | `materials/RUNTIME_OPEN_PROBLEMS.md`, based on `simpler` HEAD `08f6f769`. |

## Material Routing

| Source | Routed To | Notes |
| --- | --- | --- |
| PR #711 | Future control/data-plane workstreams | Used for live ongoing state, source anchors, PR boundaries, review risk, and current code shape. |
| PR #711 gRPC/protobuf/RXE source files | [PR 711 Remote Dispatch and Data Plane Primer](../future/pr711-grpc-dispatch-primer.md) | Used for self-contained concept-to-code walkthrough requested in QA and updated after new commits. |
| `simpler_distributed_runtime_design.md` | Future HostWorker / DistWorker baseline | Used for recursive worker model, local fork+shared-memory assumptions, and the contrast with PR #711 cross-host handles. |
| `UBL128_serving.md` | Future serving target workstream | Used for serving objective, F/M/PC/PN/DC/DN/S roles, SU/SO/DCN separation, KV Meta/SSU/LBA model, and request lifecycle. |
| `A5_send_recv_dispatch.pdf` | Future A5 zero-copy data-plane workstream | Used for `jetty`, free/receive queue, buffer-order invariant, stride tensor view, ping/pong pool constraints. |
| `L4_L3_data_plane_design.md` | Future L4/L3 tensor data-plane workstream | Used for dual-plane model, `TensorPool`, transport choices, synchronization, roadmap estimates. |
| `RUNTIME_OPEN_PROBLEMS.md` | Future blockers / open runtime problems | Used for gaps that gate remote L3 and transport evolution. |

## Negative Findings

- No inspected evidence proves PR #711 has merged into `simpler/main`.
- No inspected evidence proves PR #711 is production-ready remote tensor dispatch. It is a host-memory prototype on an open PR branch.
- No inspected evidence proves PR #711 implements UBL128 serving frontend, prefill/decode split, continuous batching, KV Meta Server, SSU LBA allocation, NPU->SSU SO/UB Urma KV data plane, or production SO uRPC hot path.
- No inspected evidence proves RXE performance is production-representative; PR docs describe current helper as one-write RC QP + TCP control MVP.
- No inspected evidence proves `INOUT` has a complete two-way RXE fast path.
- No inspected evidence proves every HostWorker / DistWorker statement in `simpler_distributed_runtime_design.md` is implemented in the current `simpler/main`; it is used as design context until source-mapped.
- No inspected evidence proves A5 send/receive zero-copy dispatch has a runnable BGEMM/MoE example in this wiki pass.
- No inspected evidence resolves the platform ABI split described in `RUNTIME_OPEN_PROBLEMS.md`.

## Open Questions

- What exact `TensorRef` ABI should survive across PR #711 and later production data-plane implementation?
- Should output transfer default to L4 pull, L3 push, RXE ACK, or policy-based selection?
- Should explicit `rxe` input failure always fail fast, or should users be able to request fallback?
- What should happen when remote `TensorPool` is exhausted: block, fail, spill to TCP, or backpressure the scheduler?
- How should callable identity become stable across L2 chip callable, L3+ orch/sub callable, AICPU cache, and remote catalog?
- Which HostWorker / DistWorker design claims already match current `simpler/main`, and which have been superseded by PR #711 or other runtime changes?
- Where should A5 `jetty` receive-buffer stride support be tested: a unit kernel, a MoE example, or a full serving path?
- Which UBL128 serving roles map directly to `simpler` Worker levels, and which belong outside `simpler` as service-level orchestration?

## Status Change Criteria

- Move PR #711 claims from `ongoing` to `implemented` only after the PR is merged, the merged commit is cited, and wiki pages show source-shaped code walkthroughs for the new API, dispatch path, tensor path, and limitations.
- Move RXE host-memory prototype claims from `emerging` to `implemented` only after the merged source commit and tests are re-read from `simpler/main`.
- Move production tensor data-plane claims from `design-intended` to `implemented` only after source/tests/examples prove cross-host tensor input/output with handles instead of raw VA, with pool lifetime, failure, and concurrency behavior.
- Move HostWorker / DistWorker design claims to `implemented` only after current `simpler/main` source and tests are mapped at an exact commit.
- Move A5 zero-copy dispatch claims from `design-intended` to `implemented` only after code or examples prove stride-aware compute directly on receive buffers.
- Move UBL128 serving claims out of Future only after repository source, tests, examples, or merged design-to-implementation PRs provide implemented evidence.
