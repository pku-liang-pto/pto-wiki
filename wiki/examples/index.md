---
title: "Examples"
type: index
status: draft
sources:
  - wiki/evidence/examples-feature-map.md
last_updated: 2026-05-05
---

# Examples

本区按 example domain 组织公开学习材料。当前已经系统整理的是 PTO stack：PyPTO 负责表达计算，PTO-ISA 负责 tile/kernel/operator primitive，simpler 负责 runtime launch、task graph、rank/window 和 communication data plane。

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
