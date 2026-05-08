---
title: "Overview"
type: overview
status: draft
sources:
  - config/target-set.yml
  - wiki/evidence/non-distributed-execution.md
  - wiki/evidence/distributed-execution.md
last_updated: 2026-05-08
---

# Overview

本页是 PTO-CANN target set 的总览。它不替代各个 repository、example、topic 章节，而是先给读者一个完整心智模型：PTO 为什么分成 PyPTO、PTO-ISA 和 `simpler`，普通程序怎样跑起来，distributed execution 又在哪些基础上继续扩展。

当前 target set 来自 `config/target-set.yml`。本页只讲已经被 wiki source pass 覆盖的主线；未 profile 的 repository 仍保留在 [Projects](./projects.md)，不能从这里推断 ownership。

## How To Read This Page

第一次阅读时，把本页当成压缩版教材：先读 `Current PTO Runtime Synthesis`，确认从 Python DSL 到 Ascend device execution 的主链路；再读 `Standalone Learning Spine`，决定下一页从 concepts、examples、repositories 还是 topics 进入。已经熟悉系统的读者可以直接用本页检查状态边界：single-host L3 有源码/示例证据，remote L3 / DistWorker / cross-host control plane 仍是 `design-intended`。

## Current PTO Runtime Synthesis

PTO 的学习主线从一个普通、非分布式程序开始。用户在 PyPTO 中写 Python DSL；PyPTO parser 和 pass pipeline 把它变成 IR 与 runtime-facing artifact；PTO-ISA 提供 kernel 内的 tile load/compute/store/communication primitive；`simpler` L2 把 host runtime、AICPU scheduler 和 AICore/AIV kernel 启动到一个 Ascend device 上。这个基础路径解释了“一个 program 如何真正跑起来”，也是所有 distributed execution 的前提。

```text
Python user program
  -> PyPTO DSL / parser / passes
  -> generated host + kernel-facing artifacts
  -> PTO-ISA tile and communication primitives
  -> simpler L2 ChipWorker
  -> host runtime + AICPU scheduler + AICore/AIV kernels
  -> device result copied back to host
```

在这层基础上，当前已验证的 distributed path 是 single-host L3 execution：PyPTO 表达 hierarchy programs，PyPTO distributed codegen/runner 调用 `simpler.Worker(level=3)`，`simpler` 管理 local host/chip/SubWorker execution，PTO-ISA 提供 kernel-level tile 和 communication primitives。HCCL 支撑 data-plane communication/window behavior，但不替代 PTO Runtime control plane。证据见 [Distributed Execution Evidence](./evidence/distributed-execution.md#claim-map)。

```text
implemented foundation              implemented local distributed partial

PyPTO program                        PyPTO hierarchy program
  -> PTO-ISA kernel artifacts          -> simpler Worker(level=3)
  -> simpler L2 ChipWorker             -> local chip workers / SubWorkers
  -> one Ascend device                 -> HCCL-backed rank/window data plane

not yet proven by current wiki evidence:
remote L3 worker lifecycle, cross-host callable registry, RoCE/URMA control plane
```

Remote L3、DistWorker、cross-host callable registration、RoCE/URMA-backed remote runtime control 在仓库证据改变前都记录为 `design-intended`，不能写成已实现能力；对应 negative findings 和 open questions 见 [Distributed Execution Evidence](./evidence/distributed-execution.md#negative-findings)。

## Standalone Learning Spine

这个 wiki 的阅读主线不是“先找外部资料”，而是从 wiki 内部直接建立系统知识，再通过 source links 做审计。当前公开内容分成四层。

第一层是概念和普通执行。[Basic Terms](./concepts/basic-terms.md) 和 [Non-Distributed Execution](./topics/non-distributed-execution.md) 定义 tensor、tile、GM/on-chip memory、AICPU/AICore/AIV、`InCore`、`Orchestration`、`ChipWorker`、TensorMap、ring buffer 和 runtime levels。

第二层是 repository ownership。[pypto](./repositories/pypto.md) 是 language/compiler/runtime-facing entry；[pto-isa](./repositories/pto-isa.md) 是 tile/kernel instruction layer；[simpler](./repositories/simpler.md) 是 runtime that launches and schedules chip work。`simpler` 的上游 architecture docs 已经合成到 [simpler Runtime Architecture](./topics/simpler-runtime-architecture.md)，覆盖 L2 three-program launch、L3+ Orchestrator/Scheduler/Worker composition、`TaskArgs` flow、TensorMap/ring behavior、THREAD/PROCESS mode 和 worker examples。

第三层是 examples。[PTO Examples](./examples/pto/) 通过 hello world、elementwise、GEMM、softmax、attention、LLaMA mini、L2 runtime launch、TensorMap/ring-buffer runtime、allreduce 和 tensor-parallel FFN 解释系统。每个 example 都说明 source surface 证明了 expression、kernel semantics、runtime scheduling，还是 data-plane communication。

第四层是 distributed synthesis。[Distributed Execution](./topics/distributed-execution.md) 解释 hierarchy、rank/window communication、HCCL data-plane support，以及 implemented single-host L3 与 design-intended remote L3 的边界。

第五层是 future / ongoing work。[Future](./future/) 保存已经有持久学习价值、但还不能写成 implemented behavior 的 roadmap、task division、planned feature、blocker、missing example 和 design-intended behavior。[PR 711 Remote Dispatch and Data Plane Primer](./future/pr711-grpc-dispatch-primer.md) 用来补足 gRPC/protobuf、generated stubs、L4 proxy/mailbox shim、L3 daemon/backend process、`TensorPool`、RXE/ibverbs data-plane MVP、HCOMM boundary 和 output writeback 的基础直觉；[Runtime Dispatch and Serving Roadmap](./future/runtime-dispatch-and-serving-roadmap.md) 把 `simpler` PR #711 remote L3 control-plane、host-memory tensor data-plane prototype、production data-plane target、A5 send/receive zero-copy dispatch、UBL128 serving target 和 runtime blockers 放在同一个状态边界里读。Future 页面必须说明目标、约束、状态和证据边界，并链接回当前已经实现的基础页面。

## What To Remember

PTO-CANN wiki 当前最重要的判断有三条。第一，非分布式基础不是附录：PyPTO 普通编译、PTO-ISA tile kernel、`simpler` L2 launch 是理解 distributed runtime 的必要前提。第二，examples 是最好的学习入口：hello/add 解释最小闭环，GEMM/attention 解释 kernel 和 performance，FFN TP/allreduce 解释当前 single-host distributed runtime。第三，HCCL 和 PTO-ISA communication primitives 支撑 data plane，但 remote worker lifecycle、remote callable registry 和 cross-host control plane 仍需要后续源码或可运行示例证明。
