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

关键 building blocks 可以这样读：

| Block | Local meaning | Why it matters for future distributed NN |
| --- | --- | --- |
| RMSNorm | 对每个 token 的 hidden vector 做均方归一化 | normalization 是否 rank-local，取决于 hidden dimension partition |
| Q/K/V projections | 三个 `[S,D] x [D,D]` linear projections | weight/tensor partitioning 会直接影响 attention input ownership |
| RoPE | 给 Q/K 注入 position 信息，使用 `head_dim/2` half-rotation | position embedding 通常 rank-local，但 shape constraints 必须保留 |
| Attention | `Q @ K^T -> scale/mask/softmax -> probs @ V` | 可能需要跨 rank K/V 或 partial score aggregation |
| SwiGLU MLP | gate/up/down projections with activation | 对应 [GEMM / FFN](./gemm-ffn.md) 的 tensor-parallel target |
| Residual / LM head | 把 block output 接回 hidden，再投到 vocab logits | complete model validation 需要最终 logits golden |

Run surface：

| Cwd | Entry | Hardware | Expected signal | Run status | Caveat |
| --- | --- | --- | --- | --- | --- |
| `repositories/pypto/` | import/use `build_llama_mini_program()` from `examples/models/08_llama_mini.py` | no for source reading | can identify model stages and generated program shape | `not-run`; source-inspected | inspected file has no stable `__main__` run command |

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

## What To Read Next

读完本页后，回到 [GEMM / FFN](./gemm-ffn.md) 看 FFN 如何变成 tensor-parallel runtime partial，再读 [Distributed Runtime](./distributed-runtime.md) 看 allreduce、allgather 和 PyPTO hierarchy tests 分别证明哪一层。最后用 [Missing Roadmap](./missing-roadmap.md) 检查 complete distributed NN 还缺哪些 evidence。

## What To Remember

`llama_mini` 是 complete non-distributed model reference。它帮助读者理解 model graph 和 stage boundaries，但它不是 distributed proof。未来 distributed model page 必须解释 partitioning、rank-local ownership、cross-rank communication、runtime scheduling 和 validation。
