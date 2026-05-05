---
title: "pto-isa"
type: repo-profile
status: draft
sources:
  - repositories/pto-isa/
  - repositories/pto-isa/README.md
  - repositories/pto-isa/include/pto/README.md
  - repositories/pto-isa/demos/README.md
  - wiki/materials/pto-runtime-distributed/
last_updated: 2026-05-05
---

# pto-isa

`pto-isa` 是 PTO Tile Library 和 virtual ISA 仓库。先把它理解成 tile-oriented operator/kernel library：它提供 public headers、tile type system、compute/data-movement instructions、CPU simulation、NPU implementations、tests、demos 和性能样例。Communication ISA 是后续扩展层，不是这个仓库的唯一入口。

本页基于 `repositories/pto-isa` commit `a977dd1161222a8b779fb5ff5d1c8b7f4518c3a2`。

## How To Read This Page

先把 `pto-isa` 当成 kernel/tile instruction layer，而不是 distributed runtime。阅读顺序是 tile programming basics、non-distributed demos、communication ISA、再读与 `simpler` / PyPTO 的边界。这样可以避免把一个 communication primitive 误读成 PyPTO high-level collective 或 remote worker control plane。

## Repo 直觉

`pto-isa` 不是 runtime orchestrator；它是 kernel 作者、compiler backend 和 operator demo 共同依赖的 instruction/interface layer。README 将 PTO 定位为 Ascend CANN 定义的 tile-oriented virtual ISA，并强调 90+ standard tile instructions、cross-generation abstraction、CPU simulator、Auto/Manual dual-mode workflow、tile shape/mask/event/pipeline modeling。

最基础的阅读路径应该从非分布式开始：

```text
include/pto/pto-inst.hpp
  -> common Tile/Shape/Stride/GlobalTensor infrastructure
  -> CPU simulation stubs or NPU implementation by SoC
  -> simple add/GEMM/flash-attention demos
  -> communication extension only after compute/data movement model is clear
```

## Tile Programming 基础

`include/pto/README.md` 说明 `include/pto/` 是 public header entry：`common/` 放 platform-independent Tile 和 instruction infrastructure，`cpu/` 放 CPU simulation/debug support，`npu/` 按 SoC 拆 A2/A3/A5 implementation，`comm/` 放 communication instruction library。

`include/pto/common/pto_tile.hpp` 中的 `Shape`、`Stride`、`Tile`、`GlobalTensor` 等类型是普通 compute kernel 的基础。非分布式 operator 通常先用这些类型表达 GM tensor、on-chip tile、layout 和 stride，再用 `TLOAD`、`TSTORE`、`TADD`、`TMATMUL` 等指令表达数据搬运和计算。

可以把一个 PTO-ISA operator 想成下面的结构：

```text
host/operator wrapper
  -> declare PyTorch/custom-op interface
  -> build and launch kernel artifact
kernel body
  -> describe global tensor and tile shape
  -> TLOAD GM data into on-chip tile
  -> compute with tile instructions
  -> TSTORE result back to GM
test script
  -> compare device result with PyTorch/numpy golden output
```

这说明 PTO-ISA 的核心价值不只是“有一组头文件”。它把 kernel 作者需要处理的 memory space、tile shape、mask、pipeline、event 和 SoC-specific backend 包在一个虚拟 ISA 里，让同一类 kernel pattern 可以在 CPU simulation、A2/A3、A5 等环境中有对应实现。

## 非分布式示例路径

| 示例 | 说明 | 状态 |
| --- | --- | --- |
| `demos/baseline/add` | PTO kernel 封装为 `torch_npu` 自定义 PyTorch operator；host 侧用 `TORCH_LIBRARY`/`TORCH_LIBRARY_IMPL` 注册 schema 和实现 | `implemented` |
| `demos/baseline/gemm_basic` | 固定尺寸 GEMM，展示 tiling、per-core split、double buffering、pipeline sync | `implemented` |
| `demos/baseline/flash_atten` | NPU baseline Flash Attention custom operator | `implemented` |
| `demos/cpu/gemm_demo` / `flash_attention_demo` | CPU simulation demos，用于先验证算法和 instruction semantics | `implemented` |
| `kernels/manual/*` | hand-tuned NPU kernels 和性能案例 | `implemented` |

## 主要结构

| 区域 | 作用 | 状态 |
| --- | --- | --- |
| `include/pto/` | public PTO tile/ISA headers | `implemented` |
| `include/pto/common/` | Tile、Shape、Stride、instruction infrastructure | `implemented` |
| `include/pto/cpu/` | CPU simulation/debug support | `implemented` |
| `include/pto/npu/` | SoC-specific NPU implementations for A2/A3/A5 | `implemented` |
| `demos/baseline/` | PyTorch operator examples with CMake/wheel packaging | `implemented` |
| `demos/cpu/` | cross-platform CPU simulation demos | `implemented` |
| `kernels/manual/` | hand-optimized operator implementations | `implemented` |
| `include/pto/comm/` | communication ISA public API and implementations | `implemented` |
| `include/pto/comm/async_common/` | SDMA/URMA async session type abstraction | `implemented` |
| `tests/npu/*/comm/st/testcase/` | NPU communication ST for A2/A3 and A5 | `implemented` |

## Communication ISA

在普通 tile compute model 之上，`include/pto/comm/README.md` 把通信指令分为 point-to-point、collective、async 和 backend-specific path。重点 API 包括 `TPUT`、`TGET`、`TNOTIFY`、`TWAIT`、`TTEST`，以及 async path 的 `AsyncSession`、`AsyncEvent`。`async_types.hpp` 中可以看到 SDMA 与 URMA session/context 的并列结构和 engine-agnostic `AsyncSession`。

Communication ISA 应读作“kernel 内可以表达跨 rank / remote memory / async event 的 primitive”。它不自动等价于 PyPTO 有高层 `pl.all_reduce` API，也不自动等价于 simpler 已经有 remote worker control plane。PTO-ISA 证明的是 kernel/data movement primitive；编译器 API 和 runtime lifecycle 需要分别由 PyPTO 与 simpler 的证据证明。

状态判断：

- `implemented`: A2/A3 SDMA communication testcases，A5 communication testcases，`TWAIT/TNOTIFY` 同步测试，SDMA/URMA async type。
- `design-intended`: PyPTO orchestration-level collective API 直接或间接映射到 PTO-ISA communication primitive；当前证据主要在 PyPTO issue 和 simpler examples。

## 代表性示例

| 示例 | 说明 | 读法 |
| --- | --- | --- |
| `demos/baseline/add` | custom PTO kernel + PyTorch operator registration + wheel build/test | first non-distributed operator 示例 |
| `demos/baseline/gemm_basic` | 固定尺寸 `[512, 2048] x [2048, 1536]` GEMM，说明 tile shape、per-core split、double buffering 和 pipeline sync | compute ISA 示例 |
| `kernels/manual/common/flash_atten` | hand-tuned Flash Attention operator | complex compute/performance 示例 |
| `demos/baseline/allgather_async` | A2/A3 用 SDMA `TPUT_ASYNC/TGET_ASYNC`，A5 用 URMA `TPUT_ASYNC/TGET_ASYNC`，MPI rank 映射 device | communication ISA 示例 |
| `tests/npu/a5/comm/st/testcase/twait/twait_kernel.cpp` | `TNOTIFY` remote signal 与 `TWAIT` local wait；多 rank atomic add/threshold wait | synchronization primitive 示例 |

## Try First

| Goal | Command / action | Expected signal | Common blocker |
| --- | --- | --- | --- |
| custom operator baseline | follow `demos/baseline/add/README.md` or run `./run.sh` in that directory | wheel builds, installs, and `test/test.py` passes | CANN, `torch_npu`, `PTO_LIB_PATH`, target SoC |
| GEMM optimization reading | inspect `demos/baseline/gemm_basic/README.md` and `test/test.py` | can explain fixed shapes, per-core split, double buffering | hardware/software stack unavailable for run |
| communication primitive demo | `./run.sh 2 Ascend950PR_9599` in `demos/baseline/allgather_async` | allgather demos pass for ranks | CANN Toolkit/Ops, MPICH, enough NPU devices |

## 与 simpler 的关系

`simpler` 的 L3 hardware examples 会通过 `simpler_setup.pto_isa.ensure_pto_isa_root()` 获取 PTO-ISA root，再用 `KernelCompiler.compile_incore()` 编译 AIC/AIV kernel。也就是说，PTO-ISA 是 kernel-level target；simpler 是运行和调度这些 kernel 的 runtime。

在 allreduce/FFN 示例中，cross-rank communication 的 host/chip window 来自 simpler/HCCL bootstrap，kernel 内的 load/store/sync/comm 由 PTO-ISA API 表达。这个分工应保持清楚。

## 与 PyPTO 的关系

PyPTO 负责 Python DSL、IR、pass 和 codegen。它生成或调用的低层 kernel 最终需要落到 PTO-ISA 或相关 C++ runtime API。`pto-isa` README 的 roadmap 包含 collective communication extension 和 system scheduling extension；这与 PyPTO 的 distributed collectives 议题方向一致，但目前不能把 roadmap 写成 PyPTO 已实现 API。

## Evidence-Based Interpretation

本页把 `pto-isa` 解释为 kernel/ISA foundation，而不是 runtime orchestrator。证据来自 README、`include/pto/README.md`、baseline add/GEMM/Flash Attention demos、CPU demos、`include/pto/comm/README.md` 和 allgather async demo。通信 primitive 是 distributed execution 的必要支撑，但它只证明 kernel/rank/data movement 能力；worker lifecycle、DAG scheduling、remote callable registry 仍属于 runtime/PyPTO/simpler 组合需要证明的层面。

## 未决问题

- PyPTO `pl.all_reduce` 等 orchestration-level collective 会直接发 PTO-ISA collective，还是先走 simpler runtime/HCCL window？
- A5 URMA path 与 remote L3/RoCE blueprint 的关系还需要后续实现证明。
- PTO-ISA roadmap 中 system scheduling extension 与 simpler scheduler 的边界尚未从源码中确认。
