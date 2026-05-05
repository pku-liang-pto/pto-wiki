---
title: "PTO Softmax / Attention Examples"
type: topic
status: draft
sources:
  - repositories/pypto/examples/kernels/06_softmax.py
  - repositories/pypto/examples/kernels/07_normalization.py
  - repositories/pypto/examples/models/03_flash_attention.py
  - repositories/pypto/examples/models/04_paged_attention.py
  - repositories/pto-isa/demos/baseline/flash_atten
  - repositories/simpler/examples/a2a3/tensormap_and_ringbuffer/paged_attention
  - wiki/evidence/examples-feature-map.md
last_updated: 2026-05-05
---

# PTO Softmax / Attention Examples

Softmax / attention 是 kernel 到 model behavior 的桥。PyPTO 先表达 reduction、normalization、Flash Attention 和 Paged Attention；PTO-ISA 展示高价值 attention kernel 的 lower-level baseline；simpler paged-attention runtime 展示 TensorMap、ring buffer、AIC/AIV DAG 和 flow control。

## How To Read This Page

如果你还不熟悉 GEMM，先读 [GEMM / FFN](./gemm-ffn.md)。Attention 的核心不是一个单独 op，而是一组状态更新：QK matmul、mask/scale、softmax、PV matmul、KV cache block access，以及 runtime 对中间 buffers 的依赖追踪。

```text
softmax / norm
  -> flash attention
  -> paged attention / KV cache
  -> TensorMap + ring-buffer runtime
```

## PyPTO Softmax And Norm

`repositories/pypto/examples/kernels/06_softmax.py` 和 `07_normalization.py` 是 attention 前置基础。它们让读者看到 row reduction、max/sum、normalization 这类 vector/reduction pattern 如何进入 PyPTO program。

Softmax 不是只做 `exp` 和除法。稳定 softmax 通常先求 row max，再做 shifted exp，然后求 row sum，最后 normalize；normalization 也包含 reduction、scale 和 elementwise transform。这些 pattern 会在 attention 和 decoder block 中反复出现，所以先读它们能降低后面 Flash Attention 的理解成本。

Run surface（本轮 wiki pass 未本地执行这些命令；状态来自 source/README inspection）：

| Cwd | Entry | Hardware | Expected signal | Run status | Caveat |
| --- | --- | --- | --- | --- | --- |
| `repositories/pypto/` | `python examples/kernels/06_softmax.py` | no for source/print path | generated softmax program text | `not-run`; source-inspected | 不证明 attention runtime |
| `repositories/pypto/` | `python examples/kernels/07_normalization.py` | no for source/print path | generated normalization program text | `not-run`; source-inspected | 不证明 full model correctness |

## PyPTO Flash Attention And Paged Attention

`repositories/pypto/examples/models/03_flash_attention.py` 展示 online softmax 和 block-wise attention state。`04_paged_attention.py` 把 attention 接到 KV cache / block table / dynamic valid shape。它们主要证明 model-level DSL/control-flow 表达能力。

Flash Attention 的直觉是“不把完整 attention matrix 当作巨大中间结果存下来”。它用 block-wise processing 和 online softmax state 在保持数值正确性的同时减少 memory pressure。Paged Attention 再加入 KV cache block 管理：query 仍要和 key/value 交互，但 key/value 的物理存放会通过 block table 间接访问。这就是为什么它同时考验 compiler expression、kernel memory behavior 和 runtime buffer dependency。

Run surface：

| Cwd | Entry | Hardware | Expected signal | Run status | Caveat |
| --- | --- | --- | --- | --- | --- |
| `repositories/pypto/` | `python examples/models/03_flash_attention.py` | no for print path | function/program representation contains block-wise attention state | `not-run`; source-inspected | 不证明 hardware scheduling |
| `repositories/pypto/` | `python examples/models/04_paged_attention.py` | yes for configured runtime path | source defines `RunConfig(platform="a2a3", ...)` and golden validation path | `not-run`; source-inspected | 依赖 `torch`/runtime stack、Ascend platform config、A2/A3 device |

## PTO-ISA Flash Attention

`repositories/pto-isa/demos/baseline/flash_atten` 是 attention kernel 的 lower-level baseline。它应与 PyPTO attention 对照阅读：PyPTO 强调 algorithm expression，PTO-ISA 强调 tile/memory/pipeline implementation。

Run surface：

| Cwd | Entry | Hardware | Expected signal | Run status | Caveat |
| --- | --- | --- | --- | --- | --- |
| `repositories/pto-isa/demos/baseline/flash_atten/` | `export ASCEND_HOME_PATH=[ASCEND_PATH] && source [ASCEND_PATH]/latest/bin/setenv.bash && export PTO_LIB_PATH=[YOUR_PATH]/pto-isa && python3 setup.py bdist_wheel && pip install dist/*.whl --force-reinstall && cd test && python3 test.py` | A2/A3/A5 NPU path | custom op builds and verification script compares against golden reference | `not-run`; README-inspected | 证明 kernel/operator baseline，不证明 PyPTO lowering 或 simpler runtime |

## simpler Paged Attention Runtime

`repositories/simpler/examples/a2a3/tensormap_and_ringbuffer/paged_attention` 展示 production-oriented runtime shape：task descriptors 进入 ring，TensorMap 根据 tensor address 建 producer/consumer dependency，output heap 和 scopes 管理中间结果生命周期。

这个示例的阅读重点是 runtime 数据结构，而不是 attention 数学本身。Paged attention 会产生多个中间 tensor 和依赖关系；`tensormap_and_ringbuffer` runtime 让 task、dependency 和 output storage 被 bounded rings 管理，TensorMap 则把同一 tensor address 的 producer/consumer 自动连起来。读它可以理解为什么 `simpler` 的 docs 反复强调 Scope、Ring 和 TensorMap。

Run surface：

| Cwd | Entry | Hardware | Expected signal | Run status | Caveat |
| --- | --- | --- | --- | --- | --- |
| `repositories/simpler/` | `python examples/a2a3/tensormap_and_ringbuffer/paged_attention/test_paged_attention.py` or matching pytest scene-test path | depends on platform | `SceneTestCase.run_module(__name__)` drives scene test and golden comparison | `not-run`; source-inspected | 不适合作为 beginner first command；适合读 runtime DAG 和 flow control |

## What This Example Family Proves

Attention 示例证明 optimization 分布在三层：PyPTO 表达 algorithm，PTO-ISA 控制 tile/memory behavior，simpler 控制 task readiness、dependency discovery 和 buffer reuse。它不是 remote distributed proof。

## What To Read Next

读完本页后，继续读 [Complete Models](./complete-models.md)。Softmax、attention、KV cache 和 normalization 在 `llama_mini` 中会成为 decoder flow 的中间 stage；理解它们之后，complete model graph 才不只是一个长函数列表。

## What To Remember

Attention 的学习价值在于它同时触碰 algorithm expression、kernel memory pressure 和 runtime dependency management。PyPTO Flash/Paged Attention 证明表达能力，PTO-ISA Flash Attention 证明 kernel baseline，`simpler` paged-attention 证明 runtime flow-control shape；三者都不是 remote distributed runtime proof。
