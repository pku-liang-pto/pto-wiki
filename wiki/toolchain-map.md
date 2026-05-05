---
title: "Toolchain Map"
type: overview
status: draft
sources:
  - config/target-set.yml
  - wiki/repositories/simpler.md
  - wiki/repositories/pto-isa.md
  - wiki/repositories/pypto.md
last_updated: 2026-05-05
---

# Toolchain Map

本页给出 target set 的粗粒度 toolchain 视图。它回答“这些项目大概落在哪些区域”，但不把未审计仓库写成确定架构。确定的学习主线仍以 [Overview](./overview.md)、[Repositories](./repositories/) 和 [PTO Examples](./examples/pto/) 为准。

```text
user-facing program
  -> PyPTO language / compiler
  -> PTO-ISA tile and communication primitives
  -> simpler runtime launch and scheduling
  -> CANN / HCCL data-plane substrate
```

这张图只表示当前 wiki 已经能解释的主线。未 profile 的 repositories 可能属于相邻方向，但不能从本页推断实现 ownership。

## Current View

| Area | Current Repositories | Notes |
| --- | --- | --- |
| PTO design and ISA | `pypto_top_level_documents`, `pto-isa` | 当前 wiki 已使用 top-level design evidence 和 `pto-isa` profile；未 profile 的 design docs 仍只作为 supporting context。 |
| PTO implementation and libraries | `pypto`, `pto-li`, `simpler` | `pypto` 与 `simpler` 已 profile；`pto-li` 仍是 coverage gap，不能从本页推断实现关系。 |
| Runtime and serving | `distributed-runtime`, `serving-lib`, `ptoas` | `distributed-runtime`、serving、assembly/tooling roles 仍未完成 source-backed profile。 |
| CANN communication and memory | `hcomm`, `hccl`, `shmem`, `hixl` | 当前只有 HCCL 有 partial supporting evidence；其余项目不承担本 wiki 的 ownership claim。 |
| CANN recipes | `cann-recipes-infer` | 仍未 profile；只能作为未来 recipe/example coverage area。 |

## Reading Rule

把本页当作起始方向，不要当作完整架构证明。一个 repository 只有在完成 source-backed profile 或 topic evidence pass 后，才可以在 wiki 中承担具体 ownership claim。`hccl` 当前只支撑 HCCL/data-plane context；它不能自动证明 `hcomm`、`shmem`、`hixl` 或 remote PTO Runtime control plane。

## PTO Runtime / ISA / PyPTO Pass

2026-05-04 文档化 pass 在已检查 commit 上验证了如下关系：

```text
pypto DSL/codegen
  -> simpler L3 worker/runtime
  -> PTO-ISA tile and comm kernels
  -> HCCL/sim communication backend
```

这条链路的读法是：PyPTO owns expression and lowering，PTO-ISA owns kernel primitive semantics，`simpler` owns host/chip worker lifecycle and scheduling，HCCL supports data-plane communication. 其中 remote worker lifecycle、cross-host callable registration、RoCE/URMA-backed control plane 仍需要 future source evidence。

详细页面：

- [simpler](./repositories/simpler.md)
- [pto-isa](./repositories/pto-isa.md)
- [pypto](./repositories/pypto.md)
- [Distributed Execution](./topics/distributed-execution.md)
