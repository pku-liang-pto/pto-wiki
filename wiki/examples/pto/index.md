---
title: "PTO Examples"
type: index
status: draft
sources:
  - repositories/simpler/examples/
  - repositories/pto-isa/demos/
  - repositories/pypto/examples/
  - repositories/pypto/tests/st/distributed/
  - wiki/evidence/examples-feature-map.md
last_updated: 2026-05-05
---

# PTO Examples

本书把 PTO stack 的具体示例按学习颗粒度拆开。每一章都把 run surface 放在对应示例旁边，并在正文中说明 PyPTO、PTO-ISA、simpler 各自证明什么。这里的目标不是做 examples checklist，而是让读者能通过示例掌握系统：一个 program 如何表达、kernel 如何贴近 hardware、runtime 如何启动和调度、distributed claim 到底证明到哪一层。

## How To Read This Page

如果你是第一次读，从 [Hello / Elementwise](./hello-elementwise.md) 开始。如果你已经理解 tile load/compute/store，可以直接跳到 [GEMM / FFN](./gemm-ffn.md) 或 [Softmax / Attention](./softmax-attention.md)。如果你只关心 distributed boundary，先读 [Distributed Runtime](./distributed-runtime.md)，再用 [Missing Roadmap](./missing-roadmap.md) 校准哪些能力仍是 `TODO` 或 `design-intended`。

```text
operator basics
  -> performance kernels
  -> model kernels
  -> complete non-distributed model
  -> distributed runtime partials
  -> missing complete distributed model
```

## Chapters

- [Hello / Elementwise](./hello-elementwise.md): PyPTO hello、PTO-ISA add、simpler L2 vector add。
- [GEMM / FFN](./gemm-ffn.md): PyPTO matmul/FFN、PTO-ISA GEMM、simpler FFN tensor parallel。
- [Softmax / Attention](./softmax-attention.md): PyPTO softmax/norm/Flash Attention/Paged Attention、PTO-ISA attention baseline、simpler paged-attention runtime。
- [Complete Models](./complete-models.md): PyPTO `llama_mini` 和 complete distributed NN 的缺口。
- [Distributed Runtime](./distributed-runtime.md): simpler L3 allreduce、FFN TP、PTO-ISA allgather、PyPTO hierarchy tests。
- [Missing Roadmap](./missing-roadmap.md): missing examples 和升级为 `implemented` 前需要的 evidence。

## Cross-Repository Reading Rule

同一个数学概念会在不同仓库出现多次。例如 add 在 PyPTO 是 DSL/IR 示例，在 PTO-ISA 是 tile/operator 示例，在 `simpler` 是 L2 runtime launch 示例；FFN 在 PyPTO 是 model block，在 PTO-ISA 需要 GEMM kernel，在 `simpler` L3 中变成 tensor-parallel runtime 示例。读每一章时都要问：这个 source 证明的是 expression、kernel semantics、runtime scheduling，还是 distributed data movement？
