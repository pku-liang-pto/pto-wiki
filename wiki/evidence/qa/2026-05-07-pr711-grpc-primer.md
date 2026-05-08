---
title: "QA: PR 711 gRPC Dispatch Primer"
type: evidence
status: promoted
last_updated: 2026-05-07
---

# QA: PR 711 gRPC Dispatch Primer

## Question

User reported that gRPC and the implementation details in `simpler` PR #711 are hard to understand, and asked for intuitive, visual preparation materials.

## Short Answer

The wiki needed a bridge page between the runtime roadmap and PR #711 source. I promoted the QA into [PR 711 gRPC Dispatch Primer](../../future/pr711-grpc-dispatch-primer.md), which explains gRPC/protobuf basics, generated Python stubs, PR #711 services, L4-side proxy/mailbox shim, L3-side daemon/backend process, minimal example, error model, and current status boundaries.

## Source Trail

- Existing wiki:
  - [Runtime Dispatch and Serving Roadmap](../../future/runtime-dispatch-and-serving-roadmap.md)
  - [Future Runtime Dispatch and Serving Roadmap Evidence](../future-runtime-dispatch-and-serving-roadmap.md)
- GitHub:
  - [hw-native-sys/simpler PR #711](https://github.com/hw-native-sys/simpler/pull/711), inspected on 2026-05-07.
  - Commit inspected: `d8dba325c08c2ef02fc3328809e0d87251f3ad9b`.
  - Key files inspected at that commit:
    - `python/simpler/distributed/proto/dispatch.proto`
    - `python/simpler/distributed/proto/dispatch_pb2_grpc.py`
    - `python/simpler/distributed/rpc.py`
    - `python/simpler/distributed/remote_proxy.py`
    - `python/simpler/distributed/l3_daemon.py`
    - `python/simpler/distributed/catalog.py`
    - `python/simpler/distributed/serialization.py`
    - `python/simpler/distributed/tensor_pool.py`
    - `python/simpler/worker.py`
    - `examples/distributed/l4_l3_remote/l4_master.py`
    - `tests/ut/py/test_distributed/test_l4_l3_remote.py`
    - `tests/ut/py/test_distributed/test_rpc_roundtrip.py`
- Official docs:
  - [gRPC Introduction](https://grpc.io/docs/what-is-grpc/introduction/)
  - [gRPC Python Basics tutorial](https://grpc.io/docs/languages/python/basics/)
  - [Protocol Buffers Overview](https://protobuf.dev/overview/)

## Uncertainty

PR #711 is still `OPEN` / `REVIEW_REQUIRED` in the inspected state. The primer intentionally describes the emerging PR shape rather than merged `simpler/main` behavior.

## Promotion Status

`promoted`: stable learning content was added to `wiki/future/pr711-grpc-dispatch-primer.md`.
