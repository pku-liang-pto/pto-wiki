---
title: "Future Runtime Dispatch and Serving Roadmap Evidence"
type: evidence
status: draft
sources:
  - https://github.com/hw-native-sys/simpler/pull/711
  - https://github.com/hw-native-sys/pypto_top_level_documents/blob/main/UBL128_serving.md
  - https://grpc.io/docs/what-is-grpc/introduction/
  - https://grpc.io/docs/languages/python/basics/
  - https://protobuf.dev/overview/
last_updated: 2026-05-07
---

# Future Runtime Dispatch and Serving Roadmap Evidence

This ledger supports [Runtime Dispatch and Serving Roadmap](../future/runtime-dispatch-and-serving-roadmap.md) and [PR 711 gRPC Dispatch Primer](../future/pr711-grpc-dispatch-primer.md). It records the exact PR/document/material sources used on 2026-05-06 and the PR #711 gRPC source pass on 2026-05-07, then explains why claims are labelled `ongoing`, `emerging`, `design-intended`, `blocked`, or `open question`.

## Source Inventory

### GitHub PR

- Source: [hw-native-sys/simpler PR #711: Add Python distributed L4 to L3 dispatch](https://github.com/hw-native-sys/simpler/pull/711)
- State inspected: `OPEN`, `REVIEW_REQUIRED`, `MERGEABLE` on 2026-05-06.
- Head branch: `feat/l4-l3-distributed-dispatch`.
- Base branch: `main`.
- Commit inspected: `d8dba325c08c2ef02fc3328809e0d87251f3ad9b`.
- PR body summary: Python-first gRPC/protobuf distributed dispatch package for L4 -> remote L3; `Worker.add_remote_worker()` through local PROCESS mailbox shim; callable catalog, L3 daemon backend process, heartbeat, tensor-pool surface, examples, docs.
- PR body boundary: current e2e remote dispatch covers scalar `TaskArgs` and callable execution; full remote tensor materialization/output write-back remains future work.
- Review evidence: `gemini-code-assist` review on 2026-05-06 identifies raw memory pointers across host boundaries as critical risk and recommends catalog/cloudpickle/backend-termination improvements.
- CI evidence: most checks passed, but `pre-commit` check concluded `FAILURE` in the inspected status rollup.
- Changed-file anchors include:
  - `docs/distributed-l4-implementation.zh.md`
  - `docs/distributed-l4.md`
  - `examples/distributed/l4_l3_remote/*`
  - `python/simpler/distributed/catalog.py`
  - `python/simpler/distributed/l3_daemon.py`
  - `python/simpler/distributed/remote_proxy.py`
  - `python/simpler/distributed/rpc.py`
  - `python/simpler/distributed/tensor_pool.py`
  - `python/simpler/worker.py`
  - `tests/ut/py/test_distributed/*`

### External Top-Level Document

- Source: [hw-native-sys/pypto_top_level_documents `UBL128_serving.md`](https://github.com/hw-native-sys/pypto_top_level_documents/blob/main/UBL128_serving.md).
- Repository main commit inspected: `4f9e0b874156f212417408016288131a392f2dca`, committer date `2026-04-28T08:57:50Z`.
- Blob SHA inspected: `dd1443f7547b3ebb5d0374a352077f1c3bd0323f`.
- Retrieval method: `gh api repos/hw-native-sys/pypto_top_level_documents/contents/UBL128_serving.md`.
- Important anchors:
  - §1: UBL128 hardware, PC16, SU/SO/DCN network roles.
  - §2: one source/build artifact, configuration-driven scale across three hardware scenarios.
  - §3: KV cache, prefix cache, SSU/LBA storage model.
  - §5: F/M/PC/PN/DC/DN/S node matrix, SU/SO/DCN network selection, uRPC over UB Urma, end-to-end request lifecycle.
- Boundary: target-level serving design, not inspected as merged `simpler` or PyPTO implementation.

### Local User Materials

The current branch worktree did not contain the ad hoc material files. They were read from the user's main workspace material directory and were not copied into the wiki repository.

| Material | SHA-256 | Ingestion / conversion |
| --- | --- | --- |
| `/home/uvxiao/pto-wiki/materials/A5_send_recv_dispatch.pdf` | `4e8a62685184dc4d7c354c68567454838bc36bd659b44f85d5e01e5616007637` | PDF v1.4, 8 pages, converted with `pdftotext` on 2026-05-06. |
| `/home/uvxiao/pto-wiki/materials/L4_L3_data_plane_design.md` | `fd2894381e60c3d23f8d5c46dea7577a7a0f4d49b3ba40df7c36fc67557d6244` | Markdown read directly on 2026-05-06. |
| `/home/uvxiao/pto-wiki/materials/RUNTIME_OPEN_PROBLEMS.md` | `5c201d2c1b5aa2071d8b80f61577b9b49f1519c738308d44ad8054e26941546e` | Markdown read directly on 2026-05-06; document states it is based on `simpler` git HEAD `08f6f769` / PR #692 era. |

### External Concept Source

- [NVIDIA RoCE documentation](https://docs.nvidia.com/networking/display/Onyxv3104006/RDMA%2BOver%2BConverged%2BEthernet%2B%28RoCE%29) was used only to stabilize the general definition of `RoCE` as RDMA capability over Ethernet. Project-specific `UB`, `Urma`, `uRPC`, `SU`, and `SO` meanings come from the UBL128 material, not from NVIDIA.
- [gRPC Introduction](https://grpc.io/docs/what-is-grpc/introduction/) and [gRPC Python Basics tutorial](https://grpc.io/docs/languages/python/basics/) were used to stabilize the definitions of service, RPC method, client stub, server servicer, generated code, unary RPC, streaming RPC, and Python gRPC code generation.
- [Protocol Buffers Overview](https://protobuf.dev/overview/) was used to stabilize the definitions of `.proto` schema, generated message classes, serialization, cross-language compatibility, and protobuf limits for large scientific/tensor-like payloads.

## Claim Map

| Claim | Status | Evidence |
| --- | --- | --- |
| PR #711 adds an emerging Python-first L4 -> remote L3 dispatch path. | `ongoing` / `emerging` | PR #711 metadata, body, changed files, commit `d8dba325c08c2ef02fc3328809e0d87251f3ad9b`. |
| PR #711 should not be treated as implemented production remote tensor dispatch. | `open question` / `TODO` | PR body explicitly says scalar `TaskArgs` and callable execution are covered while full remote tensor materialization/output write-back remains future work; PR is still open/review-required. |
| PR #711's gRPC concept map is `.proto` -> generated message/stub code -> `RpcServer`/`RpcClient` -> `RemoteWorkerProxy`/`L3Daemon`. | `emerging` | PR #711 files `dispatch.proto`, `dispatch_pb2_grpc.py`, `rpc.py`, `remote_proxy.py`, `l3_daemon.py`; official gRPC Python docs for generated stub/servicer shape. |
| `Catalog` exists because remote hosts cannot use fork-inherited Python callable pointers. | `emerging` | PR #711 `catalog.py`, `remote_proxy.py`, `l3_daemon.py`, `worker.py`; existing runtime evidence about local fork/mailbox assumptions. |
| `L3Daemon` uses a backend process because `grpcio` server threads and `Worker(level=3)` fork behavior should not be mixed in one process. | `emerging` | PR #711 `docs/distributed-l4-implementation.zh.md` and `l3_daemon.py`. |
| Raw local memory pointers are invalid across host boundary. | `blocked` | Gemini review on PR #711; `RUNTIME_OPEN_PROBLEMS.md` shared-VA assumptions; data-plane design replaces raw pointer with pool handle, remote address, rkey. |
| L4/L3 tensor data should use a dual-plane design: control via RPC, tensor bytes via SHM/RDMA/Urma/NPU-direct. | `design-intended` | `materials/L4_L3_data_plane_design.md`; UBL128 §5 network model. |
| `TensorPool` is the bridge between RPC handles and registered data-plane memory. | `design-intended` | `materials/L4_L3_data_plane_design.md` §III.2 and §VIII. |
| A5 UB `jetty` send/receive can support zero-copy MoE/BGEMM receive-buffer compute if buffer ordering and stride invariants are preserved. | `design-intended` | `materials/A5_send_recv_dispatch.pdf` converted text, especially sections 1.1-1.8. |
| UBL128 serving design separates SU, SO, and DCN responsibilities and uses `uRPC over UB Urma` for hot-path internal RPC. | `design-intended` | `UBL128_serving.md` §1.3, §5.2, §5.5. |
| Runtime gaps include no remote next-level worker network management, incomplete callable registration, no async child-worker communication, and coupled platform ABI. | `open question` / `blocked` | `materials/RUNTIME_OPEN_PROBLEMS.md`, based on `simpler` HEAD `08f6f769`. |

## Material Routing

| Source | Routed To | Notes |
| --- | --- | --- |
| PR #711 | Future control-plane workstream | Used for live ongoing state, source anchors, PR boundaries, CI/review risk. |
| PR #711 gRPC/protobuf source files | [PR 711 gRPC Dispatch Primer](../future/pr711-grpc-dispatch-primer.md) | Used for the intuitive concept-to-code walkthrough requested in QA. |
| `UBL128_serving.md` | Future serving target workstream | Used for serving objective, F/M/PC/PN/DC/DN/S roles, SU/SO/DCN separation, request lifecycle. |
| `A5_send_recv_dispatch.pdf` | Future A5 zero-copy data-plane workstream | Used for `jetty`, free/receive queue, buffer-order invariant, stride tensor view, ping/pong pool constraints. |
| `L4_L3_data_plane_design.md` | Future L4/L3 tensor data-plane workstream | Used for dual-plane model, `TensorPool`, transport choices, synchronization, roadmap estimates. |
| `RUNTIME_OPEN_PROBLEMS.md` | Future blockers / open runtime problems | Used for gaps that gate remote L3 and transport evolution. |

## Negative Findings

- No inspected evidence proves PR #711 has merged into `simpler/main`.
- No inspected evidence proves PR #711 implements full tensor materialization and output write-back across hosts.
- No inspected evidence proves UBL128 serving design is implemented in `simpler`, PyPTO, or PTO-ISA.
- No inspected evidence proves A5 send/receive zero-copy dispatch has a runnable BGEMM/MoE example in this wiki pass.
- No inspected evidence resolves the platform ABI split described in `RUNTIME_OPEN_PROBLEMS.md`.

## Open Questions

- What exact `TensorRef` ABI should survive across PR #711 and the later data-plane implementation?
- Should output transfer default to L4 pull, L3 push, or policy-based selection?
- What should happen when a remote `TensorPool` is exhausted: block, fail, spill to TCP, or backpressure the scheduler?
- How should callable identity become stable across L2 chip callable, L3+ orch/sub callable, AICPU cache, and remote catalog?
- Where should A5 `jetty` receive-buffer stride support be tested: a unit kernel, a MoE example, or a full serving path?
- Which UBL128 serving roles map directly to `simpler` Worker levels, and which belong outside `simpler` as service-level orchestration?

## Status Change Criteria

- Move PR #711 claims from `ongoing` to `implemented` only after the PR is merged, the merged commit is cited, and wiki pages show source-shaped code walkthroughs for the new API and dispatch path.
- Move tensor data-plane claims from `design-intended` to `implemented` only after source/tests/examples prove cross-host tensor input/output with handles instead of raw VA.
- Move A5 zero-copy dispatch claims from `design-intended` to `implemented` only after code or examples prove stride-aware compute directly on receive buffers.
- Move UBL128 serving claims out of Future only after repository source, tests, examples, or merged design-to-implementation PRs provide implemented evidence.
