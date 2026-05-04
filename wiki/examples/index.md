---
title: "Examples"
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

# Examples

本区把 PyPTO、PTO-ISA 和 simpler 的代表性示例组织成公开学习路径。示例不是文件清单，而是理解系统边界的最短路线：PyPTO 解释“怎么表达计算”，PTO-ISA 解释“kernel 内怎么做 tile/memory/communication”，simpler 解释“runtime 怎么启动、调度、通信和回收任务”。

证据和状态标签见 [Examples Feature Map Evidence](../evidence/examples-feature-map.md)。`implemented` 表示源码、README、测试或 merged PR 中存在对应示例；本轮 wiki pass 未在本机运行硬件/仿真示例，运行 caveat 见 [运行环境](./run-surfaces.md)。

## 学习主线

先读非分布式示例，再读 distributed 示例。原因很简单：distributed FFN、allreduce 或未来 complete distributed NN，仍然依赖同一组基础动作。

```text
single tile kernel
  -> model block
  -> single-chip runtime task
  -> multi-chip runtime task
  -> complete distributed model
```

| 顺序 | 示例族 | 主要仓库 | 学到什么 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | hello / elementwise | PyPTO, PTO-ISA, simpler | DSL、tile load/add/store、L2 launch 的最小闭环 | `implemented` |
| 2 | GEMM / FFN | PyPTO, PTO-ISA, simpler | tiling、pipeline、double buffering、tensor parallel FFN | `implemented` |
| 3 | softmax / norm | PyPTO | reduction、normalization、attention 前置概念 | `implemented` |
| 4 | attention / paged attention | PyPTO, PTO-ISA, simpler | online softmax、KV cache、TensorMap/ring-buffer runtime | `implemented` |
| 5 | complete NN baseline | PyPTO | `llama_mini` 展示简化 LLaMA decoder flow | `implemented` |
| 6 | multi-chip runtime | simpler, PTO-ISA | rank/window、HCCL-backed data plane、allreduce/allgather | `implemented` |
| 7 | PyPTO hierarchy | PyPTO + simpler | hierarchy DSL/codegen 调用 `simpler.Worker(level=3)` | `implemented` / `emerging` |
| 8 | complete distributed NN | PyPTO + simpler + PTO-ISA | 模型级图、分区、collective、runtime validation 的完整闭环 | `TODO` |

## LLM 直觉

多数高级示例都可以放进一个小型 LLM inference 链路里理解：

```text
tokens
  -> hidden states
  -> Q/K/V projection
  -> attention score + softmax + value mix
  -> FFN / activation / residual
  -> LM head logits
```

PyPTO 的 model examples 负责表达这条 tensor transformation；PTO-ISA 的 GEMM、Flash Attention、allgather demos 负责展示 kernel/data movement 形态；simpler 的 L2/L3 examples 负责展示这些 kernel 如何变成 runtime task。读示例时不要把三层证据混为一谈：PyPTO 示例证明表达能力，PTO-ISA demo 证明 kernel primitive，simpler 示例证明 runtime launch/scheduling/data-plane。

## 推荐入口

- 第一次读：从 [跨仓库示例族](./cross-repo-families.md#add--elementwise) 的 add/elementwise 开始。
- 想跑命令：先看 [运行环境](./run-surfaces.md)，区分 source-only、simulator、single NPU、multi NPU。
- 想理解 distributed gap：看 [缺失路线图](./missing-roadmap.md)，尤其 complete distributed NN 的 acceptance checklist。

## 相关页面

- [Non-Distributed Execution](../topics/non-distributed-execution.md)
- [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md)
- [Distributed Execution](../topics/distributed-execution.md)
- [Basic Terms](../concepts/basic-terms.md)
