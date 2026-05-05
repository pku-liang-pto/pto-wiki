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

这个例子的重要性不在于模型规模，而在于它第一次把前面章节的多个概念放进一个完整 decoder flow。RMSNorm 对应 normalization pattern；Q/K/V projection 和 MLP 对应 GEMM/FFN；attention 对应 softmax、mask、RoPE 和 PV matmul；residual 把多个阶段连成 model graph。未来 distributed NN 示例必须解释这些阶段如何被切分、哪些 tensor 留在 rank-local、哪些 tensor 需要跨 rank communication。

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

因此，`llama_mini` 当前应该被当作 complete non-distributed reference。它给未来 distributed model 提供 shape、stage 和 validation 目标，但不能单独证明 tensor parallel execution、collective lowering 或 remote worker behavior。
