---
title: "Examples Feature Map"
type: topic
status: draft
sources:
  - wiki/examples/
  - wiki/evidence/examples-feature-map.md
last_updated: 2026-05-05
---

# Examples Feature Map

本页解释 PTO examples system 的组织逻辑。具体示例章节已经移到公开的 [PTO Examples](../examples/pto/) 区域；本页保留的价值是说明为什么示例按“表达 -> kernel -> runtime -> distributed partial -> missing vertical slice”组织，以及同一个数学概念在 PyPTO、PTO-ISA、`simpler` 中分别证明什么。

## How To Read This Page

如果你要学习示例，直接去 [PTO Examples](../examples/pto/)。如果你要判断“这个例子应该放在哪一层、能证明什么、还缺什么”，读本页。本页和 [Examples Feature Map Evidence](../evidence/examples-feature-map.md) 一起约束 future example rewrites：coverage 不是目标，能解释背景、run surface、proof boundary 才是目标。

```text
PyPTO examples
  teach expression, IR shape, model blocks
PTO-ISA demos
  teach tile/kernel/operator primitive
simpler examples
  teach runtime launch, TensorMap/ring, L2/L3 scheduling
Missing roadmap
  records vertical slices not yet proven end to end
```

## Example Ladder

| Stage | Primary page | What it teaches | What it does not prove |
| --- | --- | --- | --- |
| hello / elementwise | [Hello / Elementwise](../examples/pto/hello-elementwise.md) | 最小 DSL、tile add、L2 vector add runtime | performance、distributed behavior |
| GEMM / FFN | [GEMM / FFN](../examples/pto/gemm-ffn.md) | matmul/FFN、tiling、double buffering、FFN tensor-parallel partial | complete model or remote runtime |
| softmax / attention | [Softmax / Attention](../examples/pto/softmax-attention.md) | reduction、normalization、Flash/Paged Attention、TensorMap/ring runtime | end-to-end LLM serving |
| complete model | [Complete Models](../examples/pto/complete-models.md) | PyPTO `llama_mini` complete non-distributed decoder graph | distributed partitioning/execution |
| distributed runtime | [Distributed Runtime](../examples/pto/distributed-runtime.md) | `simpler` L3 allreduce/FFN TP、PTO-ISA allgather async、PyPTO hierarchy tests | remote multi-host control plane |
| missing examples | [Missing Roadmap](../examples/pto/missing-roadmap.md) | complete distributed NN、remote L3、collective API 等缺口 | current implemented capability |

## Cross-Repository Rule

同一个数学或 runtime 概念在不同仓库出现时，先判断证据层级。Add 在 PyPTO 中证明 `@pl.program` / `InCore` / `Orchestration` 可以表达 elementwise compute；在 PTO-ISA 中证明 tile/kernel/operator packaging；在 `simpler` 中证明 L2 `ChipWorker` 可以启动 callable、处理 tensor buffers、copy back 并验证 golden。把这三层合在一起可以形成学习闭环，但不能把任意一层的证据升级成另一层的实现状态。

FFN 和 attention 也是同样规则。PyPTO FFN/attention 证明 model block expression；PTO-ISA GEMM/Flash Attention 证明 kernel implementation direction；`simpler` FFN TP/paged-attention runtime 证明 runtime dependency 和 data-plane partial。complete distributed NN 只有在 model graph、partitioning、PyPTO lowering、`simpler` execution、PTO-ISA kernels/communication 和 validation 同时出现时，才能从 `TODO` 升级。

下面三段 code-shaped evidence 展示为什么同一个 “add/matmul/FFN” 不能混成一个 status：

```python
# PyPTO: expression
tile_c = pl.add(tile_a, tile_b)
return pl.store(tile_c, [0, 0], c)
```

```cpp
// PTO-ISA: kernel instruction sequence
TLOAD(aMatTile[cur], gmA);
TMOV(aTile[cur], aMatTile[cur]);
TMATMUL_ACC(cTile, cTile, aTile[cur], bTile[cur]);
TSTORE(dstGlobal, cTile);
```

```python
# simpler: runtime scheduling
args.add_tensor(make_tensor_arg(host_partial[i]), TensorArgType.INPUT)
orch.submit_next_level(allreduce_sum_cc, args, cfg, worker=i)
```

第一段证明 language expression；第二段证明 kernel instruction semantics；第三段证明 runtime task submission 和 TensorMap dependency surface。一个合格 example chapter 必须像这样告诉 reader “source code 长什么样” 和 “这段 code 证明哪一层”。

## What To Remember

Example pages are not a coverage matrix. A qualified example chapter must teach the concept, name concrete source paths and commands, label run status, explain proof/non-proof boundaries, and show the next page in the learning ladder. 证据 ledger 仍是 [Examples Feature Map Evidence](../evidence/examples-feature-map.md)。
