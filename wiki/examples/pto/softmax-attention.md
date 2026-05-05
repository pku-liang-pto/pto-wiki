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

Run surface:

| Entry | Hardware | Expected signal | Caveat |
| --- | --- | --- | --- |
| `python examples/kernels/06_softmax.py` | no for source/print path | generated softmax program text | 不证明 attention runtime |
| `python examples/kernels/07_normalization.py` | no for source/print path | generated normalization program text | 不证明 full model correctness |

## PyPTO Flash Attention And Paged Attention

`repositories/pypto/examples/models/03_flash_attention.py` 展示 online softmax 和 block-wise attention state。`04_paged_attention.py` 把 attention 接到 KV cache / block table / dynamic valid shape。它们主要证明 model-level DSL/control-flow 表达能力。

Run surface:

| Entry | Hardware | Expected signal | Caveat |
| --- | --- | --- | --- |
| `python examples/models/03_flash_attention.py` | no for print path | function/program representation contains block-wise attention state | 不证明 hardware scheduling |
| `python examples/models/04_paged_attention.py` | yes for configured runtime path | golden validation path in source | 依赖 `torch`/runtime stack、Ascend platform config、`RunConfig(platform=\"a2a3\", ...)` |

## PTO-ISA Flash Attention

`repositories/pto-isa/demos/baseline/flash_atten` 是 attention kernel 的 lower-level baseline。它应与 PyPTO attention 对照阅读：PyPTO 强调 algorithm expression，PTO-ISA 强调 tile/memory/pipeline implementation。

Run surface:

| Entry | Hardware | Expected signal | Caveat |
| --- | --- | --- | --- |
| demo README build/test path | NPU path | custom op / test path passes | 证明 kernel/operator baseline，不证明 PyPTO lowering 或 simpler runtime |

## simpler Paged Attention Runtime

`repositories/simpler/examples/a2a3/tensormap_and_ringbuffer/paged_attention` 展示 production-oriented runtime shape：task descriptors 进入 ring，TensorMap 根据 tensor address 建 producer/consumer dependency，output heap 和 scopes 管理中间结果生命周期。

Run surface:

| Entry | Hardware | Expected signal | Caveat |
| --- | --- | --- | --- |
| `SceneTestCase.run_module(__name__)` / pytest scene-test path | depends on platform | scene test / golden path passes | 不适合作为 beginner first command；适合读 runtime DAG 和 flow control |

## What This Example Family Proves

Attention 示例证明 optimization 分布在三层：PyPTO 表达 algorithm，PTO-ISA 控制 tile/memory behavior，simpler 控制 task readiness、dependency discovery 和 buffer reuse。它不是 remote distributed proof。
