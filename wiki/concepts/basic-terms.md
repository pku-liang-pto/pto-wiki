---
title: "Basic Terms"
type: concept
status: draft
sources:
  - repositories/pypto/README.md
  - repositories/pypto/examples/hello_world.py
  - repositories/pto-isa/README.md
  - repositories/pto-isa/include/pto/README.md
  - repositories/simpler/docs/chip-level-arch.md
  - repositories/simpler/src/a2a3/docs/runtimes.md
last_updated: 2026-05-04
---

# Basic Terms

本页记录非分布式阅读路径中反复出现的基础术语。分布式术语另见 [Distributed Execution Terms](./distributed-execution-terms.md)。

## Programming Model

| Term | Meaning | First place to read |
| --- | --- | --- |
| PyPTO | Python DSL、IR、pass、codegen 和 runtime-facing API。先按普通 operator framework 理解，再看 L3+ extension。 | `repositories/pypto/README.md` |
| PTO-ISA | tile-oriented virtual ISA / C++ tile library。它表达 kernel 内的 tile load/store/compute/comm，不负责 host-side worker lifecycle。 | `repositories/pto-isa/README.md` |
| `@pl.program` | PyPTO program container；把 InCore kernel 和 Orchestration function 放在一个可编译单元内。 | `repositories/pypto/examples/hello_world.py` |
| `InCore` | 运行在 kernel/tile 层的 compute function，通常执行 `pl.load`、tile op、`pl.store`。 | `repositories/pypto/examples/hello_world.py` |
| `Orchestration` | PyPTO 中组织 InCore calls、tensor creation、control/data flow 的 function。 | `repositories/pypto/examples/hello_world.py` |
| `CompiledProgram` | 普通 compile path 的产物；只有 Lingqu level >= 3 时才进入 distributed compiled program path。 | `repositories/pypto/python/pypto/ir/compile.py` |

## Tensor And Tile

| Term | Meaning | First place to read |
| --- | --- | --- |
| Tensor | 用户侧或 orchestration 侧的数据对象，通常对应 global memory buffer。 | `repositories/pypto/examples/hello_world.py` |
| Tile | PTO-ISA 的基本计算单位；kernel 把 tensor 片段搬进 tile memory 后执行 tile op。 | `repositories/pto-isa/include/pto/README.md` |
| GM | Global Memory，host/device tensor buffer 的主要存放位置。 | `repositories/pto-isa/include/pto/common/pto_tile.hpp` |
| L1 / L0 | Ascend kernel 内更近计算单元的 memory levels；GEMM 等例子会把数据搬到 Mat/Left/Right/Vec memory。 | `repositories/pto-isa/demos/baseline/gemm_basic/README.md` |
| Pipeline | kernel 内通过 staged load/compute/store 或 double buffering 提高吞吐的组织方式。 | `repositories/pto-isa/demos/baseline/gemm_basic/README.md` |

## Runtime Basics

| Term | Meaning | First place to read |
| --- | --- | --- |
| simpler | PTO runtime implementation repo；先理解 L2 chip launch path，再理解 L3 host orchestration。 | `repositories/simpler/docs/chip-level-arch.md` |
| `ChipWorker` | L2 worker，负责 set device、load runtime symbols、launch AICPU scheduler/AICore kernels、copy results back。 | `repositories/simpler/docs/chip-level-arch.md` |
| AICPU scheduler | device-side scheduler program，负责 dependency wiring、ready detection、dispatch 和 completion tracking。 | `repositories/simpler/docs/chip-level-arch.md` |
| AICore / AIV | compute worker kernel execution resources；执行 PTO-ISA kernel。 | `repositories/simpler/docs/chip-level-arch.md` |
| `TaskArgs` | runtime submit 的 tensor/scalar argument carrier。它携带 tensor tags，供 Orchestrator/TensorMap 建依赖。 | `repositories/simpler/python/simpler/task_interface.py` |
| TensorMap | runtime dependency map，记录 tensor producer 并为 later consumer 自动连边。 | `repositories/simpler/docs/orchestrator.md` |
| Ring buffer | `tensormap_and_ringbuffer` runtime 中的 task/output/dependency storage mechanism。 | `repositories/simpler/src/a2a3/docs/runtimes.md` |

## Reading Rule

如果一个术语同时出现在 PyPTO、PTO-ISA 和 simpler 中，先问它属于哪一层：

```text
Python DSL / IR term
  -> PyPTO

kernel tile instruction term
  -> PTO-ISA

worker / scheduler / launch / dependency term
  -> simpler runtime
```
