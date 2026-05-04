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

本页把 PTO Runtime、PTO-ISA 和 PyPTO 的代表性例子排成 beginner-to-expert 学习路径。它同时覆盖非分布式和分布式例子，并把相似例子放在一起比较。示例选择、状态标签和缺口记录在 [Examples Feature Map Evidence](../evidence/examples-feature-map.md)；`implemented` 表示源码/文档/测试中存在对应例子，不表示本 wiki pass 已本地运行，运行状态见 [Run Surface And Caveats](#run-surface-and-caveats)。

本页不是示例索引表。它把例子当作学习材料：先解释例子背后的算法和 runtime 概念，再说明同一个概念如何在 PyPTO、PTO-ISA 和 simpler 中以不同层次出现。外部路径用于审计；主要知识应能在本页读懂。

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

从代码角度看，LLM inference 是一串 tensor transformation。Embedding 把 token id 变成 hidden vector；Q/K/V projection 用 GEMM 把 hidden vector 拆成 attention 输入；attention 用 `Q @ K^T` 计算 token 间相关性，用 softmax 变成概率，再用 `P @ V` 合成上下文；FFN 用两到三个 GEMM 和 activation 扩展/压回 hidden dimension；normalization、residual、RoPE、KV cache 让长序列推理稳定且高效。完整 NN 只是把这些 building blocks 连接成多层 decoder。

PTO 系统把这条链路拆成三种学习对象：

- PyPTO examples 说明“如何表达计算”：Python DSL、tile kernels、model-level control flow、attention/FFN/LLaMA mini。
- PTO-ISA examples 说明“一个 kernel 如何变成 hardware-shaped operator”：tile shape、GM/on-chip movement、pipeline、custom PyTorch operator packaging。
- simpler examples 说明“runtime 如何把 kernel 和 task graph 跑起来”：L2 launch、TensorMap dependency、ring-buffer queues、L3 rank/window communication。

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

学习顺序从一个 tile add 开始，而不是从 distributed runtime 开始。原因是 distributed FFN、allreduce 或 future distributed NN 都复用了同一套基础：tensor 被切成 tile，tile kernel 被编译为 device code，runtime 把 task 和 tensor address 交给 chip worker，scheduler 再根据 dependency 决定执行顺序。

这条路径中有三次“层级提升”：

```text
single kernel
  -> multiple kernels in one model block
  -> runtime task graph on one chip
  -> multi-chip task graph with communication
  -> complete distributed model (not implemented yet)
```

| Level | Example | Repository | Prerequisite concepts | What it teaches | Status |
| --- | --- | --- | --- | --- | --- |
| 0. Hello | `examples/hello_world.py` | PyPTO | `@pl.program`, Tensor, Tile | `InCore`, `Orchestration`, `pl.load/add/store` | `implemented` |
| 1. Scalar/vector kernel | `examples/kernels/01_elementwise.py`; `demos/baseline/add` | PyPTO / PTO-ISA | Tile, GM, `TLOAD/TSTORE` | same basic add-like idea in Python DSL vs PTO kernel/operator package | `implemented` |
| 2. GEMM | `examples/kernels/03_matmul.py`; `demos/baseline/gemm_basic` | PyPTO / PTO-ISA | Tile shape, L1/L0, pipeline | matmul API, tile movement, pipeline/double-buffering optimization | `implemented` |
| 3. Softmax/norm | `examples/kernels/06_softmax.py`; `07_normalization.py` | PyPTO | row reduction, tensor/tile lowering | vector reductions used by attention and transformer layers | `implemented` |
| 4. Single-chip runtime | `examples/workers/l2/vector_add` | simpler | `ChipWorker`, `TaskArgs`, `ChipCallable` | kernel compile/load/run/copy-back | `implemented` |
| 5. Production runtime | `examples/a2a3/tensormap_and_ringbuffer/paged_attention` | simpler | TensorMap, ring buffer, AIC/AIV | AIC/AIV DAG and flow-control-oriented runtime | `implemented` |
| 6. Attention model | `examples/models/03_flash_attention.py`; `04_paged_attention.py` | PyPTO | GEMM, softmax, KV cache | online softmax, QK/PV pipeline, KV cache block access | `implemented` |
| 7. Complete NN baseline | `examples/models/08_llama_mini.py` | PyPTO | RMSNorm, RoPE, FFN, LM head | simplified LLaMA-style decoder layer | `implemented` |
| 8. Multi-chip runtime | `examples/workers/l3/allreduce_distributed`; `ffn_tp_parallel` | simpler | rank, comm window, HCCL data plane | cross-rank sum and TensorMap stage dependency | `implemented` |
| 9. PyPTO hierarchy | `tests/st/distributed/test_l3_distributed.py` | PyPTO | HOST/CHIP/SubWorker roles | hierarchy DSL compiled to simpler L3 runner | `implemented` |
| 10. Complete distributed NN | design target: distributed LLaMA/FFN/attention vertical slice | PyPTO + simpler + PTO-ISA | all prior concepts | model-level graph + distributed runtime + kernel-level optimization | `TODO` / `design-intended` |

## Environment Matrix

Examples in this target set do not all mean the same thing by “run.” A source-only PyPTO example can teach DSL/lowering without proving device execution. A simulator `simpler` example can prove runtime plumbing without NPU hardware. A hardware communication example can prove rank/window data-plane behavior without proving remote multi-host control plane.

| Surface | Hardware needed | Typical prerequisites | Good for | Not enough for |
| --- | --- | --- | --- | --- |
| Source-only PyPTO print | no | importable PyPTO Python environment | DSL, IR, function structure, generated program printout | runtime scheduling or hardware validation |
| `simpler` simulator | no NPU | installed `simpler`, built sim runtime binaries, Linux host for L3 fork paths | L2/L3 runtime lifecycle, task args, TensorMap shape, golden checks on sim | CANN/HCCL hardware behavior |
| PTO-ISA CPU/simulation demos | no NPU for CPU path | PTO-ISA build deps and demo-specific setup | tile/kernel semantics without Ascend hardware | `torch_npu` operator behavior |
| Single NPU hardware | yes, one Ascend device | CANN, `ASCEND_HOME_PATH`, device access, runtime binaries | actual device launch, AICPU/AICore path, copy-back | multi-rank communication |
| Multi-NPU hardware | yes, multiple Ascend devices | CANN/HCCL, device pool, MPI where demo requires it | allreduce/allgather, rank/window, tensor-parallel examples | remote multi-host DistWorker |

## Wiki-Only Mini Walkthroughs

These walkthroughs are deliberately prose-first. The command or path is an audit anchor; the learning target is the shape of the example.

### PyPTO Hello

`repositories/pypto/examples/hello_world.py` is the smallest language example. A reader should see one `@pl.program`, one `InCore` function, and one `Orchestration` function. The `InCore` side loads input tensors into tiles, applies an elementwise op, and stores the output. The `Orchestration` side creates or wires tensors and calls the kernel. Done means the script can print the generated Python/IR representation; it does not prove hardware execution. A safe edit is changing shape or replacing an elementwise op, then confirming the generated representation still has the expected load/compute/store structure.

### simpler L2 Hello And Vector Add

`examples/workers/l2/hello_worker` is the runtime smoke test: construct `Worker(level=2)`, call `init()`, do `malloc/free`, and close in `finally`. Expected output reports init, malloc/free round trip, and close completion. If this fails, the problem is likely environment, runtime binary lookup, device setup, or lifecycle cleanup before any kernel logic is involved.

`examples/workers/l2/vector_add` is the smallest full L2 run. It compiles one AIV kernel, wraps it into a `CoreCallable`, wraps orchestration plus child kernel into a `ChipCallable`, allocates device buffers, copies two 128x128 float32 inputs, builds `ChipStorageTaskArgs`, runs the worker, copies output back, and compares against numpy. Expected output includes a max error line and a golden-check pass line. Safe edits are changing the vector shape, adding a scalar argument, or changing the elementwise operation, while preserving signature/order agreement between `ChipCallable` and `TaskArgs`.

### PTO-ISA Add And GEMM

PTO-ISA `demos/baseline/add` teaches custom operator packaging: kernel source, host-side PyTorch registration, wheel build, install, and Python test. The success signal is that the wheel builds/installs and `test.py` passes through `torch_npu`.

PTO-ISA `demos/baseline/gemm_basic` teaches performance structure. It fixes GEMM shapes `[512,2048] x [2048,1536]`, splits work across 24 cores as `4 x 6`, then further tiles K into blocks of 64. The important concept is not only matmul correctness; it is how GM/L1/L0 movement, per-core work partitioning, and double buffering become an operator implementation.

### PyPTO LLaMA Mini

`examples/models/08_llama_mini.py` is the current complete NN expression baseline. It is a simplified single-head LLaMA-style decoder with default `seq_len=16`, `head_dim=64`, and `vocab_size=64`. Its flow is:

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

Safe edits are changing `seq_len` or `vocab_size`, while preserving the source constraint that `head_dim` must be divisible by 16 for the K-tiled transpose matmul. This example proves PyPTO can express a compact full-model flow; it does not prove distributed execution of that model.

### simpler L3 Allreduce And FFN TP

The current multi-chip examples are single-host L3 examples. They use `Worker(level=3)` to manage chip children and optionally Python SubWorkers, with TensorMap and rank/window setup handling dependencies and communication. Allreduce proves a rank/window data-plane path; FFN tensor parallel proves a staged model block where producer/consumer relationship can be discovered from tensor addresses. Expected success is a hardware pytest/example pass on two A2/A3 devices. These examples do not prove remote multi-host lifecycle, DistWorker discovery, or cross-host callable registry.

## Examples-First Command Lanes

This is a practical ladder for readers who learn by running or inspecting examples. Commands are source-documented and were not executed in this wiki pass unless explicitly noted.

| Lane | First command or action | Requires hardware | Expected output / done signal | Next modification |
| --- | --- | --- | --- | --- |
| Source-only PyPTO print | `python examples/hello_world.py` in `repositories/pypto` | no | generated program text shows `InCore` load/compute/store and orchestration call structure | change tensor shape or replace `pl.add`; confirm generated representation changes only where expected |
| Source-only PyPTO model | `python examples/models/03_flash_attention.py` | no | generated function/program representation contains block-wise attention state such as running max/sum | inspect loop-carried state and online softmax updates |
| Simulator simpler L2 hello | `python examples/workers/l2/hello_worker/main.py -p a2a3sim -d 0` in `repositories/simpler` | no NPU, but runtime binaries/build cache needed | output reports init, malloc/free round trip, and close completion | intentionally break platform/runtime name to learn environment failure shape |
| Simulator simpler L2 vector add | `python examples/workers/l2/vector_add/main.py -p a2a3sim -d 0` in `repositories/simpler` | no NPU, but runtime binaries/build cache needed | output reports max error and golden check passed | change vector shape or add another tensor input while keeping signature/order aligned |
| Single-device PTO-ISA | `./run.sh` or README build/test sequence in `repositories/pto-isa/demos/baseline/add` | yes for NPU path | wheel builds, installs, and `test.py` passes through `torch_npu` | replace add kernel with another elementwise operator |
| Multi-device communication | `./run.sh 2 Ascend950PR_9599` in `repositories/pto-isa/demos/baseline/allgather_async` or pytest simpler L3 examples | yes, multi-device + MPI/HCCL | all ranks report pass / pytest passes | compare kernel primitive allgather with simpler L3 allreduce data-plane behavior |
| Substitute expert exercise | read `pypto/examples/models/08_llama_mini.py` beside `simpler/examples/workers/l3/ffn_tp_parallel` | no for reading | identify which model stages would need partitioning, rank/window, collective, and TensorMap support | write an acceptance checklist for the missing complete distributed NN vertical slice |

## Common Example Families

The same idea appears differently at each layer. This is useful because it prevents category mistakes. A PyPTO example may show syntax and lowering without proving runtime scheduling. A PTO-ISA demo may prove a kernel primitive without proving PyPTO API support. A simpler example may prove execution on chips without proving that PyPTO can generate the same graph automatically.

| Family | PyPTO example | PTO-ISA example | simpler example | Comparison |
| --- | --- | --- | --- | --- |
| Add / elementwise | `examples/hello_world.py`, `01_elementwise.py` | `demos/baseline/add` | `workers/l2/vector_add` | PyPTO shows DSL; PTO-ISA shows kernel/operator packaging; simpler shows device launch. |
| GEMM / FFN | `03_matmul.py`, `models/01_ffn.py` | `demos/baseline/gemm_basic` | `workers/l3/ffn_tp_parallel` | Moves from one-kernel matmul to two-stage tensor-parallel FFN with cross-rank sum. |
| Attention | `models/03_flash_attention.py`, `04_paged_attention.py` | `demos/baseline/flash_atten` | `a2a3/.../paged_attention` | Shows algorithm in PyPTO, optimized PTO kernel baseline, then runtime DAG/TensorMap execution. |
| Communication | distributed tests issue path | `demos/baseline/allgather_async` | `workers/l3/allreduce_distributed` | PTO-ISA proves kernel comm primitive; simpler proves HCCL-window data plane; PyPTO collectives remain design-intended. |
| Complete model | `models/08_llama_mini.py` | none as complete model | none as complete distributed model | Current complete NN baseline is PyPTO non-distributed; distributed complete NN remains TODO. |

## Three Cross-Repo Example Stories

### Add / Elementwise

The add family is the smallest complete mental model. In PyPTO, `hello_world.py` shows a program with an `InCore` tile function and an `Orchestration` function. The kernel loads two tensors into tiles, adds them, and stores the result. In PTO-ISA, `demos/baseline/add` shows what the lower-level custom operator package looks like: a C++ kernel/operator package, build script, wheel, and Python test. In simpler, `examples/workers/l2/vector_add` shows the runtime version: compile or load a callable, allocate/copy buffers, submit `TaskArgs`, run the chip worker, and copy the result back.

```text
PyPTO:     describe add in Python DSL
PTO-ISA:   express add as tile/kernel/operator code
simpler:   launch add as a runtime task on a chip
```

This family teaches the boundary between language, kernel, and runtime. If add fails in PyPTO printing, look at parser/IR/codegen. If the custom operator fails on NPU, look at PTO-ISA build/kernel details. If the callable cannot launch or copy back, look at simpler L2 runtime.

### GEMM / FFN

GEMM is the first example where performance structure matters. PyPTO matmul and FFN examples show the algorithmic structure: matrix multiply, activation, and another matrix multiply. PTO-ISA GEMM shows how the same idea becomes tile shapes, per-core work split, GM-to-tile movement, double buffering, and pipeline synchronization. simpler FFN tensor-parallel examples then place FFN stages into a multi-chip runtime setting: one stage computes partial outputs, another stage reduces or combines results across ranks.

The important learning point is that tensor parallelism is not a separate algorithm from FFN. It is FFN plus partitioned weights/activations plus runtime communication and dependency tracking.

### Attention / Paged Attention

Attention examples are the bridge from kernels to full model behavior. PyPTO Flash Attention and Paged Attention explain online softmax, loop-carried max/sum state, and block-based KV cache access. PTO-ISA Flash Attention baseline shows how a high-value kernel can be packaged and optimized. simpler paged-attention runtime examples show how a production runtime has to manage more than compute: task descriptors, output buffers, TensorMap producer/consumer relationships, and ring-buffer flow control.

The important learning point is that optimization is distributed across layers. PyPTO expresses the algorithm; PTO-ISA controls tile/memory behavior; simpler controls when tasks become runnable and how data dependencies are discovered.

## Run Surface And Caveats

本轮 wiki pass 读取了示例源码、README 和测试标记，但没有在本机执行这些示例。原因是重要路径跨越 Ascend CANN、`torch_npu`、sim/runtime build cache、MPI/HCCL 或多 NPU hardware。下表记录的是源码或 README 中可见的 entrypoint、环境前提和阅读 caveat，避免把“可读源码证据”误写成“本轮已运行验证”。

| Example | Documented entrypoint | Environment assumption | Local run in this pass | Caveat |
| --- | --- | --- | --- | --- |
| PyPTO hello | `python examples/hello_world.py` | PyPTO Python package importable；该脚本打印 `HelloWorldProgram.as_python()` | `not-run` | 证明 DSL/IR print path，不证明 hardware execution。 |
| PyPTO kernel examples | `python examples/kernels/06_softmax.py` and sibling kernel scripts | PyPTO Python environment；README 也给出 `python examples/kernels/06_softmax.py` | `not-run` | 多数 kernel scripts 打印 generated program；system/runtime execution 另见 `tests/st`。 |
| PyPTO FFN / Flash Attention | `python examples/models/01_ffn.py`; `python examples/models/03_flash_attention.py` | PyPTO Python environment；Flash Attention 示例在 docstring 中记录 run command | `not-run` | 主要说明 model-level DSL/control-flow/online softmax。 |
| PyPTO Paged Attention | `python examples/models/04_paged_attention.py` | `torch`/runtime stack、Ascend platform config、`RunConfig(platform="a2a3", device_id=11, ...)` in source | `not-run` | 该脚本包含 golden validation，但需要对应设备和 runtime 环境。 |
| PyPTO Paged Attention SPMD | `python examples/models/09_paged_attention_spmd.py -p <platform> -d <device>` style parser path | platform/device CLI、Ascend backend chosen from platform prefix | `not-run` | SPMD variant is an implemented non-remote runtime example, not remote L3 proof. |
| PyPTO LLaMA mini | import/use `build_llama_mini_program()` from `examples/models/08_llama_mini.py` | PyPTO DSL environment；file defines a parameterized program builder | `not-run` | It is the complete NN expression baseline; no `__main__` run command is present in inspected file. |
| PTO-ISA add | `./run.sh` or README build/install/test sequence ending in `cd test && python3 test.py` | CANN, `torch_npu`, `ASCEND_HOME_PATH`, `PTO_LIB_PATH`, target `SOC_VERSION` | `not-run` | Demonstrates custom PyTorch operator packaging around a PTO kernel. |
| PTO-ISA GEMM | README sequence: build wheel, install `dist/*.whl`, then `cd test && python3 test.py` | A2/A3, CANN, `torch_npu`, PTO Tile Lib path | `not-run` | Fixed-shape `[512,2048] x [2048,1536]` GEMM with tiling/pipeline detail. |
| PTO-ISA allgather async | `./run.sh`, `./run.sh 4`, `./run.sh 2 Ascend950PR_9599` | CANN Toolkit/Ops >= 9.0.0, MPICH, enough NPU devices/ranks | `not-run` | Proves communication primitive demos; does not prove PyPTO collective API. |
| simpler L2 hello | `python examples/workers/l2/hello_worker/main.py -p a2a3sim -d 0` | installed `simpler`, built runtime binaries; sim variants do not need NPU | `not-run` | Lifecycle-only: `Worker.init()`, malloc/free, close. |
| simpler L2 vector add | `python examples/workers/l2/vector_add/main.py -p a2a3sim -d 0` | sim or hardware platform, runtime binaries, PTO-ISA headers auto-cloned on first run | `not-run` | Smallest full L2 Worker API example with compile/load/run/copy-back. |
| simpler production paged attention | `SceneTestCase.run_module(__name__)` / pytest scene-test path | CANN/runtime build cache and selected platform/device | `not-run` | Shows `tensormap_and_ringbuffer` DAG behavior; not a beginner path. |
| simpler L3 allreduce / FFN TP | pytest examples with `requires_hardware`, `platforms(["a2a3"])`, `device_count(2)` | two A2/A3 NPU devices, HCCL/window bootstrap, hardware runtime | `not-run` | Proves single-host multi-chip data-plane behavior, not remote multi-host control plane. |

## Optimization Techniques To Notice

Optimization examples should be read as design patterns, not only as files. Tiling reduces a large tensor operation into hardware-sized chunks. Double buffering overlaps data movement and compute. Online softmax keeps attention numerically stable without materializing full score matrices. TensorMap removes manual edge wiring by deriving dependencies from tensor addresses. Ring buffers make repeated task submission possible without allocating an unbounded graph.

| Technique | Where to see it | Why it matters |
| --- | --- | --- |
| Tiling and memory-space movement | PTO-ISA GEMM, PyPTO matmul kernels | read after Tile/GM/L1/L0; look for GM -> tile -> compute -> store |
| pipeline / double buffering | PTO-ISA GEMM and Flash Attention examples | read after GEMM; look for staged load/compute/store overlap |
| online softmax | PyPTO Flash Attention / Paged Attention | read after softmax/norm; look for running max/sum and block-wise KV processing |
| TensorMap dependency discovery | simpler `ffn_tp_parallel`, paged attention runtime | read after `TaskArgs`; look for shared tensor address producer/consumer edges |
| ring-buffer task/output storage | simpler `tensormap_and_ringbuffer` examples | read after L2 runtime; look for task slots, output heap, and flow control |
| HCCL window scratch | simpler `allreduce_distributed` | read after `CommContext`; look for device-visible rank/window data plane without treating HCCL as control plane |

Actionable exercises:

| Technique | What to change | What should improve or reveal | What can break |
| --- | --- | --- | --- |
| Tiling | change GEMM tile/block shape in a local experiment | whether per-core work split still covers output shape | L0/L1 capacity, alignment, or shape constraints |
| Double buffering | compare a buffered and unbuffered GEMM/attention variant if both exist | overlap between data movement and compute | missing sync or stale tile data |
| Online softmax | change attention block size or inspect running max/sum state | numerical stability without full score matrix materialization | wrong normalization across blocks |
| TensorMap | add or change tensor tags in a simpler orchestration path | automatic producer/consumer edge wiring | missing dependency if a tensor is marked `NO_DEP` or output tag is wrong |
| Ring buffer / scope | add nested scope or more intermediate outputs | bounded reuse and lifetime behavior | slot exhaustion, premature release, or stale producer mapping |
| Rank/window communication | compare local allreduce and PTO-ISA allgather behavior | difference between runtime-level rank/window setup and kernel-level comm primitive | overclaiming PyPTO collectives or remote control plane |

## Missing Example Roadmap

The most important missing learning artifact is a complete distributed NN. The non-distributed side already has model-level examples such as LLaMA mini, and the distributed side already has partial communication/runtime examples such as allreduce and FFN tensor parallel. What is missing is one vertical slice that shows a model-level graph lowered through PyPTO, executed by simpler L3/L4-style runtime, and backed by PTO-ISA kernels/communication.

The design-intended shape is:

```text
PyPTO model graph
  -> partitioned FFN / attention stages
  -> hierarchy-aware codegen
  -> simpler L3 worker with chip workers and SubWorkers
  -> PTO-ISA kernels with communication primitives
  -> rank-local validation and cross-rank reduction where needed
```

| Missing example | Intended coverage | Status |
| --- | --- | --- |
| Complete distributed NN | PyPTO complete model graph + simpler L3/L4 execution + PTO-ISA optimized kernels + cross-rank collectives | `TODO` |
| PyPTO orchestration-level collective example | `pl.all_reduce` / `all_gather` style API lowered to runtime/kernel support | `design-intended` |
| Remote L3 example | HostWorker -> DistWorker -> remote chip workers with persistent run loop | `design-intended` |
| Maintainer golden path | one command sequence that runs hello, L2 vector add, paged attention, L3 allreduce, and LLaMA mini | `TODO` |
| CANN/HCCL bridge example | compare HCCL collective examples with PTO-ISA allgather and simpler allreduce | `TODO` |

A minimal complete distributed NN vertical slice should have these acceptance checks before the wiki upgrades it from `TODO`:

| Acceptance item | What must be visible |
| --- | --- |
| Model slice | a concrete LLaMA/FFN/attention-derived graph with documented shapes and golden output |
| Partitioning | rank-local tensor ownership and weight/activation split are explicit |
| PyPTO lowering | hierarchy-aware program generation or runtime-facing artifact is source-backed |
| simpler execution | `Worker(level=3)` or higher runs the graph through child workers rather than only printing code |
| PTO-ISA kernels | compute and communication primitives used by the slice are identified |
| Cross-rank validation | outputs are checked across ranks/devices, not only rank-local smoke tests |
| Status evidence | command/example/test/PR/source ref is recorded in the evidence ledger |

## What Not To Infer

- `llama_mini` proves PyPTO can express a compact complete NN, but not that distributed complete NN execution is implemented.
- `allgather_async` proves PTO-ISA kernel communication primitive, not PyPTO orchestration-level collective API.
- `allreduce_distributed` and `ffn_tp_parallel` prove current single-host/multi-chip distributed data-plane behavior, not remote multi-host runtime.
- `test_l3_parallel_reduce.py` is skipped, so it remains `emerging`.
