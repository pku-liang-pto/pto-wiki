---
title: "PTO Hello / Elementwise Examples"
type: topic
status: draft
sources:
  - repositories/pypto/examples/hello_world.py
  - repositories/pypto/examples/kernels/01_elementwise.py
  - repositories/pto-isa/demos/baseline/add
  - repositories/simpler/examples/workers/l2/hello_worker
  - repositories/simpler/examples/workers/l2/vector_add
  - wiki/evidence/examples-feature-map.md
last_updated: 2026-05-05
---

# PTO Hello / Elementwise Examples

这一章是 PTO stack 的最小闭环。一个 add-like 示例在三个仓库里分别回答三个问题：PyPTO 说明用户如何表达计算，PTO-ISA 说明 tile kernel/operator 如何写，simpler 说明 runtime 如何把 callable 和 tensor buffers 交给 chip worker。

## How To Read This Page

先读 PyPTO hello，确认 `InCore` 和 `Orchestration` 的分工；再读 PTO-ISA add，理解 lower-level kernel/operator packaging；最后读 simpler L2 vector add，把表达和 kernel 放进真实 runtime lifecycle。

```text
PyPTO hello
  -> PTO-ISA add
  -> simpler L2 vector add
```

## PyPTO Hello

`repositories/pypto/examples/hello_world.py` 是最小语言示例。它定义一个 `@pl.program`，里面有 `InCore` tile function 和 `Orchestration` function。`InCore` 用 `pl.load` 把 global tensor 读成 tile，用 `pl.add` 做 elementwise compute，再用 `pl.store` 写回 output。`Orchestration` 负责调用这个 kernel。

这个例子的价值在于它把 PyPTO 的两层函数边界暴露得最清楚。`InCore` 不是普通 Python helper，而是将来会进入 tile/kernel lowering 的 compute body；`Orchestration` 不是 kernel，而是描述 kernel call 和 tensor flow 的外层 program logic。后续 matmul、attention、LLaMA mini 都保留这个分工，只是 body 更复杂。

最小源码如下：

```python
@pl.program
class HelloWorldProgram:
    @pl.function(type=pl.FunctionType.InCore)
    def tile_add(self, a, b, c):
        tile_a = pl.load(a, [0, 0], [128, 128])
        tile_b = pl.load(b, [0, 0], [128, 128])
        tile_c = pl.add(tile_a, tile_b)
        return pl.store(tile_c, [0, 0], c)

    @pl.function(type=pl.FunctionType.Orchestration)
    def orchestrator(self, a, b, out_c):
        return self.tile_add(a, b, out_c)
```

这段代码让 reader 不需要打开仓库也能看见 PyPTO source shape。`tile_add` 的 body 是 load/compute/store；`orchestrator` 只做 kernel call。后续所有更复杂示例都可以回到这个基本 split：kernel body 解释 tile work，orchestration body 解释 program graph。

Run surface（本轮 wiki pass 未本地执行这些命令；状态来自 source/README inspection，证据见 [Examples Feature Map Evidence](../../evidence/examples-feature-map.md#claim-map)）：

| Cwd | Entry | Hardware | Expected signal | Run status | Caveat |
| --- | --- | --- | --- | --- | --- |
| `repositories/pypto/` | `python examples/hello_world.py` | no | 输出 `HelloWorldProgram.as_python()`，能看到 load/add/store 和 orchestration call | `not-run`; source-inspected | 证明 DSL/IR print path，不证明 hardware execution |

## PTO-ISA Add

`repositories/pto-isa/demos/baseline/add` 把 add 降到 tile/kernel/operator packaging 层。这里要看的不是 Python DSL，而是 kernel source、host-side operator registration、wheel build/install 和 Python test。它证明 PTO-ISA 可以把一个简单 tile operation 包成 NPU/PyTorch custom operator。

读 PTO-ISA add 时，可以把它和 PyPTO hello 的 `pl.load/add/store` 对齐：PyPTO 让用户用 DSL 表达同样的 load/compute/store 意图；PTO-ISA 展示这些意图在 C++ tile library、operator wrapper 和 `torch_npu` integration 中怎样出现。它不负责解释 `Worker(level=2)` 如何启动。

Run surface：

| Cwd | Entry | Hardware | Expected signal | Run status | Caveat |
| --- | --- | --- | --- | --- | --- |
| `repositories/pto-isa/demos/baseline/add/` | `export ASCEND_HOME_PATH=/usr/local/Ascend/ && source /usr/local/Ascend/ascend-toolkit/set_env.sh && export PTO_LIB_PATH=[YOUR_PATH]/pto-isa && python3 setup.py bdist_wheel && pip install dist/*.whl && cd test && python3 test.py` | Ascend NPU + CANN + `torch_npu` | wheel builds/installs，`test.py` 通过 `torch_npu` custom op | `not-run`; README-inspected | 依赖 target SoC in `CMakeLists.txt`、CANN、`ASCEND_HOME_PATH`、`PTO_LIB_PATH` |

## simpler L2 Hello And Vector Add

`repositories/simpler/examples/workers/l2/hello_worker` 是 runtime lifecycle smoke test：construct `Worker(level=2)`，`init()`，`malloc/free`，然后 close。它不验证 kernel logic，只验证 runtime plumbing。

`repositories/simpler/examples/workers/l2/vector_add` 是最小完整 L2 run：host 编译或加载 AIV kernel，创建 `ChipCallable`，构造 `TaskArgs`，拷贝 input buffers 到 device，运行 worker，copy-back output，再和 numpy golden 比较。

这两个例子合起来回答 runtime 层的基础问题。`hello_worker` 先证明 worker lifecycle 不是概念名，而是有 init/memory/close contract；`vector_add` 再把 callable、tensor buffers、device copy、kernel execution 和 golden validation 接起来。它们比 L3 allreduce 更适合做第一条 runtime 学习路径，因为没有 rank/window 和 communication 干扰。

runtime 侧的实现形状可以从 `simpler` 的 public API 读成这样：

```python
worker = Worker(level=2, platform="a2a3sim", device_id=0,
                runtime="tensormap_and_ringbuffer")
worker.init()
worker.run(chip_callable, chip_args, CallConfig())
worker.close()
```

这说明 `simpler` example 的核心对象不是 `@pl.program`，而是 `Worker`、`ChipCallable`、`TaskArgs` 和 `CallConfig`。PyPTO hello 证明 expression；PTO-ISA add 证明 kernel/operator；`simpler` L2 vector add 证明 runtime launch lifecycle。

Run surface：

| Cwd | Entry | Hardware | Expected signal | Run status | Caveat |
| --- | --- | --- | --- | --- | --- |
| `repositories/simpler/` | `python examples/workers/l2/hello_worker/main.py -p a2a3sim -d 0` | no NPU for sim | init、malloc/free、close 完成 | `not-run`; README-inspected | 依赖 runtime binaries/build cache |
| `repositories/simpler/` | `python examples/workers/l2/vector_add/main.py -p a2a3sim -d 0` | no NPU for sim | max error 和 golden check pass | `not-run`; README-inspected | first run may clone PTO-ISA headers into build cache; signature/order mismatch 会先暴露 runtime/API 问题 |

## What This Example Family Proves

- PyPTO hello proves language expression and normal program structure.
- PTO-ISA add proves low-level tile/operator packaging.
- simpler vector add proves L2 runtime launch/copy-back lifecycle.

它们合在一起构成最小 mental model，但仍然不证明 distributed behavior。

## What To Read Next

下一步读 [GEMM / FFN](./gemm-ffn.md)。GEMM 会把同样的 expression/kernel/runtime 分层带入 tiling、pipeline 和 model block；FFN TP 会第一次把这个分层放进 L3 multi-chip runtime。

## What To Remember

Add-like examples 是最小闭环，不是玩具附录。它们让读者先学会区分 expression、kernel semantics 和 runtime launch。后续任何 distributed claim 都应该能回到这个三层分工解释清楚。
