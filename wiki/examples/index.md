---
title: "Examples"
type: index
status: draft
sources:
  - wiki/evidence/examples-feature-map.md
last_updated: 2026-05-05
---

# Examples

本区按 example domain 组织公开学习材料。Examples 是这个 wiki 的第一等内容，因为示例把抽象层次落到可检查的 program、kernel、runtime lifecycle 和 validation signal 上。当前已经系统整理的是 PTO stack：PyPTO 负责表达计算，PTO-ISA 负责 tile/kernel/operator primitive，simpler 负责 runtime launch、task graph、rank/window 和 communication data plane。

## Domains

- [PTO Examples](./pto/): 从 hello/add 到 GEMM/FFN、attention、complete model、distributed runtime 的 chapter-style 示例路径。

后续如果 CANN recipes、serving 或 integration examples 完成 source-backed pass，可以作为 `wiki/examples/cann/`、`wiki/examples/serving/` 或 `wiki/examples/integration/` 加入本区。

## Recommended Path

```text
PTO hello / elementwise
  -> GEMM / FFN
  -> softmax / attention
  -> complete model
  -> distributed runtime
  -> missing distributed NN roadmap
```

示例状态和证据边界见 [Examples Feature Map Evidence](../evidence/examples-feature-map.md)。

读示例时不要只看“有没有覆盖”。每个示例都要回答四个问题：它教哪个背景概念，它在哪个仓库实现，它的 run surface 能证明什么，以及它不能证明什么。这个规则尤其重要，因为 PTO-ISA communication demo、simpler L3 example 和 PyPTO hierarchy test 经常指向同一个 distributed 方向，但它们证明的是不同层。
