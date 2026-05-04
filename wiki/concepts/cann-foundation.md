---
title: "CANN Foundation"
type: concept
status: draft
sources:
  - config/target-set.yml
  - repositories/hccl/
  - wiki/evidence/distributed-execution.md
last_updated: 2026-05-04
---

# CANN Foundation

本页解释 CANN-side repositories 在本 wiki 中的定位。当前 PTO pass 深入覆盖的是 `simpler`、`pto-isa` 和 `pypto`；CANN-side 项目主要作为 communication / memory / interconnect / recipe supporting layer 出现，除 `hccl` 有少量 source inspection 外，其余项目还不能当作已完整审计。

## Current Mental Model

```text
PTO / PyPTO / simpler control and programming layers
  -> PTO-ISA kernel tile and communication primitives
  -> CANN communication / memory / interconnect support
       -> HCCL / HCOMM / SHMEM / HIXL / recipes
```

## Terms

| Term | Role in this wiki | Current coverage |
| --- | --- | --- |
| CANN | Huawei Ascend software stack umbrella in this target set. | target-set context only |
| HCCL | collective/send/recv and window/data-plane supporting evidence for current distributed examples. | partially inspected via `repositories/hccl` and [Distributed Execution Evidence](../evidence/distributed-execution.md) |
| HCOMM | lower-level communication/transport name from materials. | `open question`; no source pass yet |
| SHMEM | shared-memory support project in target set. | not profiled |
| HIXL | transfer/interconnect support project in target set. | not profiled |
| CANN recipes | inference recipe examples and operational guidance. | not profiled |

## Boundary Rule

HCCL/HCOMM/SHMEM/HIXL evidence can support data movement, collective communication, memory sharing, or interconnect claims. It does not by itself prove PTO Runtime worker lifecycle, PyPTO syntax/API, simpler scheduler behavior, remote callable registry, or remote L3 control plane.

When a future wiki pass makes a durable claim about a CANN-side project, add a repository profile or evidence ledger first rather than letting distributed-runtime pages imply ownership.
