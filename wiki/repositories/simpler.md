---
title: "simpler"
type: repo-profile
status: draft
sources:
  - repositories/simpler/
  - repositories/simpler/docs/chip-level-arch.md
  - repositories/simpler/src/a2a3/docs/runtimes.md
  - materials/pto-runtime-distributed/
last_updated: 2026-05-04
---

# simpler

`simpler` 是 PTO runtime 的主要实现仓库。先把它理解成“在 Ascend device 上启动和调度 task graph 的 runtime”，再看它的分布式扩展。它的基础能力是 L0-L2：host program 构造 callable/args/config，L2 `ChipWorker` 加载 host runtime、AICPU binary、AICore binary，AICPU scheduler 调度 AICore/AIV kernel。L3/L4 是在这个 L2 chip execution unit 上继续组合出来的层级 worker。

本页基于 `repositories/simpler` commit `5029466197ab26cdef80c34b5d2cdcfca86b71d7` 和材料包 `materials/pto-runtime-distributed/`。

## Repo 直觉

`simpler` 的最小自洽单元是 L2 CHIP。`docs/chip-level-arch.md` 把 L2 描述为三个 program 协作：Python application/host runtime、AICPU scheduler kernel、AICore compute kernels。`examples/workers/l2/README.md` 也把 L2 定义为一个 NPU device，由一个 on-device AICPU scheduler 和 AICore/AIVector workers 管理。

L3 之后不要先理解成“分布式系统”，而要先理解成“把多个 L2 worker 和 Python SubWorker 放进 host-side DAG scheduler”。材料 `00_README.md` 中的 remote L3、cross-host callable registration、RoCE/URMA control plane 是下一层设计目标，不是当前 L2-L3 基础能力。

## L0-L2 Ascend 启动路径

`docs/chip-level-arch.md` 给出的 L2 execution flow 是理解 `simpler` 的主线：

```text
Python test/example
  -> RuntimeBuilder 取得 host.so / aicpu.so / aicore.o
  -> KernelCompiler 编译 InCore kernel 和 orchestration .so
  -> ChipWorker.init(): dlopen host.so, resolve C API
  -> worker.set_device(): set device, allocate stream/context
  -> worker.run(callable, args, CallConfig)
  -> run_runtime()
      -> upload kernel binaries
      -> allocate/copy tensors
      -> build task graph
      -> launch AICPU init kernel
      -> launch AICPU scheduler kernel
      -> launch AICore worker kernel
      -> synchronize, copy results back, cleanup
```

在 device 侧，AICPU 负责 handshake、fanout dependency wiring、ready task detection、dispatch、completion tracking；AICore/AIV 负责等待 task assignment、读取 args/kernel address、执行 PTO-ISA kernel、写回完成信号。这个路径对应 `docs/chip-level-arch.md`、`src/common/worker/pto_runtime_c_api.h`、`src/common/worker/chip_worker.cpp`。

## Runtime Variants

`src/a2a3/docs/runtimes.md` 明确列出两个 runtime 变体：

| Runtime | 图构建位置 | 依赖来源 | 典型用途 |
| --- | --- | --- | --- |
| `host_build_graph` | Host CPU | explicit edges | development/debugging；host 先构完整图，再启动 device execution |
| `tensormap_and_ringbuffer` | AICPU/device side | TensorMap 从 tensor read/write pattern 自动推导 | production workload；支持 streaming、flow control、large batch、profiling |

`tensormap_and_ringbuffer` 是当前默认用户路径。它用 `PTO2TaskDescriptor[]` ring buffer 存 task slots，用 GM heap ring 管 output buffer，用 TensorMap 自动维护 `tensor_base_ptr -> producer task`，并把 HeapRing、TaskRing、DepPool 切成 4 个独立 ring 支撑 nested scope isolation。

## 关键模块

| 模块 | 作用 | 状态 |
| --- | --- | --- |
| `python/simpler/worker.py` | `Worker(level=2/3/4)` factory、mailbox layout、child process loop | `implemented` |
| `python/simpler/task_interface.py` | `TaskArgs`、`ChipCallable`、`ChipBootstrapConfig`、`ChipContext`、comm/window bootstrap | `implemented` |
| `docs/chip-level-arch.md` | L2 host/AICPU/AICore 启动和协作路径 | `implemented` documentation |
| `src/a2a3/docs/runtimes.md` | `host_build_graph` vs `tensormap_and_ringbuffer` runtime 设计 | `implemented` documentation |
| `src/common/worker/chip_worker.cpp` | L2 `ChipWorker`，调用 `pto2_run_runtime` | `implemented` |
| `src/common/hierarchical/worker_manager.h` | worker pool、THREAD/PROCESS mode、process mailbox ABI | `implemented` |
| `src/common/hierarchical/orchestrator.*` | DAG submit、TensorMap lookup/insert、Scope/Ring 管理 | `implemented` |
| `src/common/hierarchical/scheduler.*` | wiring queue、ready queue、completion queue、worker dispatch | `implemented` |
| `src/common/platform_comm/comm.h` | backend-neutral C API: init/window/query/barrier/destroy | `implemented` |
| `src/common/platform_comm/comm_context.h` | device-visible `CommContext` ABI、rank/window metadata | `implemented` |
| `examples/workers/l3/` | L3 examples and hardware demos | `implemented`/`emerging` |

## L2 示例

| 示例 | 说明 | 状态 |
| --- | --- | --- |
| `examples/workers/l2/hello_worker` | `Worker.init()` / `close()` contract；无 kernel，适合验证 runtime plumbing | `implemented` |
| `examples/workers/l2/vector_add` | 编译 AIV kernel 为 `ChipCallable`，构造 `TaskArgs`，host/device copy，运行并与 numpy 比较 | `implemented` |
| `examples/a2a3/tensormap_and_ringbuffer/paged_attention` | `tensormap_and_ringbuffer` production runtime 示例，orchestration 中提交 AIC/AIV tasks | `implemented` |

## Try First

| Goal | Command / action | Expected signal | Common blocker |
| --- | --- | --- | --- |
| lifecycle check | `python examples/workers/l2/hello_worker/main.py -p a2a3sim -d 0` | worker init, malloc/free, close complete | runtime binaries not built |
| smallest full L2 run | `python examples/workers/l2/vector_add/main.py -p a2a3sim -d 0` | golden check passes | PTO-ISA headers/build cache missing on first run |
| L3 hardware reading path | inspect `examples/workers/l3/allreduce_distributed` and `ffn_tp_parallel` before running | can explain rank/window and TensorMap dependency | requires A2/A3 multi-device hardware |

## Host-side DAG 层

`docs/orchestrator.md` 把 Orchestrator 定义为 DAG builder。它拥有 `Ring`、`TensorMap`、`Scope`，在 `submit_next_level` / `submit_sub` 时消费 `TaskArgs` 的 tensor tags：`INPUT`/`INOUT` 做 TensorMap lookup，`OUTPUT`/`INOUT`/`OUTPUT_EXISTING` 做 insert。tags 在 submit 阶段被消费，后续 scheduler/worker 不再携带 tags。

`docs/scheduler.md` 把 Scheduler 定义为 DAG executor：一个 dedicated C++ thread drain wiring queue，按 worker type 拆分 ready queue，然后由 completion queue 释放 fanout、唤醒下游 consumer，并回收 ring slot。这是 L3 host-side DAG 的通用执行内核，也解释了为什么 TensorMap/ringbuffer 是分布式页面必须先理解的基础。

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
| `examples/workers/l3/ffn_tp_parallel` from [PR #571](https://github.com/hw-native-sys/simpler/pull/571) | FFN tensor-parallel end-to-end demo | `implemented` |

## 分布式相关进展

| 证据 | 结论 |
| --- | --- |
| [PR #579](https://github.com/hw-native-sys/simpler/pull/579) | `child_memory`、`TensorKey`、scheduler affinity 支撑 device-resident tensor。`implemented` |
| [PR #592](https://github.com/hw-native-sys/simpler/pull/592) | HCCL backend for comm C API。`implemented` |
| [PR #670](https://github.com/hw-native-sys/simpler/pull/670) / [#692](https://github.com/hw-native-sys/simpler/pull/692) / [#700](https://github.com/hw-native-sys/simpler/pull/700) 与 [issue #686](https://github.com/hw-native-sys/simpler/issues/686) | deferred completion API 和 context 已经历数轮合并。`implemented` |
| [PR #696](https://github.com/hw-native-sys/simpler/pull/696) | SDMA async completion 仍打开。`emerging` |
| 材料 `03_distributed_blueprint.md`/`04_feature_deep_dives.md` | remote L3 worker、persistent run_loop、callable registry、platform decoupling 是目标蓝图。`design-intended` |

## 架构边界

- `implemented`: 单 host L3 hierarchical runtime、HCCL/sim comm backend、window bootstrap、TensorMap dependency、若干硬件示例。
- `emerging`: SDMA async completion、多 callable DAG 的更广组合、deferred completion 的后续统一。
- `design-intended`: remote L3、跨 host child worker、remote callable registration、RoCE/URMA remote control plane。

## Evidence-Based Interpretation

本页把 `simpler` 放在 wiki 的 runtime foundation layer：L2 `ChipWorker` 是最小可运行单元，L3 是 host-side DAG scheduler 组合多个 L2 chip worker 和 Python `SubWorker` 的层级 runtime。这个判断来自 `docs/chip-level-arch.md`、`src/a2a3/docs/runtimes.md`、`docs/orchestrator.md`、`docs/scheduler.md`、`python/simpler/worker.py` 和 `examples/workers/l2` / `examples/workers/l3`。材料中的 remote L3/DistWorker 设计应读作下一层目标，而不是覆盖这条已实现的 L2/L3 foundation。

## 未决问题

- remote control channel 会成为 `simpler` 内部 backend，还是由独立 distributed runtime 调用 `simpler` local worker？
- 当前 mailbox ABI 会保留为 local fast path，还是会抽象成 local/remote 双 backend？
- deferred completion 与 SDMA/URMA async completion 最终的统一 wait condition ABI 尚需从后续 PR 确认。
