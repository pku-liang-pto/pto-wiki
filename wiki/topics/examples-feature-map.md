---
title: "Examples Feature Map"
type: topic
status: draft
sources:
  - repositories/simpler/examples/
  - repositories/pto-isa/demos/
  - repositories/pypto/tests/st/distributed/
last_updated: 2026-05-04
---

# Examples Feature Map

本页用代表性示例说明 PTO Runtime、PTO-ISA 和 PyPTO 的能力边界。它不是完整示例索引；只记录能帮助理解本轮分布式文档主题的示例。

## 阅读顺序

1. 先读 `pto-isa` 的 compute demo，理解 tile/kernel 层。
2. 再读 `simpler` L3 examples，理解 runtime 如何调度 chip task 和 SubWorker。
3. 最后读 `pypto` distributed tests，理解 Python DSL/codegen 如何把 hierarchy program 交给 runtime。

## 示例矩阵

| 示例 | 仓库 | 主要特性 | 状态 | 应读页面 |
| --- | --- | --- | --- | --- |
| `demos/baseline/gemm_basic` | pto-isa | fixed GEMM、tiling、pipeline sync、PyTorch extension | `implemented` | [pto-isa](../repositories/pto-isa.md) |
| `demos/baseline/allgather_async` | pto-isa | SDMA/URMA `TPUT_ASYNC/TGET_ASYNC` allgather | `implemented` | [pto-isa](../repositories/pto-isa.md) |
| `examples/workers/l3/multi_chip_dispatch` | simpler | L3 host orchestrator dispatch multi chip + SubWorker | `implemented` | [simpler](../repositories/simpler.md) |
| `examples/workers/l3/allreduce_distributed` | simpler | HCCL window scratch、kernel 内 4-phase allreduce | `implemented` | [Distributed Execution](./distributed-execution.md) |
| `examples/workers/l3/ffn_tp_parallel` | simpler | two-stage DAG、TensorMap producer/consumer、cross-rank sum | `implemented` | [Distributed Execution](./distributed-execution.md) |
| `tests/st/distributed/test_l3_distributed.py` | pypto | HOST Orchestrator -> CHIP worker -> HOST SubWorker | `implemented` | [pypto](../repositories/pypto.md) |
| `tests/st/distributed/test_l3_parallel_reduce.py` | pypto | 两个 chip callables + SubWorker reduce | `emerging` | [pypto](../repositories/pypto.md) |

## 能力映射

| 能力 | 最小证据 | 说明 |
| --- | --- | --- |
| Tile compute | `pto-isa/demos/baseline/gemm_basic` | PTO-ISA 可表达 tile shape、GM/L1/L0 数据、pipeline sync |
| Kernel-side communication | `pto-isa/demos/baseline/allgather_async` | SDMA/URMA async communication primitive 已有 demo |
| Host-level DAG | `simpler/examples/workers/l3/README.md` | L3 Orchestrator 通过 `submit_next_level`/`submit_sub` 提交任务 |
| HCCL window data plane | `simpler/examples/workers/l3/allreduce_distributed/main.py` | window scratch 在 chip bootstrap 后分配；kernel 内使用 |
| TensorMap dependency | `simpler/examples/workers/l3/ffn_tp_parallel/main.py` | 相同 `buffer.addr` 让 stage1 output 与 stage2 input 自动成边 |
| Python DSL hierarchy | `pypto/tests/st/distributed/test_l3_distributed.py` | PyPTO 可表达 HOST/CHIP/SubWorker，并执行 L3 program |

## 不应误读

- `allreduce_distributed` 是 hardware-only two-chip demo，不证明 remote multi-host runtime 已完成。
- `allgather_async` 证明 PTO-ISA kernel communication primitive，不证明 PyPTO 已有高级 collective API。
- `test_l3_parallel_reduce.py` 被 skip，因此只能作为 `emerging` 证据。
