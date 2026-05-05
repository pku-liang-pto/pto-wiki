---
title: "PTO-CANN Toolchain Wiki"
type: index
status: draft
sources:
  - config/target-set.yml
last_updated: 2026-05-05
---

# PTO-CANN Toolchain Wiki

这是 PTO-CANN target set 的公开学习入口。它把 PyPTO、PTO-ISA、`simpler` 和相关 CANN 通信材料组织成一套可以直接阅读的知识层：先建立概念和示例，再进入 repository architecture、runtime topics 和 source-material audit。读者不需要先打开源码才能理解主线；源码、PR、issue、materials 和 evidence ledgers 用来核对事实边界。

## Start Here

```text
Basic terms
  -> PTO examples
  -> repository chapters
  -> runtime / distributed topics
  -> materials and evidence for audit
```

第一次阅读建议按这个顺序走：

1. [Basic Terms](./concepts/basic-terms.md)：先分清 PyPTO language、PTO-ISA tile/kernel、`simpler` runtime、CANN/HCCL substrate。
2. [PTO Examples](./examples/pto/)：用 hello/add、GEMM/FFN、attention、complete model、L3 allreduce/FFN TP 建立具体直觉。
3. [Repositories](./repositories/)：理解 [pypto](./repositories/pypto.md)、[pto-isa](./repositories/pto-isa.md)、[simpler](./repositories/simpler.md) 分别拥有哪一层。
4. [Topics](./topics/)：把普通执行、`simpler` runtime、distributed execution、Lingqu level 和 maintainer takeover 串起来。
5. [Materials](./materials/) 和 [Evidence](./evidence/)：当你需要追溯设计材料、源码 ref、PR/issue 状态或 checksum 时再进入。

## Public Areas

- [Repositories](./repositories/) teaches code ownership: which repo owns DSL/codegen, tile/kernel semantics, runtime scheduling, and current distributed surfaces.
- [Examples](./examples/) teaches by concrete cases: every chapter names the concept, run surface, source paths, proof boundary, and next example.
- [Topics](./topics/) teaches cross-repository behavior: execution flow, runtime architecture, distributed blueprint/status, level mapping, and takeover risks.
- [Concepts](./concepts/) teaches reusable vocabulary: the words that otherwise look similar across PyPTO, PTO-ISA, `simpler`, and CANN.
- [Materials](./materials/) exposes user-provided source materials as readable public references. Synthesized wiki pages remain the canonical learning layer when source status matters.
