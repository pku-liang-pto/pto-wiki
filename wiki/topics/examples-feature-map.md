---
title: "Examples Feature Map"
type: topic
status: draft
sources:
  - repositories/simpler/examples/
  - repositories/pto-isa/demos/
  - repositories/pypto/examples/
  - repositories/pypto/tests/st/distributed/
  - wiki/evidence/examples-feature-map.md
last_updated: 2026-05-04
---

# Examples Feature Map

本页把 PTO Runtime、PTO-ISA 和 PyPTO 的代表性例子排成 beginner-to-expert 学习路径。它同时覆盖非分布式和分布式例子，并把相似例子放在一起比较。示例选择、状态标签和缺口记录在 [Examples Feature Map Evidence](../evidence/examples-feature-map.md)。

## LLM Intuition Before Examples

先用一个小型 LLM 推理链路理解例子在做什么：

```text
tokens
  -> embedding / hidden states
  -> matmul projections: Q, K, V, FFN
  -> attention: score = Q @ K^T, softmax, output = P @ V
  -> normalization / activation / residual
  -> LM head logits
```

这些概念落到本仓库集合时，对应关系是：

| LLM concept | Kernel / runtime concept | Example family |
| --- | --- | --- |
| elementwise activation / residual | vector tile ops, load/add/store | PyPTO kernels, PTO-ISA add |
| projection / FFN | GEMM, tiling, pipeline, double buffering | PTO-ISA GEMM, PyPTO FFN, simpler FFN TP |
| attention score | QK matmul and softmax prepare | PyPTO Flash Attention / Paged Attention |
| KV cache | block table, paged memory, dynamic valid shape | PyPTO paged attention, simpler paged attention |
| tensor parallel / allreduce | multi-chip rank/window, cross-rank sum | simpler allreduce, FFN TP |
| complete NN | multiple kernels chained into model flow | PyPTO `llama_mini`; distributed complete NN is TODO |

## Beginner-To-Expert Path

| Level | Example | Repository | What it teaches | Status |
| --- | --- | --- | --- | --- |
| 0. Hello | `examples/hello_world.py` | PyPTO | `@pl.program`, `InCore`, `Orchestration`, `pl.load/add/store` | `implemented` |
| 1. Scalar/vector kernel | `examples/kernels/01_elementwise.py`; `demos/baseline/add` | PyPTO / PTO-ISA | same basic add-like idea in Python DSL vs PTO kernel/operator package | `implemented` |
| 2. GEMM | `examples/kernels/03_matmul.py`; `demos/baseline/gemm_basic` | PyPTO / PTO-ISA | matmul API, tile movement, pipeline/double-buffering optimization | `implemented` |
| 3. Softmax/norm | `examples/kernels/06_softmax.py`; `07_normalization.py` | PyPTO | vector reductions used by attention and transformer layers | `implemented` |
| 4. Single-chip runtime | `examples/workers/l2/vector_add` | simpler | `ChipWorker`, `TaskArgs`, kernel compile/load/run/copy-back | `implemented` |
| 5. Production runtime | `examples/a2a3/tensormap_and_ringbuffer/paged_attention` | simpler | TensorMap, ring buffers, AIC/AIV DAG, flow-control-oriented runtime | `implemented` |
| 6. Attention model | `examples/models/03_flash_attention.py`; `04_paged_attention.py` | PyPTO | online softmax, QK/PV pipeline, KV cache block access | `implemented` |
| 7. Complete NN baseline | `examples/models/08_llama_mini.py` | PyPTO | simplified LLaMA-style decoder layer, RMSNorm, QKV, RoPE, MLP, LM head | `implemented` |
| 8. Multi-chip runtime | `examples/workers/l3/allreduce_distributed`; `ffn_tp_parallel` | simpler | HCCL window scratch, TensorMap stage dependency, cross-rank sum | `implemented` |
| 9. PyPTO hierarchy | `tests/st/distributed/test_l3_distributed.py` | PyPTO | HOST/CHIP/SubWorker DSL compiled to simpler L3 runner | `implemented` |
| 10. Complete distributed NN | design target: distributed LLaMA/FFN/attention vertical slice | PyPTO + simpler + PTO-ISA | model-level graph + distributed runtime + kernel-level optimization | `TODO` / `design-intended` |

## Common Example Families

| Family | PyPTO example | PTO-ISA example | simpler example | Comparison |
| --- | --- | --- | --- | --- |
| Add / elementwise | `examples/hello_world.py`, `01_elementwise.py` | `demos/baseline/add` | `workers/l2/vector_add` | PyPTO shows DSL; PTO-ISA shows kernel/operator packaging; simpler shows device launch. |
| GEMM / FFN | `03_matmul.py`, `models/01_ffn.py` | `demos/baseline/gemm_basic` | `workers/l3/ffn_tp_parallel` | Moves from one-kernel matmul to two-stage tensor-parallel FFN with cross-rank sum. |
| Attention | `models/03_flash_attention.py`, `04_paged_attention.py` | `demos/baseline/flash_atten` | `a2a3/.../paged_attention` | Shows algorithm in PyPTO, optimized PTO kernel baseline, then runtime DAG/TensorMap execution. |
| Communication | distributed tests issue path | `demos/baseline/allgather_async` | `workers/l3/allreduce_distributed` | PTO-ISA proves kernel comm primitive; simpler proves HCCL-window data plane; PyPTO collectives remain design-intended. |
| Complete model | `models/08_llama_mini.py` | none as complete model | none as complete distributed model | Current complete NN baseline is PyPTO non-distributed; distributed complete NN remains TODO. |

## Run Surface And Caveats

本轮 wiki pass 读取了示例源码、README 和测试标记，但没有在本机执行这些示例。原因是重要路径跨越 Ascend CANN、`torch_npu`、sim/runtime build cache、MPI/HCCL 或多 NPU hardware。下表记录的是源码或 README 中可见的 entrypoint、环境前提和阅读 caveat，避免把“可读源码证据”误写成“本轮已运行验证”。

| Example | Documented entrypoint | Environment assumption | Local run in this pass | Caveat |
| --- | --- | --- | --- | --- |
| PyPTO hello | `python examples/hello_world.py` | PyPTO Python package importable；该脚本打印 `HelloWorldProgram.as_python()` | not run | 证明 DSL/IR print path，不证明 hardware execution。 |
| PyPTO kernel examples | `python examples/kernels/06_softmax.py` and sibling kernel scripts | PyPTO Python environment；README 也给出 `python examples/kernels/06_softmax.py` | not run | 多数 kernel scripts 打印 generated program；system/runtime execution 另见 `tests/st`。 |
| PyPTO FFN / Flash Attention | `python examples/models/01_ffn.py`; `python examples/models/03_flash_attention.py` | PyPTO Python environment；Flash Attention 示例在 docstring 中记录 run command | not run | 主要说明 model-level DSL/control-flow/online softmax。 |
| PyPTO Paged Attention | `python examples/models/04_paged_attention.py` | `torch`/runtime stack、Ascend platform config、`RunConfig(platform="a2a3", device_id=11, ...)` in source | not run | 该脚本包含 golden validation，但需要对应设备和 runtime 环境。 |
| PyPTO Paged Attention SPMD | `python examples/models/09_paged_attention_spmd.py -p <platform> -d <device>` style parser path | platform/device CLI、Ascend backend chosen from platform prefix | not run | SPMD variant is an implemented non-remote runtime example, not remote L3 proof. |
| PyPTO LLaMA mini | import/use `build_llama_mini_program()` from `examples/models/08_llama_mini.py` | PyPTO DSL environment；file defines a parameterized program builder | not run | It is the complete NN expression baseline; no `__main__` run command is present in inspected file. |
| PTO-ISA add | `./run.sh` or README build/install/test sequence ending in `cd test && python3 test.py` | CANN, `torch_npu`, `ASCEND_HOME_PATH`, `PTO_LIB_PATH`, target `SOC_VERSION` | not run | Demonstrates custom PyTorch operator packaging around a PTO kernel. |
| PTO-ISA GEMM | README sequence: build wheel, install `dist/*.whl`, then `cd test && python3 test.py` | A2/A3, CANN, `torch_npu`, PTO Tile Lib path | not run | Fixed-shape `[512,2048] x [2048,1536]` GEMM with tiling/pipeline detail. |
| PTO-ISA allgather async | `./run.sh`, `./run.sh 4`, `./run.sh 2 Ascend950PR_9599` | CANN Toolkit/Ops >= 9.0.0, MPICH, enough NPU devices/ranks | not run | Proves communication primitive demos; does not prove PyPTO collective API. |
| simpler L2 hello | `python examples/workers/l2/hello_worker/main.py -p a2a3sim -d 0` | installed `simpler`, built runtime binaries; sim variants do not need NPU | not run | Lifecycle-only: `Worker.init()`, malloc/free, close. |
| simpler L2 vector add | `python examples/workers/l2/vector_add/main.py -p a2a3sim -d 0` | sim or hardware platform, runtime binaries, PTO-ISA headers auto-cloned on first run | not run | Smallest full L2 Worker API example with compile/load/run/copy-back. |
| simpler production paged attention | `SceneTestCase.run_module(__name__)` / pytest scene-test path | CANN/runtime build cache and selected platform/device | not run | Shows `tensormap_and_ringbuffer` DAG behavior; not a beginner path. |
| simpler L3 allreduce / FFN TP | pytest examples with `requires_hardware`, `platforms(["a2a3"])`, `device_count(2)` | two A2/A3 NPU devices, HCCL/window bootstrap, hardware runtime | not run | Proves single-host multi-chip data-plane behavior, not remote multi-host control plane. |

## Optimization Techniques To Notice

| Technique | Where to see it | Why it matters |
| --- | --- | --- |
| Tiling and memory-space movement | PTO-ISA GEMM, PyPTO matmul kernels | turns tensor ops into hardware-shaped tile movement and compute |
| pipeline / double buffering | PTO-ISA GEMM and Flash Attention examples | overlaps movement and compute for throughput |
| online softmax | PyPTO Flash Attention / Paged Attention | avoids materializing full attention state and supports block-wise KV processing |
| TensorMap dependency discovery | simpler `ffn_tp_parallel`, paged attention runtime | avoids explicit manual edges when producer/consumer tensors share addresses |
| ring-buffer task/output storage | simpler `tensormap_and_ringbuffer` examples | supports streaming tasks and production-oriented flow control |
| HCCL window scratch | simpler `allreduce_distributed` | provides device-visible cross-rank data plane without making HCCL the runtime control plane |

## Missing Example Roadmap

| Missing example | Intended coverage | Status |
| --- | --- | --- |
| Complete distributed NN | PyPTO complete model graph + simpler L3/L4 execution + PTO-ISA optimized kernels + cross-rank collectives | `TODO` |
| PyPTO orchestration-level collective example | `pl.all_reduce` / `all_gather` style API lowered to runtime/kernel support | `design-intended` |
| Remote L3 example | HostWorker -> DistWorker -> remote chip workers with persistent run loop | `design-intended` |
| Maintainer golden path | one command sequence that runs hello, L2 vector add, paged attention, L3 allreduce, and LLaMA mini | `TODO` |

## What Not To Infer

- `llama_mini` proves PyPTO can express a compact complete NN, but not that distributed complete NN execution is implemented.
- `allgather_async` proves PTO-ISA kernel communication primitive, not PyPTO orchestration-level collective API.
- `allreduce_distributed` and `ffn_tp_parallel` prove current single-host/multi-chip distributed data-plane behavior, not remote multi-host runtime.
- `test_l3_parallel_reduce.py` is skipped, so it remains `emerging`.
