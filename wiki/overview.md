---
title: "Overview"
type: overview
status: draft
sources:
  - config/target-set.yml
  - wiki/evidence/non-distributed-execution.md
  - wiki/evidence/distributed-execution.md
last_updated: 2026-05-04
---

# Overview

This page is the living synthesis for the configured target set. It summarizes durable knowledge that cuts across individual pages and teaches the project shape.

The current target set is defined in `config/target-set.yml`.

## Current PTO Runtime Synthesis

PTO 的学习主线从一个普通、非分布式程序开始。用户在 PyPTO 中写 Python DSL；PyPTO parser 和 pass pipeline 把它变成 IR 与 tile/runtime-facing artifact；PTO-ISA 提供 kernel 内的 tile load/compute/store/communication 指令；simpler L2 把 host runtime、AICPU scheduler 和 AICore/AIV kernel 启动到一个 Ascend device 上。这个基础路径解释了“一个 program 如何真正跑起来”，也是所有 distributed execution 的前提。

```text
PyPTO DSL
  -> PyPTO IR / passes / codegen
  -> PTO-ISA tile kernel interface
  -> simpler L2 ChipWorker
  -> host runtime + AICPU scheduler + AICore/AIV kernels
  -> result copied back to host
```

在这层基础上，当前已验证的 distributed path 是 single-host L3 execution：PyPTO 表达 hierarchy programs，PyPTO distributed codegen/runner 调用 `simpler.Worker(level=3)`，`simpler` 管理 local host/chip/SubWorker execution，PTO-ISA 提供 kernel-level tile 和 communication primitives。HCCL 支撑 data-plane communication/window behavior，但不替代 PTO Runtime control plane。证据见 [Distributed Execution Evidence](./evidence/distributed-execution.md#claim-map)。

Remote L3、DistWorker、cross-host callable registration、RoCE/URMA-backed remote runtime control 在仓库证据改变前都记录为 `design-intended`，不能写成已实现能力；对应 negative findings 和 open questions 见 [Distributed Execution Evidence](./evidence/distributed-execution.md#negative-findings)。

## Standalone Learning Spine

The wiki teaches the target set in four layers.

First, [Basic Terms](./concepts/basic-terms.md) and [Non-Distributed Execution](./topics/non-distributed-execution.md) define the vocabulary: tensor, tile, GM/on-chip memory, AICPU/AICore/AIV, `InCore`, `Orchestration`, `ChipWorker`, TensorMap, ring buffer, and runtime levels.

Second, the repository profiles explain each subsystem as a component, not just a directory listing. [pypto](./repositories/pypto.md) is the language/compiler/runtime-facing entry; [pto-isa](./repositories/pto-isa.md) is the tile/kernel instruction layer; [simpler](./repositories/simpler.md) is the runtime that launches and schedules chip work. `simpler` also has unusually strong upstream architecture docs, now synthesized in [simpler Runtime Architecture](./topics/simpler-runtime-architecture.md): L2 three-program launch, L3+ Orchestrator/Scheduler/Worker composition, `TaskArgs` flow, TensorMap/ring behavior, THREAD/PROCESS mode, and worker examples.

Third, [Examples Feature Map](./topics/examples-feature-map.md) teaches the system through examples from kernel to complete NN: hello world, elementwise, GEMM, softmax, attention, LLaMA mini, L2 runtime launch, TensorMap/ring-buffer runtime, allreduce, and tensor-parallel FFN.

Fourth, [Distributed Execution](./topics/distributed-execution.md) adds hierarchy, rank/window communication, HCCL data-plane support, and the boundary between implemented single-host L3 and design-intended remote L3.
