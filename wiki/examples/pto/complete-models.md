---
title: "PTO Complete Model Examples"
type: topic
status: draft
sources:
  - repositories/pypto/examples/models/08_llama_mini.py
  - wiki/evidence/examples-feature-map.md
last_updated: 2026-05-05
---

# PTO Complete Model Examples

当前 complete model baseline 是 PyPTO `llama_mini`。它不是 production LLaMA，也不是 distributed model，但它把 RMSNorm、QKV、RoPE、attention、SwiGLU MLP、residual、final norm 和 LM head 连成一个 compact decoder flow。

## How To Read This Page

把 `llama_mini` 当成 complete non-distributed reference。后续 complete distributed NN 应该能说明它如何被 partition、lower、run、validate。

```text
llama_mini non-distributed graph
  -> partitioned FFN / attention target
  -> complete distributed NN missing example
```

## PyPTO LLaMA Mini

`repositories/pypto/examples/models/08_llama_mini.py` 定义 parameterized program builder。默认形态是 small single-head decoder：`seq_len=16`、`head_dim=64`、`vocab_size=64`。它的 flow 是：

```text
hidden [S,D]
  -> RMSNorm
  -> Q, K, V projections
  -> RoPE on Q/K
  -> Q @ K^T, scale, mask, softmax
  -> probs @ V, dense projection, residual
  -> RMSNorm
  -> SwiGLU MLP, residual
  -> final RMSNorm
  -> LM head [S,D] @ [D,V]
  -> logits [S,V]
```

Run surface:

| Entry | Hardware | Expected signal | Caveat |
| --- | --- | --- | --- |
| import/use `build_llama_mini_program()` | no for source reading | can identify model stages and generated program shape | inspected file has no stable `__main__` run command |

Safe reading/editing focus:

- Change `seq_len` or `vocab_size` to understand shape propagation.
- Preserve source constraint that `head_dim` must be divisible by 16 for K-tiled transpose matmul.
- Compare FFN stages with [GEMM / FFN](./gemm-ffn.md) before discussing tensor parallel partitioning.

## Complete Distributed NN Gap

Complete distributed NN is not implemented in the inspected evidence. The missing vertical slice would need:

- model graph derived from LLaMA/FFN/attention
- explicit rank-local tensor ownership
- PyPTO hierarchy-aware lowering
- simpler L3/L4 runtime execution
- PTO-ISA kernels/communication primitives
- rank-local and cross-rank validation

Detailed acceptance criteria live in [Missing Roadmap](./missing-roadmap.md).
