---
title: "PTO Distributed Runtime Examples"
type: topic
status: draft
sources:
  - repositories/simpler/examples/workers/l3/
  - repositories/pto-isa/demos/baseline/allgather_async
  - repositories/pypto/tests/st/distributed/
  - wiki/evidence/examples-feature-map.md
  - wiki/evidence/distributed-execution.md
last_updated: 2026-05-05
---

# PTO Distributed Runtime Examples

这一章只讨论当前可验证的 distributed examples。结论必须保守：single-host L3 multi-chip examples 和 kernel communication demos 是 `implemented`；remote L3、DistWorker、cross-host callable registry 仍是 `design-intended`。

## How To Read This Page

先把 distributed runtime 拆成三类证据：simpler 证明 runtime data-plane 和 L3 scheduling，PTO-ISA 证明 kernel communication primitive，PyPTO 证明 hierarchy-aware expression/codegen/runner integration。三类证据合起来指向 distributed direction，但不能互相替代。

```text
simpler L3 runtime
  + PTO-ISA communication primitive
  + PyPTO hierarchy lowering
  != remote multi-host runtime
```

## simpler L3 Allreduce

`repositories/simpler/examples/workers/l3/allreduce_distributed` 是当前 multi-chip data-plane 示例。它通过 `Worker(level=3)` 管理 chip children，rank/window setup 暴露 communication memory，kernel 内完成 cross-rank sum。

Run surface:

| Entry | Hardware | Expected signal | Caveat |
| --- | --- | --- | --- |
| L3 hardware pytest/example path | two A2/A3 devices | all ranks / pytest pass | 证明 single-host multi-chip data-plane，不证明 remote control plane |

## simpler FFN Tensor Parallel

`repositories/simpler/examples/workers/l3/ffn_tp_parallel` 同时属于 [GEMM / FFN](./gemm-ffn.md) 和 distributed runtime。它把 FFN stage 放到 L3 runtime 中，展示 TensorMap 如何用 tensor address 建 producer/consumer dependency。

Run surface:

| Entry | Hardware | Expected signal | Caveat |
| --- | --- | --- | --- |
| `device_count(2)` L3 example/test | two A2/A3 devices | two-stage FFN TP validates output | 没有证明 complete model graph 或 remote workers |

## PTO-ISA Allgather Async

`repositories/pto-isa/demos/baseline/allgather_async` 证明 kernel/data movement primitive 方向。它可以与 simpler allreduce 对照：PTO-ISA 负责 primitive，simpler 负责 runtime bootstrap、rank/window 和 task scheduling。

Run surface:

| Entry | Hardware | Expected signal | Caveat |
| --- | --- | --- | --- |
| `./run.sh`, `./run.sh 4`, `./run.sh 2 Ascend950PR_9599` | multi NPU + CANN/MPICH | ranks report pass | 不证明 PyPTO orchestration-level collective API |

## PyPTO Hierarchy Tests

`repositories/pypto/tests/st/distributed/test_l3_distributed.py` 证明 PyPTO 可以表达 hierarchy program，并通过 distributed runner/codegen 接到 `simpler.Worker(level=3)`。Skipped 或 partial tests 只能作为 `emerging` / `design-intended` evidence。

Run surface:

| Entry | Hardware | Expected signal | Caveat |
| --- | --- | --- | --- |
| distributed ST tests under PyPTO | depends on selected path | hierarchy-aware generated/runtime path is exercised | skipped tests do not upgrade behavior to `implemented` |

## What Not To Infer

- HCCL/window data plane is not PTO Runtime control plane.
- PTO-ISA allgather primitive is not PyPTO `pl.all_reduce`.
- `Worker(level=3)` on one host is not remote DistWorker.
- FFN TP is not complete distributed NN.
