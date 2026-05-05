---
title: "simpler Runtime Architecture"
type: topic
status: draft
sources:
  - repositories/simpler/README.md
  - repositories/simpler/docs/chip-level-arch.md
  - repositories/simpler/docs/hierarchical_level_runtime.md
  - repositories/simpler/docs/task-flow.md
  - repositories/simpler/docs/orchestrator.md
  - repositories/simpler/docs/scheduler.md
  - repositories/simpler/docs/worker-manager.md
  - repositories/simpler/docs/testing.md
  - repositories/simpler/examples/workers/
last_updated: 2026-05-05
---

# simpler Runtime Architecture

`simpler` 的上游文档已经形成了一套很完整的 runtime 教材。本页把这些文档的主线合成到 wiki 中：先理解 L2 单 chip 的 host/AICPU/AICore 三程序模型，再理解 L3+ 如何用 Orchestrator、Scheduler 和 WorkerManager 递归组合多个 child worker。源证据来自 `repositories/simpler` commit `5029466197ab26cdef80c34b5d2cdcfca86b71d7` 的 `README.md`、`docs/*.md` 和 `examples/workers/`。

## How To Read This Page

如果你只记一件事：`simpler` 是 runtime，不是 compiler，也不是 kernel ISA。阅读时按层级向上走：L2 先解释 host、AICPU scheduler、AICore/AIV kernel 如何协作；L3+ 再解释 Orchestrator 如何构图、Scheduler 如何派发、WorkerManager 如何管理 child workers。读完本页再读 distributed execution，才能看出 current L3 与 future remote L3 的差异。

## One Sentence Model

`simpler` 是 PTO 的 runtime engine：它把 callable、tensor arguments 和 execution config 变成可调度的 task graph，在 L2 启动一个 Ascend chip，在 L3+ 把多个 L2 chip worker、nested Worker 和 Python SubWorker 组合成 host-side DAG。

```text
L3+ host DAG
  Orchestrator builds slots and TensorMap deps
  Scheduler dispatches ready slots
  WorkerManager sends slots to child workers
        |
        v
L2 chip worker
  host runtime loads binaries
  AICPU scheduler runs task graph
  AICore/AIV kernels execute PTO-ISA code
```

## L2 Three-Program Model

L2 是 `simpler` 的最小可运行单元。`docs/chip-level-arch.md` 明确把它拆成三个 program：Python/host application、AICPU scheduler kernel、AICore/AIV compute kernels。Host 侧通过 nanobind API 和 `ChipWorker` 管理 device context、runtime `.so`、AICPU binary、AICore object 和 tensor memory；AICPU 侧负责 dependency wiring、ready detection、dispatch 和 completion；AICore/AIV 侧等待 task assignment，执行 PTO-ISA kernel，再写回完成信号。

```text
Python example / scene test
  -> RuntimeBuilder locates host.so, aicpu.so, aicore.o
  -> KernelCompiler compiles user orchestration and InCore kernels
  -> ChipWorker.init() dlopen host runtime and set device
  -> ChipWorker.run(callable, args, CallConfig)
  -> host runtime uploads binaries and tensor descriptors
  -> AICPU scheduler dispatches tasks
  -> AICore/AIV kernels compute and signal completion
  -> host synchronizes and copies results back
```

The important maintenance lesson is that L2 launch failures are boundary problems. A failure can come from Python binding setup, runtime binary lookup, C API symbol loading, device initialization, AICPU scheduling, kernel execution, or host/device copy-back. The wiki should not collapse all of these into “runtime failed.”

## L3+ Engine Components

From L3 upward, `simpler` uses the same three engine components at every level:

- Orchestrator is the DAG builder. It runs on the user's orchestration thread, allocates task slots, consumes `TaskArgs` tensor tags, updates TensorMap, and pushes work to the scheduler wiring queue.
- Scheduler is the DAG executor. It owns a dedicated C++ thread, drains wiring/ready/completion queues, promotes slots when fanin is satisfied, and releases downstream consumers on completion.
- WorkerManager is the execution layer. It owns next-level and sub-worker pools, chooses idle `WorkerThread`s, and dispatches task slots in THREAD or PROCESS mode.

This composition matters because L3 is not only “multi-chip.” It is a reusable host-level DAG engine whose next-level children can be L2 `ChipWorker`s, and whose sub children can be Python callables. L4+ reuses the same idea by making a lower-level `Worker` itself implement the `IWorker` interface.

```text
User orchestration function
  -> orch.submit_next_level(...) or orch.submit_sub(...)
  -> slot in Ring with callable, TaskArgs, CallConfig
  -> TensorMap derives producer/consumer edges from tensor addresses
  -> Scheduler dispatches ready slot to a WorkerThread
  -> WorkerThread calls ChipWorker, SubWorker, or nested Worker
  -> completion releases fanout and may wake downstream slots
```

## Task Data Flow

Every task carries exactly three handles through the hierarchy:

| Handle | Meaning | Why it matters |
| --- | --- | --- |
| `Callable` | Opaque `uint64_t`; interpreted as `ChipCallable*`, orchestration function pointer, or Python registry id depending on the destination worker | Keeps dispatch uniform while allowing different worker kinds |
| `TaskArgs` | Tensor/scalar argument builder plus per-tensor tags such as input/output/inout | Tags drive TensorMap dependencies at submit time |
| `CallConfig` | Small POD with execution knobs such as block dim, AICPU thread count, profiling/dump flags | Passed by value through all levels and down to L2 |

`TaskArgs` changes physical form as it moves. At user submit time it is a builder object; inside the task slot it is stored on parent heap; in PROCESS mode it is encoded into a shared-memory mailbox; at the L2 edge `ChipWorker::run` packs it into `ChipStorageTaskArgs` for `pto2_run_runtime`. Tags are consumed by Orchestrator during submit and are not carried into scheduler, worker thread, child process, or runtime `.so`.

## TensorMap, Ring, And Scope

The core scheduling trick is TensorMap. When a task marks a tensor as input, Orchestrator looks up the current producer of that tensor address. When a task marks a tensor as output or inout, Orchestrator records the new producer. This lets examples such as paged attention or FFN tensor parallel build dependencies from data flow instead of manually wiring every edge.

Ring and Scope make that graph bounded. Ring supplies task slots and shared-memory heap slabs with back-pressure; Scope keeps intermediate outputs alive until a `Worker.run()` drains and scope end can release references. This is why `tensormap_and_ringbuffer` is more than an example name: it describes the production runtime shape where task slots, output buffers, dependency records, and nested scopes are managed as reusable resources.

## THREAD And PROCESS Modes

`WorkerManager` can dispatch through THREAD or PROCESS mode. THREAD mode calls the child worker in the parent process. PROCESS mode pre-forks one child per `WorkerThread`, writes callable/config/args into a shared-memory mailbox, signals the child, then waits for `TASK_DONE`.

PROCESS mode explains two important restrictions:

- `register()` and `add_worker()` must happen before `init()`, because forked children inherit callable registries and objects through copy-on-write.
- Forking must happen before C++ scheduler and worker threads start, avoiding fork-in-multithreaded-process hazards.

This local fork/mailbox model is also the reason remote L3 cannot be inferred from current L3 examples. A remote worker needs discovery, serialization, callable registration, lifecycle, and control channel semantics that local copy-on-write does not provide.

## Example Ladder Inside simpler

The `examples/workers/` documents are especially useful because they teach the raw `Worker` API without hiding it behind `@scene_test`.

| Example | What it teaches | Expected success signal |
| --- | --- | --- |
| `examples/workers/l2/hello_worker` | `Worker(level=2)` lifecycle: construct, `init()`, `malloc/free`, `close()` | output reports init, malloc/free round trip, and close complete |
| `examples/workers/l2/vector_add` | full L2 path: compile one AIV kernel, build `ChipCallable`, allocate/copy tensors, build `ChipStorageTaskArgs`, run, copy back, compare with numpy | output reports max error and golden check passed |
| `examples/workers/l3/multi_chip_dispatch` | host-level orchestration with multiple chip workers and a Python SubWorker | orchestration dispatches per-chip work and sub-worker verification |
| `examples/workers/l3/allreduce_distributed` | current single-host multi-chip communication through rank/window setup | hardware test passes with two A2/A3 devices |
| `examples/workers/l3/ffn_tp_parallel` | two-stage tensor-parallel FFN where TensorMap links producer/consumer stages by tensor address | hardware test passes and validates cross-stage output |

Use these examples as the `simpler` learning spine. The scene-test examples under `examples/a2a3/` and `tests/st/` are better for production tests, parametrization, golden comparison, profiling, and CI-style execution.

## Testing And Environment Surface

`simpler/docs/testing.md` separates source-only, simulator, and hardware expectations. Simulator platforms such as `a2a3sim` and `a5sim` require no NPU hardware. Hardware platforms such as `a2a3` and `a5` require Ascend device access and CANN environment setup. Scene tests can run standalone with `python test_*.py -p <platform>` or through pytest with `pytest examples tests/st --platform <platform>`.

| Surface | Typical command shape | What it proves |
| --- | --- | --- |
| Python unit tests | `pytest tests/ut` | Python/nanobind-facing modules without hardware |
| C++ unit tests | `ctest ... -LE requires_hardware` | pure C++ scheduler/runtime data structures without hardware labels |
| Simulator scene tests | `pytest examples tests/st --platform a2a3sim` | compile/run/golden path through simulator backend |
| Hardware scene tests | `pytest examples tests/st --platform a2a3 --device 4-7` | real Ascend device path, CANN runtime, and device logs |
| Standalone example | `python examples/workers/l2/vector_add/main.py -p a2a3sim -d 0` | one example's full lifecycle without pytest machinery |

The `--build` flag recompiles runtime binaries from source; without it, examples normally load prebuilt runtime artifacts from `build/lib/` or package assets. This detail is important when a code change touches runtime C++ rather than only Python or example code.

## What This Page Adds To The Repo Profile

The [simpler repository profile](../repositories/simpler.md) explains where the repository fits in PTO. This page explains the runtime mechanics in a self-contained way. For claims about `ChipWorker`, TensorMap, ring buffer, mailbox, SubWorker, L3, or deferred remote-worker work, this page is the foundation layer before distributed behavior is added.
