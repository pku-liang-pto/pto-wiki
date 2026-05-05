---
title: "Distributed Execution"
type: topic
status: draft
sources:
  - wiki/materials/pto-runtime-distributed/
  - repositories/simpler/
  - repositories/pto-isa/
  - repositories/pypto/
  - repositories/hccl/
  - wiki/evidence/distributed-execution.md
last_updated: 2026-05-05
---

# Distributed Execution

本页综合 PTO Runtime、PTO-ISA、PyPTO 和 HCCL 的分布式执行证据。当前实现的重心是 single-host L3、多 chip、HCCL/sim comm backend 和 PyPTO L3 runner；remote L3、跨 host DistWorker、RoCE/URMA control plane 属于目标设计。状态标签和 material/GitHub/source-file routing 记录在 [Distributed Execution Evidence](../evidence/distributed-execution.md)。

## How To Read This Page

先读 [Non-Distributed Execution](./non-distributed-execution.md) 和 [simpler Runtime Architecture](./simpler-runtime-architecture.md)，再读本页。分布式执行不是从 HCCL 或 allreduce 开始，而是从 ordinary PyPTO program、PTO-ISA tile kernel、`simpler` L2 launch 和 L3 host DAG 扩展出来。读本页时要一直区分三件事：当前可运行的 single-host L3、kernel/data-plane communication primitive、以及材料中描述但尚未源码闭合的 remote L3 目标。

## 总体分工

```text
PyPTO DSL / IR / distributed codegen
        |
        v
simpler Worker(level=3) and orchestration runtime
        |
        +--> chip child process / AICPU orchestration
        |       |
        |       v
        |   PTO-ISA kernel code: tile compute + comm primitives
        |
        +--> SubWorker Python process
        |
        v
HCCL / sim comm backend for window, rank, barrier, remote pointer support
```

## Control Plane vs Data Plane

Control plane 决定 worker 如何发现、注册 callable、提交 task、等待 completion；data plane 决定 tensor/rank/window 中的数据如何移动。当前代码已经有 local L3 control plane 和 HCCL/sim data-plane support，但 remote control plane 还不能从 data-plane evidence 推出来。

| 面 | 当前证据 | 状态 |
| --- | --- | --- |
| Local control plane | `simpler.Worker(level=3)`、fork child、mailbox、`submit_next_level`、`submit_sub` | `implemented` |
| Remote control plane | remote L3 worker discovery、remote callable registry、persistent run_loop、RoCE/HCOMM control channel | `design-intended` |
| Data plane | HCCL window、rank/window metadata、PTO-ISA `TPUT/TGET/TWAIT/TNOTIFY`、SDMA/URMA async demos | `implemented` at local/multi-chip level |
| Deferred completion plane | merged deferred completion PRs and context changes | `implemented` |
| SDMA async completion plane | SDMA async completion PR still open | `emerging` |

## 当前可验证路径

1. PyPTO 编译 L3 hierarchy program，生成 host orchestration 入口。
2. `pypto.runtime.distributed_runner` 创建 `simpler.Worker(level=3)`。
3. `simpler` 在 `init()` 中 fork chip children/subworkers，并按 `ChipBootstrapConfig` 初始化 chip comm/window。
4. Host orchestrator 调用 `submit_next_level` 或 `submit_sub`。
5. Tensor args 经 `TaskArgs` 进入 scheduler，TensorMap 可发现 producer/consumer 依赖。
6. Chip kernel 使用 PTO-ISA tile/comm API；HCCL/sim backend 提供 window/rank/barrier。

这个路径的状态是 `implemented`，证据包括 `simpler` L3 examples、`pypto` L3 ST、PTO-ISA comm tests 和 HCCL-backed comm API。

`implemented` 在本页表示 source/test/example/merged PR 证据存在，不表示本 wiki pass 已本地运行对应命令。运行状态和 caveats 跟随每个具体示例，见 [PTO Distributed Runtime Examples](../examples/pto/distributed-runtime.md)；status label definition 见 [Evidence](../evidence/#status-labels)。

## Current Single-Host L3 Sequence

当前最重要的 distributed mental model 是 single-host L3，而不是 remote L3。它的 process/data boundaries 可以这样读：

```text
parent Python process
  creates Worker(level=3)
  registers Python callables before init()
  init()
    -> pre-fork chip child process(es)
    -> pre-fork SubWorker process(es)
    -> start C++ Scheduler thread and WorkerThread pools
  run(orchestration_fn, TaskArgs, CallConfig)
    -> Orchestrator consumes TaskArgs tags
    -> TensorMap links producer/consumer tensor addresses
    -> Scheduler moves slot through wiring/ready/completion queues
    -> WorkerThread writes callable/config/args into shm mailbox
    -> chip child calls ChipWorker.run(...)
         -> L2 host runtime / AICPU scheduler / AICore-AIV kernels
    -> HCCL or sim comm backend supplies rank/window data plane when needed
    -> completion wakes downstream slots and Worker.run drains
```

The same sequence explains why current L3 evidence is strong but local: fork inheritance, shared-memory mailbox, TensorMap addresses, and process-local callable registry all assume one host process tree. A remote L3 implementation would need an explicit replacement for each of those local assumptions.

`simpler` allreduce example 的 source code 把这个 local L3 control plane 写得很直接：

```python
worker = Worker(level=3, platform="a2a3",
                runtime="tensormap_and_ringbuffer",
                device_ids=device_ids,
                chip_bootstrap_configs=cfgs)
worker.init()

def orch_fn(orch, _args, cfg):
    chip_args = TaskArgs()
    chip_args.add_tensor(make_tensor_arg(host_inputs[i]), TensorArgType.INPUT)
    chip_args.add_tensor(make_tensor_arg(host_outputs[i]), TensorArgType.OUTPUT_EXISTING)
    chip_args.add_tensor(window_scratch_tensor, TensorArgType.INOUT)
    chip_args.add_scalar(ctx.nranks)
    chip_args.add_scalar(ctx.device_ctx)
    orch.submit_next_level(chip_callable, chip_args, cfg, worker=i)

worker.run(orch_fn, args=None, config=CallConfig())
```

这段代码证明的 implemented behavior 很窄也很具体：一个 parent Python process 创建 L3 worker，`init()` fork local chip children 并 bootstrap HCCL/window，然后 host orchestration function 提交 next-level chip tasks。它没有 remote worker discovery、remote callable registry 或跨 host run loop。

## 目标分布式路径

材料包中的目标蓝图把 runtime 推向 remote L3：

```text
Host Orchestrator
  -> local L3 HostWorker
  -> remote DistWorker / remote L3 process
  -> remote chip workers
  -> HCCL/HCOMM/URMA/RoCE-backed data movement
```

目标能力包括：

- remote worker discovery and lifecycle
- callable registration across local/remote worker levels
- stable rank/device affinity model
- comm window bootstrap across process/host boundary
- persistent run_loop send/recv
- deferred completion across remote data movement
- platform runtime/ACL/Comm ABI decoupling

这些能力当前应标为 `design-intended`，除非后续仓库出现可运行 remote example 或合并 PR。

## HCCL 的位置

HCCL 是 supporting evidence，不是 PTO Runtime 的 control-plane 替代品。HCCL 公开 collective、send/recv、all-to-all 等 API，且 HCCL CMake target 包含 AIV collective/send/recv 实现。`simpler` 通过 comm C API 和 `CommContext` 把 HCCL window 暴露给 chip kernel；PTO-ISA 在 kernel 内通过 comm primitive 消费这些地址和同步能力。

在 allreduce/FFN TP examples 中，HCCL/window 通常表现为 `ChipCommBootstrapConfig` 和 `ChipContext`：

```python
ChipCommBootstrapConfig(
    rank=rank,
    nranks=nranks,
    rootinfo_path=rootinfo_path,
    window_size=window_size,
)

ctx.local_window_base
ctx.actual_window_size
ctx.buffer_ptrs["scratch"]
ctx.device_ctx
```

这些字段说明 data-plane resource 已经进入 chip context：rank、window base/size、scratch buffer 和 device comm context。它仍然不是 control-plane API；它不会注册 remote callable，也不会创建 remote worker。

因此：

- 可以说 HCCL 支撑 data-plane communication 和 window。
- 不应说 HCCL 已经实现 remote L3 worker lifecycle 或 callable registry。

## 关键状态表

| 主题 | 状态 | 证据 |
| --- | --- | --- |
| L3 host orchestration | `implemented` | `simpler/examples/workers/l3/README.md` |
| HCCL comm API backend | `implemented` | [simpler PR #592](https://github.com/hw-native-sys/simpler/pull/592)；`src/common/platform_comm/comm.h` |
| Device-resident tensor affinity | `implemented` | [simpler PR #579](https://github.com/hw-native-sys/simpler/pull/579)；`child_memory=True` examples |
| Deferred completion | `implemented` | [simpler PR #670](https://github.com/hw-native-sys/simpler/pull/670)、[#692](https://github.com/hw-native-sys/simpler/pull/692)、[#700](https://github.com/hw-native-sys/simpler/pull/700)；[issue #686](https://github.com/hw-native-sys/simpler/issues/686) |
| SDMA async completion | `emerging` | [simpler PR #696](https://github.com/hw-native-sys/simpler/pull/696) open |
| PyPTO L3 runner | `implemented` | `pypto/runtime/distributed_runner.py` |
| PyPTO orchestration collectives | `design-intended` | [pypto issue #1189](https://github.com/hw-native-sys/pypto/issues/1189) open API/design discussion; no stable implementation evidence in this pass |
| Remote L3 / DistWorker | `design-intended` | material blueprint; no stable repo implementation found |
| `distributed-runtime` repository ownership | `open question` | configured target-set repo exists, but no repository profile/source pass has been completed in this wiki |

这些状态判断的 claim map 见 [Distributed Execution Evidence](../evidence/distributed-execution.md#claim-map)。

## 阅读建议

- 想理解 repo 责任边界：先读 [simpler](../repositories/simpler.md)、[pto-isa](../repositories/pto-isa.md)、[pypto](../repositories/pypto.md)。
- 想看具体例子：读 [PTO Examples](../examples/pto/)。
- 想对齐层级术语：读 [Lingqu Level Map](./lingqu-level-map.md) 和 [Distributed Execution Terms](../concepts/distributed-execution-terms.md)。

## 未决问题

- remote worker lifecycle 的 owner 和 API 边界尚未定稿。
- orchestration-level collective 先实现为 PyPTO sugar、runtime callable，还是 PTO-ISA primitive lowering 仍未确认。
- HCCL、HCOMM、URMA、RoCE 在目标 runtime 中的 backend boundary 需要后续代码证明。

## What To Remember

当前已经能作为学习材料讲清楚的是 single-host L3：parent process 建立 hierarchy，Orchestrator 用 TensorMap 建依赖，Scheduler 派发 task，WorkerThread 把工作交给 chip child 或 SubWorker，HCCL/sim backend 提供 rank/window data-plane。remote L3/DistWorker 是目标方向，不是当前已证明的 runtime control plane。

因此，读到 “distributed” 时不要直接理解成跨机器完整系统。先问它是 PyPTO hierarchy expression、`simpler` L3 scheduling、PTO-ISA communication primitive、HCCL data-plane，还是 material blueprint 中的 future remote worker。
