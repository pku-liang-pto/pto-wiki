---
title: "CANN Foundation"
type: concept
status: draft
sources:
  - config/target-set.yml
  - repositories/hccl/
  - wiki/evidence/distributed-execution.md
last_updated: 2026-05-05
---

# CANN Foundation

本页解释 CANN-side repositories 在本 wiki 中的定位。当前 PTO pass 深入覆盖的是 `simpler`、`pto-isa` 和 `pypto`；CANN-side 项目主要作为 communication / memory / interconnect / recipe supporting layer 出现，除 `hccl` 有少量 source inspection 外，其余项目还不能当作已完整审计。

## How To Read This Page

先把 CANN 当作 Ascend execution substrate，而不是 PTO 的控制层。PTO pages 里提到 CANN/HCCL 时，通常是在解释 compiler/runtime environment、device runtime、communication window 或 collective data-plane；除非未来有 dedicated source pass，否则不要从这些词推断 HCOMM、SHMEM、HIXL 或 recipes 的具体 ownership。

## Current Mental Model

```text
PTO / PyPTO / simpler control and programming layers
  -> PTO-ISA kernel tile and communication primitives
  -> CANN communication / memory / interconnect support
       -> HCCL / HCOMM / SHMEM / HIXL / recipes
```

In this wiki, CANN is the Ascend software-stack context below PTO. PTO layers decide what the program means and how PTO runtime schedules it; CANN-side components provide the device runtime, compiler/toolchain environment, logging/runtime APIs, and communication/memory/interconnect capabilities that make those programs executable on Ascend systems.

The most visible CANN dependency in the current PTO pass is not “remote runtime control.” It is the practical execution substrate:

- `ccec` and CANN toolchain pieces compile AICore/AICPU/runtime artifacts in `simpler` and PTO-ISA hardware paths.
- `torch_npu` appears in PTO-ISA custom operator demos as the PyTorch dispatch/integration surface.
- HCCL supports collective/send/recv/window-style data-plane behavior used by communication examples and `simpler` comm context paths.
- CANN device runtime and logging affect `ChipWorker` initialization, device selection, streams, memory allocation, and AICPU logs.

This is enough to understand why CANN matters, but not enough to assign ownership for every configured CANN repo. Except for partial HCCL evidence, CANN-side projects still need dedicated repository profiles before they become authoritative wiki sources.

## Terms

| Term | Role in this wiki | Current coverage |
| --- | --- | --- |
| CANN | Huawei Ascend software stack umbrella in this target set. | target-set context only |
| HCCL | collective/send/recv and window/data-plane supporting evidence for current distributed examples. | partially inspected via `repositories/hccl` and [Distributed Execution Evidence](../evidence/distributed-execution.md) |
| HCOMM | lower-level communication/transport name from materials. | `open question`; no source pass yet |
| SHMEM | shared-memory support project in target set. | not profiled |
| HIXL | transfer/interconnect support project in target set. | not profiled |
| CANN recipes | inference recipe examples and operational guidance. | not profiled |

## Ascend Execution Stack In PTO Pages

When a PTO page mentions CANN, read it through this stack:

```text
PyPTO / PTO program
  -> PTO-ISA kernel or simpler runtime artifact
  -> CANN compiler/runtime environment
  -> Ascend device execution
  -> HCCL/HCOMM/SHMEM/HIXL-style communication or memory support where inspected
```

Concrete examples:

| PTO-side behavior | CANN-side dependency | What the dependency proves |
| --- | --- | --- |
| PTO-ISA add/GEMM custom op demos | CANN, `torch_npu`, `ASCEND_HOME_PATH`, target SoC, PTO Tile Lib path | a PTO kernel can be packaged and called through NPU/PyTorch operator tooling |
| `simpler` L2 hardware launch | CANN device runtime, CCEC/AICPU toolchains, device logs | host can initialize device, load runtime binaries, launch AICPU/AICore programs, and copy data |
| `simpler` L3 allreduce/window examples | HCCL-backed comm context and rank/window metadata | local/multi-chip data-plane communication exists |
| remote L3 material blueprint | mentions RoCE/URMA/HCOMM-like transport ideas | target design only until source-backed remote lifecycle appears |

## Boundary Rule

HCCL/HCOMM/SHMEM/HIXL evidence can support data movement, collective communication, memory sharing, or interconnect claims. It does not by itself prove PTO Runtime worker lifecycle, PyPTO syntax/API, simpler scheduler behavior, remote callable registry, or remote L3 control plane.

When a future wiki pass makes a durable claim about a CANN-side project, add a repository profile or evidence ledger first rather than letting distributed-runtime pages imply ownership.
