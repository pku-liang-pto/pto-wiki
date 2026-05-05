---
title: "PTO Missing Example Roadmap"
type: topic
status: draft
sources:
  - wiki/evidence/examples-feature-map.md
  - wiki/evidence/distributed-execution.md
last_updated: 2026-05-05
---

# PTO Missing Example Roadmap

当前最重要的缺失示例是 complete distributed NN。已有证据覆盖两个端点：PyPTO 有 `llama_mini` 这样的 complete non-distributed model expression，simpler/PTO-ISA 有 allreduce、allgather、FFN tensor parallel 等 distributed partial examples。缺的是把它们连成一个 model-level vertical slice。

## How To Read This Page

把本页当作 status boundary。它不是 implementation plan，而是判断未来 example 何时能从 `TODO` / `design-intended` 升级到 `implemented` 的 checklist。

## 目标形态

```text
PyPTO model graph
  -> partitioned FFN / attention stages
  -> hierarchy-aware codegen
  -> simpler L3 worker with chip workers and SubWorkers
  -> PTO-ISA kernels and communication primitives
  -> rank-local validation and cross-rank reduction
```

## 缺失项

下面的表不是愿望清单，而是防止 wiki 过早升级状态的边界。每个 missing example 都需要自己的 source/test/example/PR evidence；不能因为相邻层已有实现，就把整条 vertical slice 写成 `implemented`。

| Missing example | Intended coverage | Status |
| --- | --- | --- |
| Complete distributed NN | PyPTO complete model graph + simpler L3/L4 execution + PTO-ISA optimized kernels + cross-rank collectives | `TODO` |
| PyPTO orchestration-level collective | `pl.all_reduce` / `all_gather` style API lowered to runtime/kernel support | `design-intended` |
| Remote L3 example | HostWorker -> DistWorker -> remote chip workers with persistent run loop | `design-intended` |
| Maintainer golden path | hello、L2 vector add、paged attention、L3 allreduce、LLaMA mini 的一条可执行路线 | `TODO` |
| CANN/HCCL bridge example | HCCL collective、PTO-ISA allgather、simpler allreduce 的对比 | `TODO` |

## Complete Distributed NN Acceptance Checklist

升级到 `implemented` 前，wiki 需要看到这些证据：

| Acceptance item | 必须可见的内容 |
| --- | --- |
| Model slice | 具体 LLaMA/FFN/attention-derived graph、shape、golden output |
| Partitioning | rank-local tensor ownership 和 weight/activation split |
| PyPTO lowering | hierarchy-aware generated program 或 runtime-facing artifact |
| Runtime execution | simpler L3/L4 worker run path、rank/window bootstrap、TaskArgs/TensorMap behavior |
| Kernel/data-plane | PTO-ISA kernel 或 communication primitive 的 source/test/example |
| Validation | rank-local 和 cross-rank validation output |
| Status evidence | command/example/test/PR/source ref 进入 evidence ledger |

## What Not To Infer

- 有 PTO-ISA communication primitive，不等于 PyPTO 已有高层 collective API。
- 有 HCCL window/data-plane，不等于 HCCL 负责 PTO runtime control plane。
- 有 `Worker(level=3)` single-host L3，不等于 remote DistWorker 已实现。
- 有 complete non-distributed NN，不等于 complete distributed NN 已实现。
