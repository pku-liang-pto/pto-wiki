---
title: "Example Run Surfaces"
type: topic
status: draft
sources:
  - repositories/simpler/examples/
  - repositories/pto-isa/demos/
  - repositories/pypto/examples/
  - wiki/evidence/examples-feature-map.md
last_updated: 2026-05-05
---

# Example Run Surfaces

同一个“示例存在”可以代表不同证明强度。source-only PyPTO 脚本能证明 DSL/lowering 形态；simulator simpler 示例能证明 runtime plumbing；hardware communication 示例能证明多 device data-plane；它们都不能单独证明 remote multi-host runtime。

## 环境层级

```text
read source
  -> run Python/IR print
  -> run simulator
  -> run one Ascend device
  -> run multi-device communication
```

| Surface | 是否需要硬件 | 典型前提 | 能证明 | 不能证明 |
| --- | --- | --- | --- | --- |
| Source-only PyPTO | no | Python 能 import PyPTO | DSL、IR、program shape | device runtime scheduling |
| simpler simulator | no NPU | `simpler` 安装、runtime binaries/build cache | L2/L3 lifecycle、TaskArgs、TensorMap shape | CANN/HCCL hardware behavior |
| PTO-ISA CPU/sim path | no NPU for CPU path | demo-specific build deps | tile/kernel semantics | `torch_npu` operator behavior |
| Single NPU | yes | CANN、device access、runtime binaries | AICPU/AICore launch、copy-back | multi-rank communication |
| Multi NPU | yes | CANN/HCCL、MPI where needed、device pool | allreduce/allgather、rank/window | remote multi-host DistWorker |

## 入口命令

这些命令来自源码、README 或测试标记；本 wiki pass 没有在本机运行它们。

| 目标 | 入口 | Expected signal | Caveat |
| --- | --- | --- | --- |
| PyPTO hello | `python examples/hello_world.py` | 输出 program representation，能看到 `InCore` load/compute/store | 不证明 hardware execution |
| PyPTO attention | `python examples/models/03_flash_attention.py` | program 中出现 block-wise attention state | 不证明 runtime scheduling |
| simpler L2 lifecycle | `python examples/workers/l2/hello_worker/main.py -p a2a3sim -d 0` | init、malloc/free、close 完成 | 依赖 runtime binaries |
| simpler L2 vector add | `python examples/workers/l2/vector_add/main.py -p a2a3sim -d 0` | max error 和 golden check pass | signature/order mismatch 会先暴露 runtime/API 问题 |
| PTO-ISA add | `./run.sh` 或 README build/install/test sequence | wheel build/install，`test.py` 通过 `torch_npu` | 依赖 CANN、`ASCEND_HOME_PATH`、`PTO_LIB_PATH` |
| PTO-ISA allgather async | `./run.sh 2 Ascend950PR_9599` | ranks report pass | 证明 kernel comm primitive，不证明 PyPTO collective API |
| simpler L3 allreduce / FFN TP | pytest examples with `requires_hardware`, `device_count(2)` | two-device hardware test pass | 证明 single-host L3 data-plane，不证明 remote host control plane |

## 读失败信号

示例失败时先判断失败层级，不要立刻归因到 distributed runtime。

- import / parser / generated representation 失败：先看 PyPTO DSL、IR、pass pipeline。
- wheel build / `torch_npu` op 失败：先看 PTO-ISA demo build、CANN env、SoC target。
- worker init / malloc / close 失败：先看 simpler runtime binary、device/platform、lifecycle cleanup。
- golden mismatch：再看 kernel semantics、tensor shape、argument order、copy-back。
- multi-rank hang 或 mismatch：再看 rank/window bootstrap、HCCL data-plane、kernel communication primitive。
