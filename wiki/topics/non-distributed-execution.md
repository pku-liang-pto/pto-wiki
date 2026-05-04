---
title: "Non-Distributed Execution"
type: topic
status: draft
sources:
  - repositories/pypto/README.md
  - repositories/pypto/examples/hello_world.py
  - repositories/pypto/python/pypto/ir/compile.py
  - repositories/pto-isa/README.md
  - repositories/pto-isa/demos/
  - repositories/simpler/docs/chip-level-arch.md
  - repositories/simpler/src/a2a3/docs/runtimes.md
  - wiki/evidence/non-distributed-execution.md
last_updated: 2026-05-04
---

# Non-Distributed Execution

本页说明 PTO/PyPTO/simpler 的非分布式基础路径。它是阅读 distributed execution 的前置层：先理解一个 program 如何从 Python DSL 变成 tile kernel，再理解 runtime 如何在单个 Ascend chip 上启动和调度 task graph。证据 ledger 见 [Non-Distributed Execution Evidence](../evidence/non-distributed-execution.md)。

## One-Program Mental Model

```text
Python program
  -> PyPTO parser builds IR
  -> PassManager lowers tensor program to tile/runtime-facing ops
  -> codegen emits PTO/runtime artifacts
  -> simpler L2 ChipWorker launches host/AICPU/AICore programs
  -> PTO-ISA kernels run tile load/compute/store
  -> host copies result back
```

## Layer Responsibilities

| Layer | Owns | Does not own |
| --- | --- | --- |
| PyPTO | DSL, parser, IR, passes, codegen, `runtime.run()` | low-level device scheduler implementation |
| PTO-ISA | tile types, instruction API, CPU/NPU kernel semantics, operator demos | host worker lifecycle or task graph scheduler |
| simpler L2 | device selection, runtime binary loading, AICPU/AICore launch, task graph execution | Python DSL parsing or high-level model semantics |

## Normal PyPTO Flow

`pypto/examples/hello_world.py` is the smallest example: an `@pl.program` defines an `InCore` tile add kernel and an `Orchestration` function that calls it. `python/pypto/ir/compile.py` then runs passes, dumps IR when configured, calls backend `generate()`, writes artifacts, and returns `CompiledProgram` for the normal path.

Key non-distributed stages:

1. Express tensors and InCore kernels in Python.
2. Parse decorators, type annotations, control flow, and ops into IR.
3. Lower tensor-level operations into tile/PTO-level operations.
4. Generate artifacts for simulator or hardware platform.
5. Execute through `runtime.run()` with `RunConfig`.

## Hello World End-To-End

Use `repositories/pypto/examples/hello_world.py` as the smallest concrete path:

```text
HelloWorldProgram
  -> tile_add(a, b, c)
      -> pl.load(a) / pl.load(b)
      -> pl.add(tile_a, tile_b)
      -> pl.store(tile_c, c)
  -> orchestrator(...)
      -> self.tile_add(...)
  -> HelloWorldProgram.as_python()
```

What this teaches:

| Step | Evidence | Reader check |
| --- | --- | --- |
| DSL shape | `@pl.program`, `@pl.function(type=InCore)`, `pl.Tensor`, `pl.Tile`, `pl.Out` in `hello_world.py` | identify which function is kernel-level and which is orchestration-level |
| IR / pass path | `python/pypto/ir/compile.py`, `python/pypto/ir/pass_manager.py` | confirm ordinary programs return `CompiledProgram`, not `DistributedCompiledProgram` |
| Runtime handoff | `python/pypto/runtime/runner.py` and `RunConfig` | see where platform/device choices enter |
| L2 execution foundation | [simpler](../repositories/simpler.md#l0-l2-ascend-启动路径) | understand where host/AICPU/AICore launch begins |
| Kernel instruction layer | [pto-isa](../repositories/pto-isa.md#tile-programming-基础) | connect `load/add/store` to tile memory and instruction concepts |

This hello path is mostly source/IR-print oriented. It is the prerequisite for reading examples that actually run through simulator, hardware, L3 orchestration, or communication windows.

## Normal PTO-ISA Flow

PTO-ISA starts below PyPTO: it gives kernel authors and compiler backends a tile-oriented instruction layer. The basic examples are `demos/baseline/add`, `demos/baseline/gemm_basic`, CPU demos, and manual kernels. They show:

- operator packaging as `torch_npu` custom operators
- tensor/tile shape and stride setup
- GM to tile memory movement
- matmul/add/softmax-style compute
- pipeline and double-buffering style optimization in GEMM/Flash Attention examples

## Normal simpler L2 Flow

`simpler/docs/chip-level-arch.md` describes the launch path:

```text
RuntimeBuilder / KernelCompiler
  -> host.so / aicpu.so / aicore.o
  -> ChipWorker.init()
  -> set_device()
  -> run_runtime()
      -> upload kernels
      -> allocate/copy tensors
      -> build task graph
      -> launch AICPU scheduler
      -> launch AICore/AIV workers
      -> sync/copy-back/cleanup
```

`host_build_graph` is easier for development/debugging. `tensormap_and_ringbuffer` is the production-oriented path where AICPU/device-side logic uses TensorMap and ring buffers for dependency discovery, task slots, output heap, and flow control.

## What This Foundation Enables

Distributed execution adds L3 host orchestration, SubWorkers, multi-chip windows, and eventually remote workers. Those features depend on the non-distributed foundations above: PyPTO must express work, PTO-ISA must run kernel code, and simpler L2 must launch chip work reliably.

## Open Questions

- Which non-distributed PyPTO model example should become the canonical “complete NN” baseline for future distributed comparison?
- Should `tensormap_and_ringbuffer` become the only documented runtime variant once `host_build_graph` is only a debug path?
