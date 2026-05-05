---
title: "Developer Takeover Guide"
type: topic
status: draft
sources:
  - wiki/materials/pto-runtime-distributed/
  - repositories/simpler/
  - repositories/pto-isa/
  - repositories/pypto/
  - wiki/evidence/developer-takeover-guide.md
last_updated: 2026-05-05
---

# Developer Takeover Guide

本页面面向准备接手 PTO Runtime / PTO-ISA / PyPTO 工作的开发者和维护者。它不是“第几天读什么”的计划，而是把接手所需的系统内容讲清楚：系统由哪些层组成、每层负责什么、哪些能力已经实现、哪些能力只是设计目标，以及维护者在修改代码前必须保护哪些边界。证据 ledger 见 [Developer Takeover Guide Evidence](../evidence/developer-takeover-guide.md)。

## How To Read This Page

如果你要真正接手代码，先读 `Maintainer Knowledge Model` 和 `Ownership Boundaries`，确认 bug 或 feature 属于 PyPTO、PTO-ISA、`simpler` 还是 CANN-side support。然后用 `First Maintainer Tasks` 找一个低风险练习面，最后读 `Current High-Risk Areas`，避免把 open issue、material blueprint 或 skipped test 写成已经实现。

## Maintainer Knowledge Model

接手这个系统时，最重要的不是先挑一个 repo，而是先建立层次模型。PyPTO 决定用户能表达什么 program；PTO-ISA 决定 kernel 内能表达什么 tile operation；simpler 决定 program 如何在 host、AICPU、AICore/AIV 和多 chip worker 上被启动和调度。Distributed execution 不是一条独立主线，而是在这些基础层之上增加 hierarchy、rank/window communication、SubWorker 和未来 remote control plane。

```text
user program / model idea
  -> PyPTO language and compiler
       owns DSL, IR, passes, codegen, runtime-facing program object
  -> PTO-ISA kernel layer
       owns tile types, load/store/compute instructions, kernel comm primitives
  -> simpler runtime
       owns worker lifecycle, L2 launch, DAG scheduling, TensorMap, ring buffers
  -> CANN/HCCL support layer
       owns communication/data-plane substrate where inspected
```

上面的 ownership model 是接手时的基本判断规则：compiler symptom 不能直接在 runtime 层修，除非先证明 PyPTO 生成的 artifact 是正确的；kernel primitive 不能推出 runtime scheduling；local HCCL window 或 PTO-ISA communication primitive 也不能推出 remote distributed behavior 已实现。

## Content Inventory

当前 wiki 覆盖四类 durable maintainer knowledge。

Foundation knowledge 解释普通执行：PyPTO DSL/compiler flow、PTO-ISA tile programming、`simpler` L2 Ascend launch。这是阅读任何 distributed claim 前必须掌握的基础。

Example knowledge 用具体例子解释系统。Hello world 和 elementwise examples 教语法与 tile operation；GEMM 和 attention examples 教 memory movement 与 optimization；L2 vector add 教 runtime launch；TensorMap/ring-buffer examples 教 production scheduling；allreduce 和 FFN tensor parallel examples 教当前 single-host distributed behavior。

Boundary knowledge 解释每个 project 的 ownership。PyPTO owns expression and lowering；PTO-ISA owns kernel instruction semantics；`simpler` owns runtime lifecycle and scheduling；HCCL/HCOMM/URMA support data movement, not PTO worker ownership。

Risk knowledge 记录尚未稳定的区域：remote L3/DistWorker、orchestration-level collectives、complete distributed NN examples，以及 CANN-side repository ownership。

## Ownership Boundaries

PyPTO 是 syntax、type annotations、`@pl.program`、`@pl.function`、IR shape、pass ordering、code generation、`RunConfig`、`CompiledProgram` / `DistributedCompiledProgram` 分叉的主要归属层。它解释“program 被表达和 lowered 成什么”。如果 PyPTO artifact 已经正确，但 device scheduling 失败，bug 更可能属于 runtime layer。

PTO-ISA 是 tiles、memory spaces、instruction semantics、custom operator kernels、CPU/NPU implementations、以及 `TWAIT`、`TNOTIFY`、`TPUT`、`TGET` 这类 kernel-level communication primitives 的归属层。它可以证明 kernel primitive 存在；单独看 PTO-ISA 不能证明 host worker lifecycle、DAG scheduling、callable registration 或 remote orchestration。

`simpler` 是 `Worker(level=2/3/4)`、`ChipWorker`、runtime binary loading、AICPU scheduler behavior、TensorMap dependency discovery、ring-buffer queues、child worker registration、SubWorker execution、comm window bootstrap、deferred completion 的归属层。它解释“已经 lowered 的 callable 和 tensor arguments 如何真正被运行和调度”。

CANN/HCCL/HCOMM/URMA evidence 在本轮主要支撑 communication 和 memory movement。除非未来有 dedicated source evidence 证明更高层 runtime ownership，否则它们应读作 data-plane substrate。

## Target-Set Coverage And Ownership Gaps

当前 wiki 只完成了部分 configured target set 的 source-backed profile。没有 profile 的 repository 不能从本页直接推断 ownership；它们只表示 target set 中存在该方向，具体实现与边界仍需后续 source pass。

| Area | Current wiki coverage | Maintainer implication |
| --- | --- | --- |
| `simpler`, `pto-isa`, `pypto` | profiled with source commits and examples | primary documented surface for this documentation pass |
| `pypto_top_level_documents` | evidence-only through Lingqu design file | useful for design alignment, not full repo ownership |
| `distributed-runtime` | not profiled | inspect before deciding remote L3 / DistWorker ownership |
| `serving-lib`, `pto-li`, `ptoas` | not profiled | 暂不能推断 serving/library/toolchain behavior |
| `hccl` | partial supporting evidence | safe only for HCCL data-plane context |
| `hcomm`, `shmem`, `hixl`, `cann-recipes-infer` | not profiled | add CANN-side documentation pass before using them as authority |

## Status Labels

状态标签使用 [Evidence Status Labels](../evidence/#status-labels)。接手代码时最重要的区别是：`implemented` 表示 source/test/example/merged PR evidence 存在，不表示本轮 wiki pass 已经本地运行对应命令；`not-run` 表示命令来自 source/README evidence，但本轮没有执行。

## Safe First Changes

最安全的 first changes 是那些留在单一 ownership boundary 内、并且有小 example 或 unit-test surface 的改动。下面的段落是读代码前的判断模型，表格只是速查。

对 PyPTO，低风险改动通常是 DSL、parser、pass、codegen 或 example adjustment，可以通过 `examples/hello_world.py`、kernel example 或 `tests/ut` 检查。接手者应先能解释改动如何经过 parser、IR、passes 和 backend generation，再讨论 runtime behavior。

对 PTO-ISA，低风险改动通常是 operator-demo 或 instruction-level change，可以通过 add、GEMM、CPU demo 或 focused NPU communication testcase 推理。接手者需要说明改动影响 compute/data movement、communication primitive semantics，还是 public headers。

对 `simpler`，低风险改动通常是 L2 example/runtime path、TensorMap/ring-buffer behavior，或 local L3 scheduling fix。接手者需要追踪 state 属于哪个 process/thread：Python host、C++ orchestrator、scheduler thread、child process mailbox、AICPU scheduler，还是 AICore/AIV worker。

对 distributed behavior，低风险改动必须先说明 status label。如果证据只是 open issue、skipped test、material blueprint 或 open PR，wiki 只能保留 `emerging`、`design-intended` 或 `TODO`，不能升级为 `implemented`。

## First Maintainer Tasks

这些不是任务分配，而是低风险练习面。它们的价值在于帮助接手者先学会边界判断，再进入更大的 feature 或 bug。

| Area | First task | Minimal verification signal | Risk boundary |
| --- | --- | --- | --- |
| PyPTO | Modify `examples/hello_world.py` shape or elementwise op, then inspect generated output | generated program still has expected `InCore` load/compute/store and orchestration call | 只覆盖 language/compiler；不能推断 runtime success |
| PTO-ISA | Change an add-like demo kernel or inspect GEMM tiling parameters | demo build/test path remains explainable; for hardware, `test.py` passes when run in proper environment | 只覆盖 kernel/operator package；不能推断 PyPTO API support |
| simpler L2 | Run or inspect `examples/workers/l2/hello_worker` then `vector_add` | hello lifecycle completes; vector add golden check passes when run | L2 launch/copy-back only; no rank/window claims |
| simpler L3 | Inspect `multi_chip_dispatch` before allreduce/FFN TP | can explain pre-fork registration, mailbox, TensorMap, and SubWorker/chip worker split | single-host process tree only; no remote DistWorker claim |
| Distributed topic | Split one mixed claim into implemented/emerging/design-intended subclaims | status label and evidence row each cover one behavior | avoid upgrading design target to implemented without merged source/test/example evidence |
| CANN-side | Add a scoped source pass for one CANN repo before using it as authority | repository profile or evidence ledger names inspected ref and observed facts | HCCL support does not imply HCOMM/SHMEM/HIXL ownership |

## Current High-Risk Areas

高风险区域的共同点是“附近有证据，但证据不足以证明完整能力”。读这些行时，不要把 material blueprint、open PR、skipped test、partial demo 或 supporting data-plane evidence 自动升级为 production-ready behavior。

| Risk | Why it matters | Current status | Next maintainer action | Evidence needed to change status |
| --- | --- | --- | --- | --- |
| Remote L3 / DistWorker | Easy to overstate from design docs | `design-intended` | inspect `distributed-runtime` and future `simpler` remote-worker PRs | stable remote worker example, merged PR, or source docs |
| PyPTO collectives | API issues exist, but implementation boundary is not settled | `design-intended` | follow PyPTO issue `#1189` and codegen/runtime changes | merged API + lowering tests + runtime example |
| deferred completion | Multiple merged PRs support deferred completion context | `implemented` | keep examples and docs aligned with merged ABI | source/test/example that show changed behavior |
| SDMA async completion | Open PR still represents unfinished async backend work | `emerging` | track [simpler PR #696](https://github.com/hw-native-sys/simpler/pull/696) or replacement completion backend | merged async completion PR + updated examples/tests |
| complete distributed NN example | Current evidence has complete NN non-distributed examples and distributed partial examples, but not complete distributed NN | `TODO` | design a vertical slice from `llama_mini` plus simpler L3 FFN/collective path | runnable model-level distributed example and evidence ledger update |
| CANN-side ownership | HCCL is partially inspected but HCOMM/SHMEM/HIXL are not | `open question` | run a CANN-side repository documentation pass | CANN repository profiles with source refs |
