---
title: "simpler"
type: repo-profile
status: draft
sources:
  - repositories/simpler/
  - repositories/simpler/docs/chip-level-arch.md
  - repositories/simpler/src/a2a3/docs/runtimes.md
  - wiki/materials/pto-runtime-distributed/
last_updated: 2026-05-05
---

# simpler

`simpler` 是 PTO runtime 的主要实现仓库。先把它理解成“在 Ascend device 上启动和调度 task graph 的 runtime”，再看它的分布式扩展。它的基础能力是 L0-L2：host program 构造 callable/args/config，L2 `ChipWorker` 加载 host runtime、AICPU binary、AICore binary，AICPU scheduler 调度 AICore/AIV kernel。L3/L4 是在这个 L2 chip execution unit 上继续组合出来的层级 worker。

本页基于 `repositories/simpler` commit `5029466197ab26cdef80c34b5d2cdcfca86b71d7` 和材料包 `wiki/materials/pto-runtime-distributed/`。

## How To Read This Page

先按 runtime foundation 阅读，不要直接跳到 distributed PR 表。`Repo 直觉` 和 `L0-L2 Ascend 启动路径` 解释最小可运行单元；`Runtime Variants` 和 `Host-side DAG 层` 解释 TensorMap/ring/scheduler 为什么存在；`L3 Worker 模型` 和 `Comm Window 与 HCCL` 才进入 distributed-adjacent 能力。想看更完整的上游 docs synthesis，继续读 [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md)。

## Repo 直觉

`simpler` 的最小自洽单元是 L2 CHIP。`docs/chip-level-arch.md` 把 L2 描述为三个 program 协作：Python application/host runtime、AICPU scheduler kernel、AICore compute kernels。`examples/workers/l2/README.md` 也把 L2 定义为一个 NPU device，由一个 on-device AICPU scheduler 和 AICore/AIVector workers 管理。

L3 之后不要先理解成“分布式系统”，而要先理解成“把多个 L2 worker 和 Python SubWorker 放进 host-side DAG scheduler”。材料 `00_README.md` 中的 remote L3、cross-host callable registration、RoCE/URMA control plane 是下一层设计目标，不是当前 L2-L3 基础能力。

```text
simpler owns runtime lifecycle

Python host process
  -> Worker(level=2): ChipWorker for one Ascend device
       -> host runtime .so
       -> AICPU scheduler kernel
       -> AICore/AIV compute kernels
  -> Worker(level=3): host-side DAG over L2 chip workers + SubWorkers
       -> Orchestrator builds dependencies
       -> Scheduler dispatches ready slots
       -> WorkerManager selects child workers
```

上游 `simpler/docs/` 本身是本 wiki 的重要学习材料。更完整的 runtime mechanics synthesis 见 [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md)；本 repo profile 只保留仓库级定位和主要入口。

## 上游文档学习主线

`simpler` 的 docs 质量比普通 README 索引更高：它们分层解释了 L2 chip launch、L3+ hierarchy、task data flow、DAG construction、scheduler dispatch 和 worker process model。读者可以把这组文档当成 runtime 教材：先从 L2 三程序模型理解一个 chip 如何跑起来，再从 Orchestrator/Scheduler/WorkerManager 理解 L3+ 如何把多个 child worker 组合成 host-side DAG。

| Upstream doc | 它教什么 | Wiki destination |
| --- | --- | --- |
| `docs/chip-level-arch.md` | L2 三程序模型：host runtime、AICPU scheduler、AICore/AIV kernels；以及 Python/C/C++ API layers | [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md#l2-three-program-model), [Non-Distributed Execution](../topics/non-distributed-execution.md) |
| `docs/hierarchical_level_runtime.md` | L0-L6 level model；L3+ 的 Orchestrator/Scheduler/Worker component composition | [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md#l3-engine-components), [Lingqu Level Map](../topics/lingqu-level-map.md) |
| `docs/task-flow.md` | `Callable`、`TaskArgs`、`CallConfig` 在 submit、slot、mailbox、L2 ABI edge 的形态变化 | [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md#task-data-flow) |
| `docs/orchestrator.md` | TensorMap、Ring、Scope 和 `submit_*` 的 7-step flow | [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md#tensormap-ring-and-scope) |
| `docs/scheduler.md` | wiring queue、ready queue、completion queue 和 fanout release | [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md#l3-engine-components) |
| `docs/worker-manager.md` | THREAD/PROCESS mode、fork ordering、shared-memory mailbox、nested Worker children | [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md#thread-and-process-modes) |
| `examples/workers/` docs | raw `Worker` API examples for L2 lifecycle, vector add, L3 dispatch, allreduce, FFN TP | [PTO Examples](../examples/pto/), [simpler Runtime Architecture](../topics/simpler-runtime-architecture.md#example-ladder-inside-simpler) |

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

从维护角度看，L2 不是一个黑盒 launch API，而是 host 与 device 的协作协议。host 负责准备 shared descriptors、binary blobs、tensor buffers 和 callable metadata；AICPU 是 device-side scheduler；AICore/AIV 是真正执行 compute kernel 的 worker。一个 L2 bug 通常要先判断状态卡在哪个边界：Python/C++ host binding、C API、device initialization、AICPU scheduler、kernel execution，还是 copy-back/sync。

`examples/workers/l2/vector_add` 是这条路径的最小完整故事：host 编译 AIV add kernel，创建 `ChipCallable`，为输入输出构造 `TaskArgs`，把数据拷到 device，调用 worker run，最后把结果拷回并和 numpy golden 比较。这个例子比 distributed allreduce 更适合作为 runtime 入口，因为它包含了 launch 的完整闭环，但没有 rank/window/communication 干扰。

## Runtime Variants

`src/a2a3/docs/runtimes.md` 明确列出两个 runtime 变体：

| Runtime | 图构建位置 | 依赖来源 | 典型用途 |
| --- | --- | --- | --- |
| `host_build_graph` | Host CPU | explicit edges | development/debugging；host 先构完整图，再启动 device execution |
| `tensormap_and_ringbuffer` | AICPU/device side | TensorMap 从 tensor read/write pattern 自动推导 | production workload；支持 streaming、flow control、large batch、profiling |

`tensormap_and_ringbuffer` 是当前默认用户路径。它用 `PTO2TaskDescriptor[]` ring buffer 存 task slots，用 GM heap ring 管 output buffer，用 TensorMap 自动维护 `tensor_base_ptr -> producer task`，并把 HeapRing、TaskRing、DepPool 切成 4 个独立 ring 支撑 nested scope isolation。

`host_build_graph` 与 `tensormap_and_ringbuffer` 的差异不只是“图在哪里构建”。前者更像把 DAG 一次性显式准备好，适合调试和验证；后者把 dependency discovery 和资源复用推到 runtime/device 侧，更接近持续提交任务的生产模型。TensorMap 让相同 tensor address 成为 dependency 的线索，ring buffer 让 task/output/dependency 记录可以循环复用。这就是为什么 paged attention 和 FFN tensor parallel 不能只看 kernel，还必须看 runtime 的数据结构。

## 关键模块

读源码时优先按 ownership 进入，而不是按目录名猜层级。`src/a2a3` 和 `src/a5` 更接近 platform/runtime variant；`src/common` 承载大量 L3+ host runtime 逻辑；Python wrapper 则把 `Worker`、`TaskArgs` 和 callable registration 暴露给 examples。

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

这些模块合在一起说明：`simpler` 不是 PTO-ISA kernel library，也不是 PyPTO language frontend。它拥有 runtime boundary：worker lifecycle、runtime binary loading、task graph scheduling、TensorMap dependency discovery、mailbox/process model、communication window bootstrap 和 child-worker dispatch。

## Source Code Walkthrough

`python/simpler/worker.py` 的文件头已经展示了 `Worker` 的真实 API shape：

```python
# L2: one NPU chip
w = Worker(level=2, device_id=8,
           platform="a2a3", runtime="tensormap_and_ringbuffer")
w.init()
w.run(chip_callable, chip_args, config)
w.close()

# L3: multiple chips + SubWorkers
w = Worker(level=3, device_ids=[8, 9], num_sub_workers=2,
           platform="a2a3", runtime="tensormap_and_ringbuffer")
cid = w.register(lambda args: postprocess())
w.init()
```

这段不是 tutorial filler；它说明 `simpler` 的 public runtime surface 是 `Worker(level=N)`。L2 直接运行 `ChipCallable`；L3 需要先 register callables/subworkers，再 `init()` fork child workers，最后 `run()` 一个 orchestration function。

同一个文件还定义了 PROCESS mode 的 mailbox layout：

```python
_OFF_STATE = 0
_OFF_CALLABLE = 8
_OFF_CONFIG = 16
_CFG_FMT = struct.Struct("=iiiii1024s")
_OFF_ARGS = (_OFF_CONFIG + _CFG_FMT.size + 7) & ~7

_IDLE = 0
_TASK_READY = 1
_TASK_DONE = 2
_SHUTDOWN = 3
```

这说明 parent/child process 不是用 Python function call 直接通信，而是通过 shared-memory mailbox。`callable`、`CallConfig` 和 encoded args 都有固定 offset；`_OFF_ARGS` 还显式做 8-byte alignment，避免 strict-alignment platform 上的 runtime fault。

child process loop 的核心是状态机：

```python
while True:
    state = _mailbox_load_i32(state_addr)
    if state == _TASK_READY:
        callable_ptr = struct.unpack_from("Q", buf, _OFF_CALLABLE)[0]
        cfg = _read_config_from_mailbox(buf)
        cw.run_from_blob(callable_ptr, args_ptr, cfg)
        _mailbox_store_i32(state_addr, _TASK_DONE)
    elif state == _SHUTDOWN:
        cw.finalize()
        break
```

这个片段解释了为什么当前 L3 evidence 是 single-host strong、remote-host weak：PROCESS mode 依赖 forked child、shared memory、process-local callable pointer/blob 和 local state polling。Remote L3 必须替换这些 assumptions，不能从本地 mailbox 自动推出。

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
| L3 hardware context | inspect `examples/workers/l3/allreduce_distributed` and `ffn_tp_parallel` before running | can explain rank/window and TensorMap dependency | requires A2/A3 multi-device hardware |

## Safe First Change

维护者第一次改 `simpler` 时，最好选择仍在一个 boundary 内的改动。L2 example 或 README 改动只验证 `ChipWorker` lifecycle；TensorMap/ring-buffer 改动要能说明 producer/consumer edge 如何变化；L3 scheduling 改动要先说清 state 在 parent process、scheduler thread、child process mailbox、AICPU scheduler 还是 AICore/AIV kernel。

```text
safe local change
  -> examples/workers/l2 or small L3 example
  -> run/inspect matching pytest
  -> status remains local L2/L3

unsafe inference
  -> local HCCL window works
  -> therefore remote L3 is implemented
```

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

## What This Page Proves

本页可以支撑三个结论。第一，`simpler` 的 L2 path 是已实现的 Ascend launch path：host runtime、AICPU scheduler 和 AICore/AIV kernels 共同完成单 chip execution。第二，`simpler` 的 L3 path 是已实现的 single-host hierarchy runtime：parent process 可以调度 L2 chip worker 和 Python SubWorker。第三，HCCL/window bootstrap 是 distributed data-plane 支撑能力。

本页不能证明 remote L3、跨 host child worker、remote callable registry 或 RoCE/URMA control plane 已经实现；这些仍需要 future source pass、merged PR、stable example 或 test evidence。

## Evidence-Based Interpretation

本页把 `simpler` 放在 wiki 的 runtime foundation layer：L2 `ChipWorker` 是最小可运行单元，L3 是 host-side DAG scheduler 组合多个 L2 chip worker 和 Python `SubWorker` 的层级 runtime。这个判断来自 `docs/chip-level-arch.md`、`src/a2a3/docs/runtimes.md`、`docs/orchestrator.md`、`docs/scheduler.md`、`python/simpler/worker.py` 和 `examples/workers/l2` / `examples/workers/l3`。材料中的 remote L3/DistWorker 设计应读作下一层目标，而不是覆盖这条已实现的 L2/L3 foundation。

## 未决问题

- remote control channel 会成为 `simpler` 内部 backend，还是由独立 distributed runtime 调用 `simpler` local worker？
- 当前 mailbox ABI 会保留为 local fast path，还是会抽象成 local/remote 双 backend？
- deferred completion 与 SDMA/URMA async completion 最终的统一 wait condition ABI 尚需从后续 PR 确认。

## What To Remember

读 `simpler` 时先记住一条线：L2 让一个 chip 跑起来，L3 把多个 child workers 组织成 host-side DAG，HCCL/window 支撑 data-plane communication。只要问题涉及 remote host、remote callable、persistent run loop 或 platform ABI decoupling，就不要从当前 L3 local examples 直接推断为 `implemented`。
