---
title: "pypto"
type: repo-profile
status: draft
sources:
  - repositories/pypto/
  - repositories/simpler/
  - materials/pto-runtime-distributed/
last_updated: 2026-05-04
---

# pypto

`pypto` 是 PTO 的 Python DSL、IR、pass、codegen 和 runtime-facing 入口。它让用户用 Python 描述 tile kernel、orchestration function、hierarchy level 和 role，然后编译为可执行 artifact 或由 runtime runner 调用 `simpler`。

本页基于 `repositories/pypto` commit `f21c2dd48cfe1e5c4add78b0e391a31196420862`。

## Repo 直觉

`pypto` 当前的分布式能力重点在“语言和 codegen 能表达 HOST/CHIP/SubWorker 层级，并把 L3 program 交给 simpler Worker 执行”。它还不是 remote distributed runtime 本身。

`pypto/.gitmodules` 中 `runtime` submodule 指向 `https://github.com/hw-native-sys/simpler`，这与 `distributed_runner.py` 中使用 `simpler.Worker(level=3)` 的实现一致。

## 核心模块

| 模块 | 作用 | 状态 |
| --- | --- | --- |
| `include/pypto/ir/function.h` | `Level`、`Role`、`LevelToLinquLevel()` | `implemented` |
| `src/codegen/distributed/distributed_codegen.cpp` | 生成最高层 orchestrator Python 入口；lower hierarchy calls | `implemented` |
| `python/pypto/runtime/distributed_runner.py` | L3 distributed program execution via `simpler.Worker(level=3)` | `implemented` |
| `tests/st/distributed/test_l3_distributed.py` | HOST orchestrator -> CHIP worker -> SubWorker 端到端测试 | `implemented` |
| `tests/st/distributed/test_l3_parallel_reduce.py` | 多 chip callable + SubWorker reduce 设计测试 | `emerging`，当前 skip |
| `tests/ut/codegen/test_distributed_codegen.py` | distributed codegen unit tests | `implemented` |

## Level / Role

`function.h` 中的 `Level` 包含 `AIV`、`AIC`、`CORE_GROUP`、`CHIP_DIE`、`CHIP`、`HOST`、`CLUSTER_0`、`CLUSTER_1`、`CLUSTER_2`、`GLOBAL`，并通过 `LevelToLinquLevel()` 映射到 Linqu 层级。`Role` 目前区分 `Orchestrator` 和 `SubWorker`。

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

## 与 Linqu 设计的关系

PyPTO 的 `LevelToLinquLevel()` 与 top-level design 中的 L0-L6 方向一致，但当前实现和测试的重心是 HOST/CHIP/CORE_GROUP 附近。Linqu L4-L6 在本轮证据中仍应写为 `design-intended` 或 `open question`。

## 未决问题

- PyPTO 打开的 L3 Distributed Programming Interface RFC 会如何稳定 `pl.at`、functional style 和 inline style？
- orchestration-level collectives issue 中的 `pl.all_reduce` 等 API 会落在 PyPTO codegen、simpler runtime，还是 PTO-ISA communication primitive 的组合？
- `test_l3_parallel_reduce.py` 的 skip 消除后，需要同步更新本页和 [Examples Feature Map](../topics/examples-feature-map.md)。
