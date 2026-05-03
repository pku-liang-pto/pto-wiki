---
title: "pto-isa"
type: repo-profile
status: draft
sources:
  - repositories/pto-isa/
  - materials/pto-runtime-distributed/
last_updated: 2026-05-04
---

# pto-isa

`pto-isa` 是 PTO Tile Library 和 virtual ISA 仓库。它提供 tile-oriented programming 的 C++ API、CPU/NPU 后端、基础 compute 指令以及 communication extension。本轮关注它如何支撑 PyPTO 代码生成和 simpler runtime 中 kernel 侧通信。

本页基于 `repositories/pto-isa` commit `a977dd1161222a8b779fb5ff5d1c8b7f4518c3a2`。

## Repo 直觉

`pto-isa` 不是 runtime orchestrator；它更接近“kernel 作者和 compiler target 共同使用的 tile/comm 指令层”。runtime 负责 worker、scheduler、window bootstrap 和 host/chip lifecycle；PTO-ISA 负责在 kernel 内表达 `TLOAD/TSTORE/TADD`、`TPUT/TGET/TNOTIFY/TWAIT/TTEST`、async session、collective 或 point-to-point communication。

## 主要结构

| 区域 | 作用 | 状态 |
| --- | --- | --- |
| `include/pto/` | public PTO tile/ISA headers | `implemented` |
| `include/pto/comm/` | communication ISA public API and implementations | `implemented` |
| `include/pto/comm/async_common/` | SDMA/URMA async session type abstraction | `implemented` |
| `tests/npu/*/comm/st/testcase/` | NPU communication ST for A2/A3 and A5 | `implemented` |
| `demos/baseline/gemm_basic` | fixed-size GEMM operator and PyTorch extension demo | `implemented` |
| `demos/baseline/allgather_async` | SDMA/URMA async allgather demo | `implemented` |

## Communication ISA

`include/pto/comm/README.md` 把通信指令分为 point-to-point、collective、async 和 backend-specific path。重点 API 包括 `TPUT`、`TGET`、`TNOTIFY`、`TWAIT`、`TTEST`，以及 async path 的 `AsyncSession`、`AsyncEvent`。`async_types.hpp` 中可以看到 SDMA 与 URMA session/context 的并列结构和 engine-agnostic `AsyncSession`。

状态判断：

- `implemented`: A2/A3 SDMA communication testcases，A5 communication testcases，`TWAIT/TNOTIFY` 同步测试，SDMA/URMA async type。
- `design-intended`: PyPTO orchestration-level collective API 直接或间接映射到 PTO-ISA communication primitive；当前证据主要在 PyPTO issue 和 simpler examples。

## 代表性示例

| 示例 | 说明 | 读法 |
| --- | --- | --- |
| `demos/baseline/gemm_basic` | 固定尺寸 `[512, 2048] x [2048, 1536]` GEMM，说明 tile shape、per-core split、double buffering 和 pipeline sync | compute ISA 示例 |
| `demos/baseline/allgather_async` | A2/A3 用 SDMA `TPUT_ASYNC/TGET_ASYNC`，A5 用 URMA `TPUT_ASYNC/TGET_ASYNC`，MPI rank 映射 device | communication ISA 示例 |
| `tests/npu/a5/comm/st/testcase/twait/twait_kernel.cpp` | `TNOTIFY` remote signal 与 `TWAIT` local wait；多 rank atomic add/threshold wait | synchronization primitive 示例 |

## 与 simpler 的关系

`simpler` 的 L3 hardware examples 会通过 `simpler_setup.pto_isa.ensure_pto_isa_root()` 获取 PTO-ISA root，再用 `KernelCompiler.compile_incore()` 编译 AIC/AIV kernel。也就是说，PTO-ISA 是 kernel-level target；simpler 是运行和调度这些 kernel 的 runtime。

在 allreduce/FFN 示例中，cross-rank communication 的 host/chip window 来自 simpler/HCCL bootstrap，kernel 内的 load/store/sync/comm 由 PTO-ISA API 表达。这个分工应保持清楚。

## 与 PyPTO 的关系

PyPTO 负责 Python DSL、IR、pass 和 codegen。它生成或调用的低层 kernel 最终需要落到 PTO-ISA 或相关 C++ runtime API。`pto-isa` README 的 roadmap 包含 collective communication extension 和 system scheduling extension；这与 PyPTO 的 distributed collectives 议题方向一致，但目前不能把 roadmap 写成 PyPTO 已实现 API。

## 未决问题

- PyPTO `pl.all_reduce` 等 orchestration-level collective 会直接发 PTO-ISA collective，还是先走 simpler runtime/HCCL window？
- A5 URMA path 与 remote L3/RoCE blueprint 的关系还需要后续实现证明。
- PTO-ISA roadmap 中 system scheduling extension 与 simpler scheduler 的边界尚未从源码中确认。
