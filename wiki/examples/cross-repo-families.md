---
title: "Cross-Repository Example Families"
type: topic
status: draft
sources:
  - repositories/simpler/examples/
  - repositories/pto-isa/demos/
  - repositories/pypto/examples/
  - wiki/evidence/examples-feature-map.md
last_updated: 2026-05-05
---

# Cross-Repository Example Families

同一个算法在三个仓库里出现时，含义不同。PyPTO 说明表达和 lowering；PTO-ISA 说明 tile/kernel/operator；simpler 说明 worker/runtime/task graph。把它们并排读，可以避免把“能写 kernel primitive”误读成“高层 API 和 runtime 已经完整实现”。

## Add / Elementwise

```text
PyPTO     -> describe add in Python DSL
PTO-ISA   -> implement add as tile/kernel/operator package
simpler   -> launch add as a runtime task on a chip
```

PyPTO `hello_world.py` 展示 `@pl.program`、`InCore` function 和 `Orchestration` function。PTO-ISA `demos/baseline/add` 展示 custom op packaging、kernel source、wheel build 和 Python test。simpler `examples/workers/l2/vector_add` 展示 `Worker(level=2)`、`ChipCallable`、`TaskArgs`、device buffer copy、run 和 copy-back。这个示例族是最小完整 mental model。

## GEMM / FFN

GEMM 是第一个必须关注性能结构的示例族。PyPTO matmul/FFN 表达算法；PTO-ISA GEMM 展示 tile shape、per-core work split、GM/L1/L0 movement、pipeline/double buffering；simpler FFN tensor-parallel 示例把 FFN stage 放进 L3 多 chip runtime。

关键直觉：tensor parallelism 不是另一个独立算法，而是 FFN 加上 rank-local tensor ownership、partitioned weights/activations、communication 和 dependency tracking。

## Attention / Paged Attention

Attention 是 kernel 到 model 的桥。PyPTO Flash Attention / Paged Attention 解释 online softmax、loop-carried max/sum、KV cache block table。PTO-ISA Flash Attention baseline 展示高价值 kernel 的低层实现和 packaging。simpler paged-attention runtime 示例展示 TensorMap、ring buffer、AIC/AIV DAG 和 flow control。

关键直觉：optimization 分布在三层。PyPTO 表达算法，PTO-ISA 控制 tile/memory behavior，simpler 控制 task 何时 runnable、producer/consumer 怎么发现、output buffer 怎么复用。

## Communication

Communication 示例最容易被过度解读。PTO-ISA allgather/URMA/SDMA demos 证明 kernel/data movement primitive；simpler allreduce/FFN TP 证明 single-host multi-chip data-plane；PyPTO distributed tests/codegen 证明 hierarchy-aware program 和 L3 runner integration。它们共同指向 distributed direction，但 remote L3/DistWorker/control plane 仍是 `design-intended`。

## Family Summary

| Family | PyPTO | PTO-ISA | simpler | 正确结论 |
| --- | --- | --- | --- | --- |
| Add | DSL / `InCore` | custom op kernel | L2 launch | 三层最小闭环 |
| GEMM / FFN | matmul/FFN expression | tiling/pipeline | FFN TP runtime | performance + partitioning |
| Attention | Flash/Paged Attention | optimized attention kernel | TensorMap/ring runtime | model kernel + runtime flow control |
| Communication | hierarchy tests/codegen | allgather/URMA primitive | allreduce/window | data-plane present; remote control plane not proven |
| Complete model | `llama_mini` | no full model | no full distributed model | complete distributed NN remains `TODO` |
