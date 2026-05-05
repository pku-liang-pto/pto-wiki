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

本书把 PTO stack 的具体示例按学习颗粒度拆开。每一章都把 run surface 放在对应示例旁边，并在正文中说明 PyPTO、PTO-ISA、simpler 各自证明什么。

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
