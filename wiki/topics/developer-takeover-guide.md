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
last_updated: 2026-05-04
---

# Developer Takeover Guide

本页面面向准备接手 PTO Runtime / PTO-ISA / PyPTO 工作的开发者和维护者。它不是“第几天读什么”的计划，而是把接手所需的系统内容讲清楚：系统由哪些层组成、每层负责什么、哪些能力已经实现、哪些能力只是设计目标，以及维护者在修改代码前必须保护哪些边界。证据 ledger 见 [Developer Takeover Guide Evidence](../evidence/developer-takeover-guide.md)。

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

This guide still links to the detailed pages, but the ownership model above is the self-contained rule: do not fix a compiler symptom in the runtime without proving the compiler artifact is correct; do not infer runtime scheduling from a kernel primitive; do not mark remote distributed behavior as implemented because a local HCCL window or kernel communication primitive exists.

## Content Inventory

The wiki now covers four kinds of durable maintainer knowledge.

Foundation knowledge explains normal execution: PyPTO DSL and compiler flow, PTO-ISA tile programming, and simpler L2 launch on Ascend. This is the material a maintainer needs before reading any distributed claim.

Example knowledge explains the system by concrete cases. Hello world and elementwise examples teach syntax and tile operations; GEMM and attention examples teach memory movement and optimization; L2 vector add teaches runtime launch; TensorMap/ring-buffer examples teach production scheduling; allreduce and FFN tensor parallel examples teach current single-host distributed behavior.

Boundary knowledge explains what each project owns. PyPTO owns expression and lowering; PTO-ISA owns kernel instruction semantics; simpler owns runtime lifecycle and scheduling; HCCL/HCOMM/URMA support data movement, not PTO worker ownership.

Risk knowledge records what is not yet stable: remote L3/DistWorker, orchestration-level collectives, complete distributed NN examples, and CANN-side repository ownership.

## Ownership Boundaries

PyPTO is the place to look when a feature is about syntax, type annotations, `@pl.program`, `@pl.function`, IR shape, pass ordering, code generation, `RunConfig`, or whether a program becomes a normal `CompiledProgram` or a `DistributedCompiledProgram`. Its output is only one side of execution; if the generated artifact is correct but device scheduling fails, the runtime layer may own the bug.

PTO-ISA is the place to look when a feature is about tiles, memory spaces, instruction semantics, custom operator kernels, CPU/NPU implementations, or kernel-level communication primitives such as `TWAIT`, `TNOTIFY`, `TPUT`, and `TGET`. It can prove that a kernel primitive exists. By itself, it does not prove host worker lifecycle, DAG scheduling, callable registration, or remote orchestration.

simpler is the place to look when a feature is about `Worker(level=2/3/4)`, `ChipWorker`, runtime binary loading, AICPU scheduler behavior, TensorMap dependency discovery, ring-buffer queues, child worker registration, SubWorker execution, comm window bootstrap, or deferred completion.

CANN/HCCL/HCOMM/URMA evidence is supporting evidence for communication and memory movement. It should be treated as data-plane substrate unless a future source pass proves higher-level runtime ownership.

## Target-Set Coverage And Ownership Gaps

This wiki currently profiles only part of the configured target set. Do not assign ownership for unprofiled repositories from this wiki alone.

| Area | Current wiki coverage | Maintainer implication |
| --- | --- | --- |
| `simpler`, `pto-isa`, `pypto` | profiled with source commits and examples | primary documented surface for this documentation pass |
| `pypto_top_level_documents` | evidence-only through Lingqu design file | useful for design alignment, not full repo ownership |
| `distributed-runtime` | not profiled | inspect before deciding remote L3 / DistWorker ownership |
| `serving-lib`, `pto-li`, `ptoas` | not profiled | do not infer serving/library/toolchain behavior yet |
| `hccl` | partial supporting evidence | safe only for HCCL data-plane context |
| `hcomm`, `shmem`, `hixl`, `cann-recipes-infer` | not profiled | add CANN-side documentation pass before using them as authority |

## Status Labels

Use the shared labels in [Evidence Status Labels](../evidence/#status-labels). For maintainer work, the key distinction is: `implemented` means source/test/example/merged PR evidence exists; it does not mean the wiki pass ran the code locally. Use `not-run` for documented example commands that were not executed during the pass.

## Safe First Changes

The safest first changes are those that stay inside one ownership boundary and have a small example or unit-test surface.

For PyPTO, a safe first change is usually a DSL, parser, pass, codegen, or example adjustment that can be checked through `examples/hello_world.py`, a kernel example, or `tests/ut`. The maintainer should be able to explain how the change moves through parser, IR, passes, and backend generation before touching runtime behavior.

For PTO-ISA, a safe first change is usually an operator-demo or instruction-level change that can be reasoned about through add, GEMM, CPU demo, or a focused NPU communication testcase. The maintainer should state whether the change affects compute/data movement only, communication primitive semantics, or public headers.

For simpler, a safe first change is usually an L2 example/runtime path, TensorMap/ring-buffer behavior, or local L3 scheduling fix. The maintainer should trace which process owns the state: Python host, C++ orchestrator, scheduler thread, child process mailbox, AICPU scheduler, or AICore/AIV worker.

For distributed behavior, a safe first change must state its status label. If the evidence is an open issue, skipped test, material blueprint, or open PR, the wiki should preserve `emerging`, `design-intended`, or `TODO` instead of turning the behavior into `implemented`.

## First Maintainer Tasks

These are not assignments; they are low-risk practice tasks that teach the system boundary before larger changes.

| Area | First task | Minimal verification signal | Risk boundary |
| --- | --- | --- | --- |
| PyPTO | Modify `examples/hello_world.py` shape or elementwise op, then inspect generated output | generated program still has expected `InCore` load/compute/store and orchestration call | language/compiler only; do not infer runtime success |
| PTO-ISA | Change an add-like demo kernel or inspect GEMM tiling parameters | demo build/test path remains explainable; for hardware, `test.py` passes when run in proper environment | kernel/operator package only; do not infer PyPTO API support |
| simpler L2 | Run or inspect `examples/workers/l2/hello_worker` then `vector_add` | hello lifecycle completes; vector add golden check passes when run | L2 launch/copy-back only; no rank/window claims |
| simpler L3 | Inspect `multi_chip_dispatch` before allreduce/FFN TP | can explain pre-fork registration, mailbox, TensorMap, and SubWorker/chip worker split | single-host process tree only; no remote DistWorker claim |
| Distributed topic | Split one mixed claim into implemented/emerging/design-intended subclaims | status label and evidence row each cover one behavior | avoid upgrading design target to implemented without merged source/test/example evidence |
| CANN-side | Add a scoped source pass for one CANN repo before using it as authority | repository profile or evidence ledger names inspected ref and observed facts | HCCL support does not imply HCOMM/SHMEM/HIXL ownership |

## Current High-Risk Areas

| Risk | Why it matters | Current status | Next maintainer action | Evidence needed to change status |
| --- | --- | --- | --- | --- |
| Remote L3 / DistWorker | Easy to overstate from design docs | `design-intended` | inspect `distributed-runtime` and future `simpler` remote-worker PRs | stable remote worker example, merged PR, or source docs |
| PyPTO collectives | API issues exist, but implementation boundary is not settled | `design-intended` | follow PyPTO issue `#1189` and codegen/runtime changes | merged API + lowering tests + runtime example |
| deferred completion | Multiple merged PRs support deferred completion context | `implemented` | keep examples and docs aligned with merged ABI | source/test/example that show changed behavior |
| SDMA async completion | Open PR still represents unfinished async backend work | `emerging` | track [simpler PR #696](https://github.com/hw-native-sys/simpler/pull/696) or replacement completion backend | merged async completion PR + updated examples/tests |
| complete distributed NN example | Current evidence has complete NN non-distributed examples and distributed partial examples, but not complete distributed NN | `TODO` | design a vertical slice from `llama_mini` plus simpler L3 FFN/collective path | runnable model-level distributed example and evidence ledger update |
| CANN-side ownership | HCCL is partially inspected but HCOMM/SHMEM/HIXL are not | `open question` | run a CANN-side repository documentation pass | CANN repository profiles with source refs |
