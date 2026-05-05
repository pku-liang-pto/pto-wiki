---
title: "pypto"
type: repo-profile
status: draft
sources:
  - repositories/pypto/
  - repositories/pypto/README.md
  - repositories/pypto/examples/hello_world.py
  - repositories/pypto/python/pypto/ir/compile.py
  - repositories/simpler/
  - wiki/materials/pto-runtime-distributed/
last_updated: 2026-05-04
---

# pypto

`pypto` 是 PTO 的 Python DSL、IR、pass、codegen 和 runtime-facing 入口。先把它理解成非分布式 operator/programming framework：用户用 Python 写 `@pl.program` / `@pl.function`，parser 生成 IR，pass pipeline 把 tensor-level program 降到 tile/PTO-level code，runtime runner 编译并执行。Distributed codegen 是建立在这条普通编译执行链路之上的扩展。

本页基于 `repositories/pypto` commit `f21c2dd48cfe1e5c4add78b0e391a31196420862`。

## Repo 直觉

README 把 PyPTO 定位为面向 AI accelerator 的 high-performance programming framework，核心是 PTO programming paradigm 和 Tile-based programming model。它的基础特性包括 tensor graph 到 tile graph/block graph/execution graph 的多层转换、codegen、MPMD execution scheduling、toolchain/profiling 和 Python-friendly API。

所以阅读顺序应是：

```text
Python DSL (@pl.program / @pl.function)
  -> parser builds PyPTO IR
  -> PassManager runs tensor/tile lowering passes
  -> backend codegen emits PTO/runtime artifacts
  -> CompiledProgram / runtime.run executes on a2a3sim/a2a3/a5sim/a5
  -> distributed runner only when program contains L3+ hierarchy functions
```

`pypto/.gitmodules` 中 `runtime` submodule 指向 `https://github.com/hw-native-sys/simpler`；这是 runtime integration 的基础，但普通 PyPTO 页面不应从 distributed runner 开始。

## 非分布式编程模型

`examples/hello_world.py` 展示最小 PyPTO program：`@pl.program` class 中有 `InCore` function，使用 `pl.load` 把 global tensor load 成 tile，`pl.add` 做 tile compute，`pl.store` 写回 output；另一个 `Orchestration` function 调用 `InCore` kernel。README 的 examples 也按复杂度组织为 hello world、kernel examples、model examples。

把一个 PyPTO program 想成两层函数。内层函数接近 hardware kernel：它关注 tile shape、load/store、elementwise 或 matmul compute。外层函数接近 model/operator graph：它决定调用哪些 kernel、tensor 作为输入输出如何传递、是否有 loop 或 control flow。parser 把这两层 Python code 转成 IR；pass pipeline 再把 tensor-level 描述逐步降成 tile-level 和 runtime-facing 描述。

```text
@pl.program class
  -> InCore function
       tensor/tile load, compute, store
  -> Orchestration function
       calls InCore kernels and connects tensors
  -> compile()
       parser -> IR -> passes -> backend generate
  -> runtime.run()
       execute normal compiled program
```

`python/pypto/language/parser/README.md` 说明 parser 用 decorator-based parser 将 Python DSL 转成 IR，并处理 type annotations、control flow、SSA verification 和 span tracking。`python/pypto/ir/pass_manager.py` 中 `OptimizationStrategy.Default` 注册了从 `UnrollLoops`、`ConvertToSSA`、`OutlineIncoreScopes` 到 `ConvertTensorToTileOps`、`InferTileMemorySpace`、`LowerPipelineLoops`、`AllocateMemoryAddr`、`DeriveCallDirections` 等 passes。

`python/pypto/ir/compile.py` 的 `compile()` 负责运行 PassManager、dump IR、调用 backend `generate()`、写 artifacts，并返回 `CompiledProgram`。只有当 transformed program 中存在 Lingqu level >= 3 的 function 时，它才返回 `DistributedCompiledProgram`。

## 核心模块

| 模块 | 作用 | 状态 |
| --- | --- | --- |
| `python/pypto/language/` | Python DSL、decorators、typing、ops、parser | `implemented` |
| `include/pypto/ir/` / `python/pypto/ir/` | IR node、builder、compile API、pass manager、printer | `implemented` |
| `src/ir/op/` | tensor/tile/sync op registries and implementations | `implemented` |
| `src/codegen/pto/` | PTO codegen for non-distributed kernels | `implemented` |
| `src/codegen/orchestration/` | orchestration codegen for runtime-facing host/device orchestration | `implemented` |
| `python/pypto/runtime/runner.py` | compile-and-run workflow with `RunConfig` | `implemented` |
| `examples/` | hello world、kernel examples、model examples | `implemented` |
| `include/pypto/ir/function.h` | `Level`、`Role`、`LevelToLinquLevel()` | `implemented` |
| `src/codegen/distributed/distributed_codegen.cpp` | 生成最高层 orchestrator Python 入口；lower hierarchy calls | `implemented` |
| `python/pypto/runtime/distributed_runner.py` | L3 distributed program execution via `simpler.Worker(level=3)` | `implemented` |
| `tests/st/distributed/test_l3_distributed.py` | HOST orchestrator -> CHIP worker -> SubWorker 端到端测试 | `implemented` |
| `tests/st/distributed/test_l3_parallel_reduce.py` | 多 chip callable + SubWorker reduce 设计测试 | `emerging`，当前 skip |
| `tests/ut/codegen/test_distributed_codegen.py` | distributed codegen unit tests | `implemented` |

## 普通 Runtime Path

`python/pypto/runtime/runner.py` 暴露 `run(program, *tensors, config=RunConfig(...))`，默认 platform 是 `a2a3sim`，也支持 `a2a3`、`a5sim`、`a5`。`RunConfig` 控制 platform、device id、tolerance、optimization strategy、是否 dump passes、是否 codegen-only、runtime/compile profiling 等。

这条路径面向普通 operator 编译执行。Distributed runner 只有在 L3+ hierarchy program 被识别时才进入。

普通 path 的判断标准很简单：如果 program 只描述普通 kernel/orchestration，`compile()` 返回 `CompiledProgram`，runner 按 `RunConfig` 选择 simulator 或 hardware backend；如果 transformed program 中出现 Lingqu level >= 3 的 hierarchy function，才会走 `DistributedCompiledProgram` 和 distributed runner。这个分叉很重要，因为它防止把所有 PyPTO 行为都误读成 distributed runtime 行为。

## 非分布式示例和测试表面

README 将 examples 明确分成 hello world、kernel examples 和 model examples，并给出 `python examples/hello_world.py`、`python examples/kernels/06_softmax.py`、`python examples/models/01_ffn.py` 这类入口。unit tests 的 README 命令是 `python -m pytest tests/ut -n auto --maxprocesses 8 -v`。

| 文件 | 重点 | 运行/验证表面 |
| --- | --- | --- |
| `examples/hello_world.py` | 最小 `@pl.program`，`InCore` + `Orchestration`，`pl.load/add/store` | `python examples/hello_world.py` prints `HelloWorldProgram.as_python()` |
| `examples/kernels/01_elementwise.py` | add/mul 等基础 tile ops | script-level print/IR example |
| `examples/kernels/03_matmul.py` | matmul / matmulacc API | script-level print/IR example |
| `examples/kernels/06_softmax.py` | row max、exp、row sum 等 attention 前置基础 | README representative kernel command |
| `examples/kernels/07_normalization.py` | RMSNorm / LayerNorm | script-level print/IR example |
| `examples/models/01_ffn.py` | transformer FFN building block | README representative model command |
| `examples/models/03_flash_attention.py` | online softmax、loop-carried state、QK/PV attention | `python examples/models/03_flash_attention.py` from docstring |
| `examples/models/04_paged_attention.py` | KV cache / block table / golden validation | hardware/runtime path via `RunConfig(platform="a2a3", ...)` |
| `examples/models/08_llama_mini.py` | compact LLaMA-style decoder baseline | program builder; no inspected `__main__` command |
| `tests/ut/` | parser、IR、pass、codegen、type/error behavior | README unit-test command |

这些例子构成 distributed 页面必须依赖的 foundation layer：如果不能解释普通 `@pl.program`、tile lowering、model examples 和 runtime runner，就不应直接从 L3 distributed runner 开始讲 PyPTO。

## Try First

| Goal | Command / action | Expected signal | Common blocker |
| --- | --- | --- | --- |
| smallest DSL print | `python examples/hello_world.py` | generated program text prints | package not installed in current environment |
| kernel family scan | `python examples/kernels/06_softmax.py` | generated softmax program text prints | missing dev install |
| model control-flow scan | `python examples/models/03_flash_attention.py` | function representation prints | advanced DSL concepts not yet read |
| unit-test confidence | `python -m pytest tests/ut -n auto --maxprocesses 8 -v` | unit tests pass | dev dependencies missing |
| complete NN reading | inspect `examples/models/08_llama_mini.py` | can identify RMSNorm, QKV, RoPE, MLP, LM head | no CLI entrypoint in inspected file |

## Distributed Extension: Level / Role

`function.h` 中的 `Level` 包含 `AIV`、`AIC`、`CORE_GROUP`、`CHIP_DIE`、`CHIP`、`HOST`、`CLUSTER_0`、`CLUSTER_1`、`CLUSTER_2`、`GLOBAL`，并通过 `LevelToLinquLevel()` 映射到 Lingqu 层级。`Role` 目前区分 `Orchestrator` 和 `SubWorker`。

当前代码能表达比 L3 更高的枚举，但 runtime runner 的稳定执行路径主要是 L3。L4-L6 应标为 `design-intended`，除非后续源码提供可运行测试。

## Distributed Codegen

`distributed_codegen.cpp` 的关键规则是：最高层 orchestrator 作为 Python entry function 发出；同层 `SubWorker` call lowering 为 `submit_sub`；下一层 `Orchestrator` call lowering 为 `submit_next_level`。unit tests 明确断言生成代码包含 `TaskArgs`、`TensorArgType`、`make_tensor_arg`、`submit_next_level` 和 `submit_sub`。

这说明 PyPTO 已经有 hierarchy-aware lowering，但该 lowering 依赖 runtime 提供 worker registration、callable id 和 execution semantics。

## Distributed Runner

`distributed_runner.py` 的注释和实现将 L3 distributed execution 绑定到 `simpler Worker(level=3)`。大致路径是：

```text
DistributedCompiledProgram
  -> generated host orchestration module
  -> collect subworker callables
  -> Worker(level=3, device_ids, num_sub_workers)
  -> register SubWorker
  -> init/run/close
```

因此 `pypto` 的当前 `implemented` 能力是 single-host L3 execution path；remote L3/DistWorker 仍需 runtime 层提供。

## 示例和测试

| 文件 | 展示能力 | 状态 |
| --- | --- | --- |
| `tests/st/distributed/test_l3_distributed.py` | HOST Orchestrator 调 CHIP worker 和 HOST SubWorker，验证 TensorMap dependency、fork 后数据可见性、DAG ordering | `implemented` |
| `tests/st/distributed/test_l3_parallel_reduce.py` | 两个 independent chip tasks + SubWorker reduce，期望输出 `2a` | `emerging`，测试 skip because runtime support pending |
| `tests/ut/codegen/test_distributed_codegen.py` | hierarchy call lowering、SubWorker inline body、tensor arg tags | `implemented` |

## 与 Lingqu 设计的关系

PyPTO 的 `LevelToLinquLevel()` 与 top-level design 中的 L0-L6 方向一致，但当前实现和测试的重心是 HOST/CHIP/CORE_GROUP 附近。Lingqu L4-L6 在本轮证据中仍应写为 `design-intended` 或 `open question`。

## Evidence-Based Interpretation

本页的判断是：PyPTO 的主线是普通 DSL -> IR -> pass -> codegen -> runtime path；distributed codegen/runner 是在这条主线上识别 L3+ hierarchy 后进入的扩展路径。证据来自 README examples、`hello_world.py`、parser/pass/compile source、`function.h` level enum、distributed codegen tests 和 `distributed_runner.py`。因此“PyPTO 已支持 single-host L3 hierarchy execution”可以写为 `implemented`；“remote L3、多 host、完整 distributed NN”仍应写为 `design-intended` 或 `TODO`。

## 未决问题

- PyPTO 打开的 L3 Distributed Programming Interface RFC 会如何稳定 `pl.at`、functional style 和 inline style？
- orchestration-level collectives issue 中的 `pl.all_reduce` 等 API 会落在 PyPTO codegen、simpler runtime，还是 PTO-ISA communication primitive 的组合？
- `test_l3_parallel_reduce.py` 的 skip 消除后，需要同步更新本页和 [PTO Examples](../examples/pto/)。
