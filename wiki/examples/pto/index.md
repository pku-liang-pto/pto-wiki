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

- [Hello / Elementwise](./hello-elementwise.md): 从最小 PyPTO program、PTO-ISA add kernel 和 `simpler` L2 vector add 建立 expression/kernel/runtime 三层闭环。
- [GEMM / FFN](./gemm-ffn.md): 从 matmul 和 FFN block 进入 tiling、double buffering、tensor-parallel runtime 的性能路径。
- [Softmax / Attention](./softmax-attention.md): 解释 softmax、Flash Attention、Paged Attention、KV cache 和 runtime dependency 管理。
- [Complete Models](./complete-models.md): 用 PyPTO `llama_mini` 串起 RMSNorm、QKV、RoPE、attention、SwiGLU、residual 和 LM head，并标出 complete distributed NN 缺口。
- [Distributed Runtime](./distributed-runtime.md): 学习 `simpler` L3 allreduce、FFN TP、PTO-ISA allgather async、PyPTO hierarchy tests 分别证明哪一层。
- [Missing Roadmap](./missing-roadmap.md): 把缺失的 examples 写成 learning gaps、implementation gaps 和升级为 `implemented` 所需 evidence。

## Cross-Repository Reading Rule

同一个数学概念会在不同仓库出现多次。例如 add 在 PyPTO 是 DSL/IR 示例，在 PTO-ISA 是 tile/operator 示例，在 `simpler` 是 L2 runtime launch 示例；FFN 在 PyPTO 是 model block，在 PTO-ISA 需要 GEMM kernel，在 `simpler` L3 中变成 tensor-parallel runtime 示例。读每一章时都要问：这个 source 证明的是 expression、kernel semantics、runtime scheduling，还是 distributed data movement？
