---
title: "Overview"
type: overview
status: draft
sources:
  - config/target-set.yml
  - wiki/evidence/non-distributed-execution.md
  - wiki/evidence/distributed-execution.md
last_updated: 2026-05-05
---

# Overview

本页是 PTO-CANN target set 的总览。它不替代各个 repository、example、topic 章节，而是先给读者一个完整心智模型：PTO 为什么分成 PyPTO、PTO-ISA 和 `simpler`，普通程序怎样跑起来，distributed execution 又在哪些基础上继续扩展。

The current target set is defined in `config/target-set.yml`.

## How To Read This Page

第一次阅读时，把本页当成地图和压缩版教材：先读 `Current PTO Runtime Synthesis`，确认从 Python DSL 到 Ascend device execution 的主链路；再读 `Standalone Learning Spine`，决定下一页从 concepts、examples、repositories 还是 topics 进入。已经熟悉系统的读者可以直接用本页检查某个 claim 的状态边界，例如 single-host L3 已实现、remote L3 仍是设计目标。

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

这个 wiki 的阅读主线不是“先找外部资料”，而是从 wiki 内部直接建立系统知识，再通过 source links 做审计。当前公开内容分成四层。

First, [Basic Terms](./concepts/basic-terms.md) and [Non-Distributed Execution](./topics/non-distributed-execution.md) define the vocabulary: tensor, tile, GM/on-chip memory, AICPU/AICore/AIV, `InCore`, `Orchestration`, `ChipWorker`, TensorMap, ring buffer, and runtime levels.

Second, the repository profiles explain each subsystem as a component, not just a directory listing. [pypto](./repositories/pypto.md) is the language/compiler/runtime-facing entry; [pto-isa](./repositories/pto-isa.md) is the tile/kernel instruction layer; [simpler](./repositories/simpler.md) is the runtime that launches and schedules chip work. `simpler` also has unusually strong upstream architecture docs, now synthesized in [simpler Runtime Architecture](./topics/simpler-runtime-architecture.md): L2 three-program launch, L3+ Orchestrator/Scheduler/Worker composition, `TaskArgs` flow, TensorMap/ring behavior, THREAD/PROCESS mode, and worker examples.

Third, [PTO Examples](./examples/pto/) teaches the system through examples from kernel to complete NN: hello world, elementwise, GEMM, softmax, attention, LLaMA mini, L2 runtime launch, TensorMap/ring-buffer runtime, allreduce, and tensor-parallel FFN.

Fourth, [Distributed Execution](./topics/distributed-execution.md) adds hierarchy, rank/window communication, HCCL data-plane support, and the boundary between implemented single-host L3 and design-intended remote L3.

## What To Remember

PTO-CANN wiki 当前最重要的判断有三条。第一，非分布式基础不是附录：PyPTO 普通编译、PTO-ISA tile kernel、`simpler` L2 launch 是理解 distributed runtime 的必要前提。第二，examples 是最好的学习入口：hello/add 解释最小闭环，GEMM/attention 解释 kernel 和 performance，FFN TP/allreduce 解释当前 single-host distributed runtime。第三，HCCL 和 PTO-ISA communication primitives 支撑 data plane，但 remote worker lifecycle、remote callable registry 和 cross-host control plane 仍需要后续源码或可运行示例证明。
