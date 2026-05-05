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
last_updated: 2026-05-05
---

# Basic Terms

本页记录 PTO Runtime / PTO-ISA / PyPTO wiki 中反复出现的基础术语。它先用 prose 解释概念，再用表格做速查；source paths 是审计线索，不是主要学习入口。分布式术语另见 [Distributed Execution Terms](./distributed-execution-terms.md)。

## How To Read This Page

第一次阅读时不要从表格开始。先读 `PTO In One Page`，建立三层模型；再读 `Programming Model`，理解 PyPTO 的 `InCore` / `Orchestration` 分工；接着读 `Tensor And Tile`，把 tensor、tile、GM/L1/L0 和 load/compute/store 连起来；最后读 `Runtime Basics`，理解 `simpler` 为什么需要 `ChipWorker`、AICPU scheduler、TensorMap 和 ring buffer。

## PTO In One Page

PTO 在本 wiki 中同时指一组项目和一条执行链。PyPTO 是用户最先接触的语言和 compiler-facing 层；PTO-ISA 是 kernel/tile 层；`simpler` 是 runtime 层；CANN/HCCL 是 Ascend device、通信和内存能力的 supporting substrate。

```text
program idea
  -> PyPTO: Python DSL, IR, passes, codegen
  -> PTO-ISA: tile load/store/compute/comm primitives
  -> simpler: Worker, ChipWorker, scheduler, TensorMap, runtime launch
  -> CANN/HCCL: device runtime and communication support where inspected
```

这条链路的第一层不是 distributed runtime，而是普通的单 program 执行：一个 tensor operation 被表达成 PyPTO program，被降低成 tile/kernel work，再由 `simpler` L2 启动到 host runtime、AICPU scheduler 和 AICore/AIV kernels。Distributed execution 只是把这个基础向 L3+ hierarchy、rank/window communication 和 future remote control plane 扩展。

## Programming Model

PyPTO 负责“用户如何表达计算”。一个 `@pl.program` 通常包含 `InCore` kernel 和 `Orchestration` function。`InCore` 是 tile/kernel 计算函数，常见操作是从 tensor load tile、做 tile operation、再 store 回 output。`Orchestration` 负责创建 tensor、调用 kernel、组织 control/data flow。普通 compile path 产生 `CompiledProgram`；只有 hierarchy level >= 3 的路径才进入 distributed compiled program 的语义。

PTO-ISA 负责“kernel 内如何贴近硬件表达”。它关心 tile、memory space、load/store/compute/communication primitive，不拥有 host worker lifecycle。`simpler` 负责“这些 kernel 如何被启动和调度”。它管理 `ChipWorker`、runtime binary loading、AICPU scheduler、TensorMap、ring buffer、L3 child workers 和 SubWorker。

| Term | Meaning | Wiki page to read next | Source anchor |
| --- | --- | --- |
| PyPTO | Python DSL、IR、pass、codegen 和 runtime-facing API。 | [pypto](../repositories/pypto.md) | `repositories/pypto/README.md` |
| PTO-ISA | tile-oriented virtual ISA / C++ tile library；表达 kernel 内的 tile load/store/compute/comm。 | [pto-isa](../repositories/pto-isa.md) | `repositories/pto-isa/README.md` |
| `@pl.program` | PyPTO program container；把 InCore kernel 和 Orchestration function 放在一个可编译单元内。 | [PTO Examples](../examples/pto/) | `repositories/pypto/examples/hello_world.py` |
| `InCore` | kernel/tile 层 compute function；通常执行 `pl.load`、tile op、`pl.store`。 | [Non-Distributed Execution](../topics/non-distributed-execution.md) | `repositories/pypto/examples/hello_world.py` |
| `Orchestration` | PyPTO 中组织 InCore calls、tensor creation、control/data flow 的 function。 | [Non-Distributed Execution](../topics/non-distributed-execution.md) | `repositories/pypto/examples/hello_world.py` |
| `CompiledProgram` | 普通 compile path 的产物；Lingqu level >= 3 才进入 distributed compiled program path。 | [Lingqu Level Map](../topics/lingqu-level-map.md) | `repositories/pypto/python/pypto/ir/compile.py` |

## Tensor And Tile

Tensor 是 program 看到的数据对象，通常对应 global memory buffer。Tile 是 kernel 看到的工作块：kernel 把 tensor 的一个片段搬入更近的 memory space，在 tile 上做计算，再写回。GM/L1/L0 不是抽象层级名，而是影响 kernel movement 和 performance 的 memory locality。GEMM、attention、FFN 这些看起来是模型层算法，真正落到 kernel 时都要回答“哪些数据在 GM，哪些 tile 进入 Mat/Vec/Left/Right memory，何时 load、compute、store。”

一个最小 add 例子可以这样理解：

```text
Tensor A, Tensor B in GM
  -> load tiles into on-chip tile memory
  -> add tile A + tile B
  -> store output tile to Tensor C in GM
```

GEMM 只是这件事的高压版本：矩阵被拆成 tile，K 维可能继续分块，pipeline/double buffering 尝试重叠 data movement 和 compute。

| Term | Meaning | Wiki page to read next | Source anchor |
| --- | --- | --- |
| Tensor | 用户侧或 orchestration 侧的数据对象，通常对应 global memory buffer。 | [Non-Distributed Execution](../topics/non-distributed-execution.md) | `repositories/pypto/examples/hello_world.py` |
| Tile | PTO-ISA 的基本计算单位；kernel 把 tensor 片段搬进 tile memory 后执行 tile op。 | [pto-isa](../repositories/pto-isa.md) | `repositories/pto-isa/include/pto/README.md` |
| GM | Global Memory，host/device tensor buffer 的主要存放位置。 | [PTO Examples](../examples/pto/) | `repositories/pto-isa/include/pto/common/pto_tile.hpp` |
| L1 / L0 | Ascend kernel 内更近计算单元的 memory levels；GEMM 等例子会把数据搬到 Mat/Left/Right/Vec memory。 | [PTO Examples](../examples/pto/) | `repositories/pto-isa/demos/baseline/gemm_basic/README.md` |
| Pipeline | kernel 内通过 staged load/compute/store 或 double buffering 提高吞吐的组织方式。 | [PTO Examples](../examples/pto/) | `repositories/pto-isa/demos/baseline/gemm_basic/README.md` |

## Runtime Basics

`simpler` runtime 把 kernel 和 task graph 变成实际 device work。最小层级是 L2 `ChipWorker`：host runtime 加载 runtime binaries，AICPU scheduler 在 device 侧调度 task，AICore/AIV 执行 compute kernel。L3 不是自动等于 remote distributed；当前已实现的基础是单 host 上的 hierarchy runtime：host Orchestrator 构图，Scheduler 派发，WorkerManager 管理 chip child process 和 Python SubWorker。

`TaskArgs` 是 runtime submit 的 argument carrier。它不仅装 tensor/scalar，还用 tensor tags 表示 input/output/inout。Orchestrator 在 submit 时消费这些 tags，TensorMap 用 tensor address 找到 producer/consumer 关系，ring buffer 和 scope 负责让 task/output/dependency storage 可复用。

| Term | Meaning | Wiki page to read next | Source anchor |
| --- | --- | --- |
| simpler | PTO runtime implementation repo；先理解 L2 chip launch path，再理解 L3 host orchestration。 | [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md) | `repositories/simpler/docs/chip-level-arch.md` |
| `ChipWorker` | L2 worker，负责 set device、load runtime symbols、launch AICPU scheduler/AICore kernels、copy results back。 | [simpler](../repositories/simpler.md) | `repositories/simpler/docs/chip-level-arch.md` |
| AICPU scheduler | device-side scheduler program，负责 dependency wiring、ready detection、dispatch 和 completion tracking。 | [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md) | `repositories/simpler/docs/chip-level-arch.md` |
| AICore / AIV | compute worker kernel execution resources；执行 PTO-ISA kernel。 | [Non-Distributed Execution](../topics/non-distributed-execution.md) | `repositories/simpler/docs/chip-level-arch.md` |
| `TaskArgs` | runtime submit 的 tensor/scalar argument carrier；tags 供 Orchestrator/TensorMap 建依赖。 | [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md) | `repositories/simpler/docs/task-flow.md` |
| TensorMap | runtime dependency map，记录 tensor producer 并为 later consumer 自动连边。 | [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md) | `repositories/simpler/docs/orchestrator.md` |
| Ring buffer | `tensormap_and_ringbuffer` runtime 中的 task/output/dependency storage mechanism。 | [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md) | `repositories/simpler/src/a2a3/docs/runtimes.md` |

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
