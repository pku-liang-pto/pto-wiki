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

## Current View

| Area | Current Repositories | Notes |
| --- | --- | --- |
| PTO design and ISA | `pypto_top_level_documents`, `pto-isa` | Design and instruction-set knowledge should be documented with direct source references. |
| PTO implementation and libraries | `pypto`, `pto-li`, `simpler` | Implementation relationships require repository documentation passes before this wiki states firm architecture. |
| Runtime and serving | `distributed-runtime`, `serving-lib`, `ptoas` | Runtime and serving roles should be expanded from source, examples, and design docs. |
| CANN communication and memory | `hcomm`, `hccl`, `shmem`, `hixl` | Dependency and interface relationships should be verified from upstream repos. |
| CANN recipes | `cann-recipes-infer` | Recipe pages should link concrete examples to the libraries and runtime behavior they exercise. |

## Reading Rule

把本页当作起始方向，不要当作完整架构证明。一个 repository 只有在完成 source-backed profile 或 topic evidence pass 后，才可以在 wiki 中承担具体 ownership claim。

## PTO Runtime / ISA / PyPTO Pass

2026-05-04 文档化 pass 在已检查 commit 上验证了如下关系：

```text
pypto DSL/codegen
  -> simpler L3 worker/runtime
  -> PTO-ISA tile and comm kernels
  -> HCCL/sim communication backend
```

详细页面：

- [simpler](./repositories/simpler.md)
- [pto-isa](./repositories/pto-isa.md)
- [pypto](./repositories/pypto.md)
- [Distributed Execution](./topics/distributed-execution.md)
