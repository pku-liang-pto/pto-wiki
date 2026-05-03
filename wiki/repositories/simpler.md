---
title: "simpler"
type: repo-profile
status: draft
sources:
  - repositories/simpler/
  - materials/pto-runtime-distributed/
last_updated: 2026-05-04
---

# simpler

`simpler` 是本轮文档中 PTO runtime 的主要实现仓库。它把 host 侧 orchestration、chip child process、AICPU/AICore callable、TensorMap 依赖发现、worker 层级和 platform comm backend 组合成一个可运行 runtime。仓库 README 将它定位为 Ascend 上执行 task dependency graph 的 runtime，并列出 `a2a3`、`a2a3sim`、`a5`、`a5sim` 平台以及 `host_build_graph`、`tensormap_and_ringbuffer` runtime 变体。

本页基于 `repositories/simpler` commit `5029466197ab26cdef80c34b5d2cdcfca86b71d7` 和材料包 `materials/pto-runtime-distributed/`。

## Repo 直觉

`simpler` 当前最可靠的读法是：它已经能在单 host 上管理 L2/L3/L4 风格的层级 worker 和多 chip 示例，但“跨 host remote L3 runtime”仍是设计目标。材料 `00_README.md` 明确把 remote worker 管理、callable registration 跨 remote 层级、child worker sync、平台 ABI 解耦列为当前缺口。

核心路径：

```text
Python Worker(level=3)
  -> register SubWorker / chip callable
  -> init(): fork chip children, bootstrap comm/window
  -> run(orchestrator): submit_next_level / submit_sub
  -> TensorMap + scheduler
  -> chip process / sub worker process
```

## 关键模块

| 模块 | 作用 | 状态 |
| --- | --- | --- |
| `python/simpler/worker.py` | `Worker(level=2/3/4)` factory、mailbox layout、child process loop | `implemented` |
| `python/simpler/task_interface.py` | `TaskArgs`、`ChipCallable`、`ChipBootstrapConfig`、`ChipContext`、comm/window bootstrap | `implemented` |
| `src/common/hierarchical/worker_manager.h` | worker pool、THREAD/PROCESS mode、process mailbox ABI | `implemented` |
| `src/common/platform_comm/comm.h` | backend-neutral C API: init/window/query/barrier/destroy | `implemented` |
| `src/common/platform_comm/comm_context.h` | device-visible `CommContext` ABI、rank/window metadata | `implemented` |
| `examples/workers/l3/` | L3 examples and hardware demos | `implemented`/`emerging` |

## L3 Worker 模型

`examples/workers/l3/README.md` 把 L3 定义为 HOST：一个 host process 运行 Orchestrator，驱动多个 L2 chip worker 和若干 Python SubWorker。L3 在 `init()` 前必须注册 callable，因为 fork 后 copy-on-write 会让子进程看不到晚注册的 Python callable。

这解释了材料中的一个重要分布式缺口：本机 fork 模型依赖 shared-memory mailbox 和进程继承，不能直接扩展到 remote host。remote L3 需要独立的 worker discovery、callable registry、serialization/bootstrap 和 control channel。

## Comm Window 与 HCCL

`task_interface.py` 中的 `ChipCommBootstrapConfig`、`ChipBufferSpec`、`ChipContext` 和 `bootstrap_context()` 负责在 chip bootstrap 阶段初始化 communicator、分配 window、发布 rank/window metadata。`comm.h`/`comm_context.h` 把这层包装成 platform-neutral API，底层可以是 HCCL 或 sim backend。

结论：HCCL window 是当前 distributed data-plane 的基础能力之一，状态是 `implemented`；remote worker lifecycle/control plane 不是 HCCL 提供的能力，状态是 `design-intended`。

## 代表性示例

| 示例 | 说明 | 状态 |
| --- | --- | --- |
| `examples/workers/l3/multi_chip_dispatch` | 两个 chip + 一个 SubWorker，展示 host orchestration dispatch | `implemented` |
| `examples/workers/l3/allreduce_distributed/main.py` | two-chip hardware allreduce；cross-rank communication 在 kernel 内经 HCCL window scratch 完成 | `implemented` |
| `examples/workers/l3/ffn_tp_parallel/main.py` | Stage 1 AIC matmul + Stage 2 AIV reduce；TensorMap 通过相同 `buffer.addr` 自动链接 producer/consumer | `implemented` |
| `examples/workers/l3/ffn_tp_parallel` from PR #571 | FFN tensor-parallel end-to-end demo | `implemented` |

## 分布式相关进展

| 证据 | 结论 |
| --- | --- |
| PR #579 | `child_memory`、`TensorKey`、scheduler affinity 支撑 device-resident tensor。`implemented` |
| PR #592 | HCCL backend for comm C API。`implemented` |
| PR #670/#692/#700 与 issue #686 | deferred completion API 和 context 已经历数轮合并。`implemented` |
| PR #696 | SDMA async completion 仍打开。`emerging` |
| 材料 `03_distributed_blueprint.md`/`04_feature_deep_dives.md` | remote L3 worker、persistent run_loop、callable registry、platform decoupling 是目标蓝图。`design-intended` |

## 架构边界

- `implemented`: 单 host L3 hierarchical runtime、HCCL/sim comm backend、window bootstrap、TensorMap dependency、若干硬件示例。
- `emerging`: SDMA async completion、多 callable DAG 的更广组合、deferred completion 的后续统一。
- `design-intended`: remote L3、跨 host child worker、remote callable registration、RoCE/URMA remote control plane。

## 未决问题

- remote control channel 会成为 `simpler` 内部 backend，还是由独立 distributed runtime 调用 `simpler` local worker？
- 当前 mailbox ABI 会保留为 local fast path，还是会抽象成 local/remote 双 backend？
- deferred completion 与 SDMA/URMA async completion 最终的统一 wait condition ABI 尚需从后续 PR 确认。
