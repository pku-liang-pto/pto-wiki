---
title: "PTO GEMM / FFN Examples"
type: topic
status: draft
sources:
  - repositories/pypto/examples/kernels/03_matmul.py
  - repositories/pypto/examples/models/01_ffn.py
  - repositories/pto-isa/demos/baseline/gemm_basic
  - repositories/simpler/examples/workers/l3/ffn_tp_parallel
  - wiki/evidence/examples-feature-map.md
last_updated: 2026-05-05
---

# PTO GEMM / FFN Examples

GEMM / FFN 是从 correctness 进入 performance 和 partitioning 的第一组示例。PyPTO 表达 matmul/FFN，PTO-ISA 展示 tile shape、GM/L1/L0 movement、pipeline 和 double buffering，simpler FFN tensor parallel 把 FFN stage 放进 L3 multi-chip runtime。

## How To Read This Page

先确认 matmul 是 transformer FFN 的核心 building block，再看 PTO-ISA 如何把 matmul 切成 hardware-shaped work，最后读 simpler FFN TP：tensor parallelism 是 FFN 加上 partitioned tensors、rank/window communication 和 TensorMap dependency。

```text
matmul expression
  -> tiled GEMM kernel
  -> FFN block
  -> tensor-parallel FFN runtime
```

## PyPTO Matmul And FFN

`repositories/pypto/examples/kernels/03_matmul.py` 展示 PyPTO 如何表达 matmul / matmulacc 类 kernel。`repositories/pypto/examples/models/01_ffn.py` 把 matmul、activation 和第二个 matmul 组合成 transformer FFN building block。

FFN 是读 LLM 示例的第一块积木。一个简化 transformer FFN 可以理解为两次 linear projection，中间接 activation/gating；底层最重的计算是 GEMM。PyPTO 这里主要证明 model block 可以用 DSL 组织出来，而不是证明 kernel 已经达到某个性能目标。

Run surface（本轮 wiki pass 未本地执行这些命令；状态来自 source/README inspection）：

| Cwd | Entry | Hardware | Expected signal | Run status | Caveat |
| --- | --- | --- | --- | --- | --- |
| `repositories/pypto/` | `python examples/kernels/03_matmul.py` | no for source/print path | generated program text shows matmul-shaped ops | `not-run`; source-inspected | 不证明 PTO-ISA kernel performance |
| `repositories/pypto/` | `python examples/models/01_ffn.py` | no for source/print path | generated model/function representation | `not-run`; source-inspected | 不证明 L3 tensor parallel runtime |

## PTO-ISA GEMM

`repositories/pto-isa/demos/baseline/gemm_basic/README.md` 是 performance-oriented example。它固定 GEMM shape `[512,2048] x [2048,1536]`，把 output work 分给 24 cores 的 `4 x 6` grouping，再沿 K dimension 切成 `baseK=64` blocks。读这个示例时重点看 tiling、per-core split、GM 到 L1/L0 的 data movement，以及 pipeline/double buffering，而不是只看结果是否正确。

GEMM 是理解 PTO-ISA 价值的关键例子。一个 naive matrix multiply 只说明数学关系；PTO-ISA GEMM 说明同样的数学关系如何被切成 tile、分给 cores、把数据从 GM 移到更近的 memory，再用 pipeline/double buffering 尝试隐藏 load/store 成本。这个章节应让读者明白“kernel optimization”发生在 PyPTO model 之下、`simpler` runtime 之内核之外。

Run surface：

| Cwd | Entry | Hardware | Expected signal | Run status | Caveat |
| --- | --- | --- | --- | --- | --- |
| `repositories/pto-isa/demos/baseline/gemm_basic/` | `export ASCEND_HOME_PATH=/usr/local/Ascend/ && source ${ASCEND_INSTALL_PATH}/bin/setenv.bash && export PTO_LIB_PATH=[YOUR_PATH]/pto-isa && python3 setup.py bdist_wheel && pip install dist/*.whl && cd test && python3 test.py` | A2/A3 NPU path | wheel builds，`test.py` passes | `not-run`; README-inspected | 依赖 CANN、`torch_npu`、PTO Tile Lib path 和 target SoC |

## simpler FFN Tensor Parallel

`repositories/simpler/examples/workers/l3/ffn_tp_parallel` 是 FFN 在 runtime 层的 distributed partial example。Stage 1 用 AIC matmul 产生 partial output，Stage 2 用 AIV reduce / communication 合并跨 rank 结果。TensorMap 通过相同 tensor address 识别 producer/consumer dependency。

这个例子把 FFN 从单 kernel 变成 runtime graph。它的重点不是再解释 matmul，而是解释 partitioned work 如何进入 L3：每个 stage 产生或消费 tensor，TensorMap 依据 tensor address 自动连接 producer/consumer，rank/window support 让跨 device 数据路径可用。它是 distributed partial example，因为它覆盖 FFN stage 的 tensor parallel runtime，但还没有把完整 model graph、PyPTO lowering 和 validation 合成一个 complete distributed NN。

Run surface：

| Cwd | Entry | Hardware | Expected signal | Run status | Caveat |
| --- | --- | --- | --- | --- | --- |
| `repositories/simpler/` | `python examples/workers/l3/ffn_tp_parallel/main.py -d 0-1` | two A2/A3 devices | logs show kernel compile, HCCL bootstrap, two-stage DAG, per-chip max error, and `all ranks matched golden` | `not-run`; source-inspected | 证明 single-host L3 data plane，不证明 remote multi-host DistWorker |
| `repositories/simpler/` | `pytest examples/workers/l3/ffn_tp_parallel/test_ffn_tp_parallel.py --platform a2a3 --device 0-1` | two A2/A3 devices | pytest hardware ST calls `run()` and asserts return code `0` | `not-run`; source-inspected | exact device option follows simpler pytest config; requires hardware marker support |

## What This Example Family Proves

GEMM / FFN 证明三层关系：PyPTO 能表达 model block，PTO-ISA 能实现 performance kernel，simpler 能把 partitioned model stage 放进 multi-chip runtime。它仍然不是 complete distributed NN，因为完整 model graph、partitioning policy、PyPTO lowering、runtime execution 和 validation 还没有在一个 vertical slice 中闭合。

## What To Read Next

读完 GEMM / FFN 后，继续读 [Softmax / Attention](./softmax-attention.md)，因为 attention 会把 GEMM、reduction、softmax 和 memory behavior 组合起来。然后读 [Complete Models](./complete-models.md)，看 FFN 如何成为 LLaMA-style decoder 的一个 stage。

## What To Remember

GEMM 是 kernel/performance foundation；FFN 是 model block；FFN tensor parallel 是 runtime/distributed partial。不要把 PTO-ISA GEMM performance example、PyPTO FFN expression、`simpler` FFN TP runtime example 混成同一个 status。
