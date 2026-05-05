---
title: "Distributed Execution Evidence"
type: evidence
status: draft
sources:
  - wiki/materials/pto-runtime-distributed/
  - repositories/simpler/
  - repositories/pto-isa/
  - repositories/pypto/
  - repositories/hccl/
last_updated: 2026-05-05
---

# Distributed Execution Evidence

This ledger supports [Distributed Execution](../topics/distributed-execution.md). It records why current distributed claims use the shared [status labels](./index.md#status-labels), especially `implemented`, `emerging`, `design-intended`, `stale`, and `open question`.

学习 distributed execution 时先读 topic page；本页回答“这句话凭什么这么标状态”。Material files、repository commits、PR/issue rows 和 negative findings 都服务于一个目的：防止把 single-host L3、kernel data-plane primitive 和 remote L3 design target 混成同一件事。

## Status Labels

- `implemented`: source, test, example, or merged PR exists.
- `emerging`: open PR/issue, skipped test, or partial implementation exists.
- `design-intended`: material or design document describes the target, but stable source evidence is missing.
- `stale`: older issue/material exists but later source or material supersedes it.
- `open question`: evidence is insufficient or conflicting.

## Source Set

| Source | Ref / checksum | Role |
| --- | --- | --- |
| `materials/pto-runtime-distributed.zip` | SHA256 `aa8d92ae9892a6fbda4f9dbfb49111724ad61b286ca081f2a4f02d426a4634a0`; extracted 2026-05-04 | original archive; extracted public material lives under `wiki/materials/pto-runtime-distributed/` |
| `wiki/materials/pto-runtime-distributed/` | 10 real files, 3843 lines; `__MACOSX` and `._*` excluded | extracted material evidence |
| `repositories/simpler` | `main` commit `5029466197ab26cdef80c34b5d2cdcfca86b71d7` | runtime implementation, L2/L3 examples, comm/window APIs |
| `repositories/pto-isa` | `main` commit `a977dd1161222a8b779fb5ff5d1c8b7f4518c3a2` | tile and communication ISA evidence |
| `repositories/pypto` | `main` commit `f21c2dd48cfe1e5c4add78b0e391a31196420862` | DSL/codegen/distributed runner evidence |
| `repositories/hccl` | `master` commit `e8c897660d2afd02b1428b1daa2ce9576f00a5cd` | supporting collective/send/recv API evidence |

## Material Manifest

All material files are UTF-8 Markdown extracted from `materials/pto-runtime-distributed.zip` on 2026-05-04 and moved under `wiki/materials/pto-runtime-distributed/` for public audit access. No converter was needed. Archive metadata paths `__MACOSX` and `._*` were excluded.

| Material file | SHA256 | Routed to |
| --- | --- | --- |
| `00_README.md` | `3e3ec6e2cd5060d4685f84fa97a6738f1e29a6116a710bed1c1d82ea644ba8ac` | distributed status, remote gaps, GitHub status cross-check |
| `01_hardware_and_software_stack.md` | `e2809e99cebb68dacf7de58fe231a02979351c97a3bfb9cec26e3edf6b446d48` | CANN/HCCL/HCOMM/URMA/RoCE boundaries |
| `02_pto_isa_and_runtime_basics.md` | `5cb27ce861f9d05bd105baa4a33045d85b46b840025c4f0ba9f874619f89aa14` | runtime foundation, TensorMap, CommContext, deferred completion |
| `03_distributed_blueprint.md` | `3aba7b8f09816c1defcfd592f5c1b41176e3b31323475cc154999c618b4bc4bc` | remote L3 and design-intended target path |
| `04_feature_deep_dives.md` | `0008e7d4d82fe863a6fe0cd47ed790d8e96badb0976acbe482497f6071dd3456` | feature gaps and control/data-plane separation |
| `05_progress_and_timeline.md` | `6357faa47e4fe2558b9525c732079c9d94da21a51598bf71d6a7329c8efae9e5` | PR/issue timeline, examples evidence |
| `06_development_tasks.md` | `57efef8208d90a6b44d831ac06338757e92ac4f18db68396fa5abd82cc5c4311` | durable task categories and takeover risks |
| `07_source_notes.md` | `511c5675f153565870cab4b25ce1ff4c492de419eb970590eb96c413096d0550` | evidence trust boundary |
| `08_top_level_design_alignment.md` | `398f5aa350e67fabf1f40a6c1d49539386fadfad298f7c3bfd5fc70b713043e7` | Lingqu/L0-L6 alignment |
| `PTO-Runtime分布式拓展文档系统设计.md` | `395352e67313ff31514b983876b9770cbe87e67c33580d9edd347c4fe4cc967a` | wiki writing priority and maintainer audience |

## Material Routing

| Material file | Distributed-execution details used | Other topic destination |
| --- | --- | --- |
| `00_README.md` | remote L3 worker gaps, callable registration gaps, child-worker sync limits, ABI/deployment coupling, PR/issue status | [Examples Feature Map Evidence](./examples-feature-map.md) for PR/demo routing |
| `01_hardware_and_software_stack.md` | Ascend/CANN/HCCL/HCOMM/URMA/RoCE boundary, control-plane vs data-plane split | [Lingqu Level Map Evidence](./lingqu-level-map.md) for hardware hierarchy context |
| `02_pto_isa_and_runtime_basics.md` | worker hierarchy, mailbox, TensorMap/child memory, CommContext/window, deferred completion, current-runtime limits | [Examples Feature Map Evidence](./examples-feature-map.md) for L2/L3 learning examples |
| `03_distributed_blueprint.md` | target topology, remote worker model, rank/affinity, bootstrap, persistent run_loop, platform decoupling | [Lingqu Level Map Evidence](./lingqu-level-map.md) for L4-L6 design-intended labels |
| `04_feature_deep_dives.md` | remote L3, callable registry, worker memory, comm window, deferred completion, send/recv runtime | none beyond distributed topic |
| `05_progress_and_timeline.md` | merged/open PR and issue timeline for simpler/PyPTO distributed features | [Examples Feature Map Evidence](./examples-feature-map.md) for representative examples |
| `06_development_tasks.md` | P0/P1/P2 future work and distributed gaps | not copied as task tracker; summarized as open questions |
| `07_source_notes.md` | evidence trust boundary and source priority | supports all evidence pages |
| `08_top_level_design_alignment.md` | HostWorker/DistWorker and L0-L6 mapping | [Lingqu Level Map Evidence](./lingqu-level-map.md) |
| `PTO-Runtime分布式拓展文档系统设计.md` | writing priority: repo intuition, examples, repo-specific architecture, distributed as second reading layer, HCCL as supporting evidence | informs organization, not target-system facts |

## Repository Anchors

| Repository | Anchors |
| --- | --- |
| `simpler` | `README.md`; `docs/chip-level-arch.md`; `src/a2a3/docs/runtimes.md`; `docs/orchestrator.md`; `docs/scheduler.md`; `python/simpler/worker.py`; `python/simpler/task_interface.py`; `src/common/hierarchical/worker_manager.h`; `src/common/platform_comm/comm.h`; `src/common/platform_comm/comm_context.h`; `examples/workers/l3/allreduce_distributed/main.py`; `examples/workers/l3/ffn_tp_parallel/main.py` |
| `pto-isa` | `README.md`; `include/pto/README.md`; `include/pto/comm/README.md`; `include/pto/comm/async_common/async_types.hpp`; `tests/npu/a5/comm/st/testcase/twait/twait_kernel.cpp`; `demos/baseline/allgather_async/README.md` |
| `pypto` | `.gitmodules`; `include/pypto/ir/function.h`; `src/codegen/distributed/distributed_codegen.cpp`; `python/pypto/runtime/distributed_runner.py`; `tests/st/distributed/test_l3_distributed.py`; `tests/st/distributed/test_l3_parallel_reduce.py` |
| `hccl` | `include/hccl.h`; `include/hccl_mc2.h`; `src/CMakeLists.txt` |

## GitHub Evidence

| Project | URL | State inspected 2026-05-04 | Merge SHA / branch | Changed files | Status-label reason |
| --- | --- | --- | --- | --- | --- |
| simpler | [PR #571](https://github.com/hw-native-sys/simpler/pull/571) | merged 2026-04-22 | `cb1a948d5e6ad7c73817ff9ec02969c6a8767f0d` | 6 | FFN tensor-parallel example is `implemented`. |
| simpler | [PR #579](https://github.com/hw-native-sys/simpler/pull/579) | merged 2026-04-18 | `093c0b34bc5f1af6c07075d3c8f7ad7174d89262` | 38 | `child_memory`, `TensorKey`, and scheduler affinity are `implemented`. |
| simpler | [PR #592](https://github.com/hw-native-sys/simpler/pull/592) | merged 2026-04-20 | `18edd2db540102c86f59ef4033ad6bf56938e147` | 12 | HCCL backend for comm C API is `implemented`. |
| simpler | [PR #670](https://github.com/hw-native-sys/simpler/pull/670) | merged 2026-04-27 | `9142504852ae0b810f4ebc71e0d24588da47f7b8` | 68 | deferred completion base is `implemented`. |
| simpler | [PR #692](https://github.com/hw-native-sys/simpler/pull/692) | merged 2026-04-28 | `08f6f76937f6be121b975f80188a615d3541bcfe` | 14 | deferred notification API alignment is `implemented`. |
| simpler | [issue #686](https://github.com/hw-native-sys/simpler/issues/686) | closed 2026-04-29 | closed by later deferred simplification work | n/a | deferred inference request is superseded by [PR #700](https://github.com/hw-native-sys/simpler/pull/700). |
| simpler | [PR #700](https://github.com/hw-native-sys/simpler/pull/700) | merged 2026-04-29 | `d7ed5302b6fb3a797cdc28a87973f1956d675968` | 38 | always-pass async context path is `implemented`. |
| simpler | [PR #696](https://github.com/hw-native-sys/simpler/pull/696) | open, updated 2026-04-28 | branch `zhouzhe/a2a3-sdma-async-completion` | 10 | A2/A3 SDMA async completion is `emerging`. |
| simpler | [issue #303](https://github.com/hw-native-sys/simpler/issues/303) | closed 2026-04-22 | n/a | n/a | early L1-L4 multi-card background is `stale` because current evidence uses L2/L3 source and the later linked PR rows above. |
| pypto | [PR #611](https://github.com/hw-native-sys/pypto/pull/611) | merged 2026-03-19 | `99cdfe7c5324f4f80ae5eefb289b52bc6529cafa` | 6 | Lingqu hierarchy distributed C++ codegen stage is `implemented`. |
| pypto | [PR #1112](https://github.com/hw-native-sys/pypto/pull/1112) | merged 2026-04-21 | `6190b4c3b22c958e5adc086b72d60c035f40ad6b` | 1 | simpler runtime bump and HCCL/sim backend integration are `implemented`. |
| pypto | [issue #1127](https://github.com/hw-native-sys/pypto/issues/1127) | open, updated 2026-04-23 | n/a | n/a | L3 Distributed Programming Interface RFC is `emerging`. |
| pypto | [issue #1189](https://github.com/hw-native-sys/pypto/issues/1189) | open, updated 2026-04-27 | n/a | n/a | orchestration-level collectives are `design-intended`. |
| pypto | [PR #1227](https://github.com/hw-native-sys/pypto/pull/1227) | open, updated 2026-04-30 | branch `fix/hoist-tensor-create-pre-init` | 5 | host_orch tensor pre-initialization is `emerging`. |

## Claim Map

| Claim ID | Topic claim | Observed facts | Evidence | Destination |
| --- | --- | --- | --- | --- |
| DIST-001 | Current verified path is single-host L3 execution, not remote L3. | PyPTO has distributed runner/codegen anchors; `simpler` has L3 examples under `examples/workers/l3`; `simpler` docs describe local fork/mailbox child workers; materials describe remote L3 as a target blueprint rather than current repo proof. | `pypto/runtime/distributed_runner.py`; `simpler` L3 examples; material `03_distributed_blueprint.md` / `04_feature_deep_dives.md`. | [Distributed Execution](../topics/distributed-execution.md#当前可验证路径) |
| DIST-002 | HCCL is data-plane/window supporting evidence, not runtime control plane. | HCCL headers expose collective/send/recv-style communication APIs; `simpler` comm headers expose backend-neutral comm context/window metadata; no inspected HCCL evidence owns PTO callable registry, worker lifecycle, or scheduler semantics. | `hccl/include/hccl.h`; `simpler/src/common/platform_comm/comm.h`; material `01_hardware_and_software_stack.md`. | [Distributed Execution](../topics/distributed-execution.md#hccl-的位置) |
| DIST-003 | `tensormap_and_ringbuffer`, TensorMap, and ring buffers are runtime foundations that distributed pages must build on. | `simpler` runtime docs explain TensorMap producer lookup/insert, ring slot/back-pressure, scheduler queues, and scope lifetime; distributed examples reuse this dependency/lifetime model rather than replacing it. | `simpler/src/a2a3/docs/runtimes.md`; `simpler/docs/orchestrator.md`; `simpler/docs/scheduler.md`; material `02_pto_isa_and_runtime_basics.md`. | [simpler](../repositories/simpler.md#runtime-variants), [Distributed Execution](../topics/distributed-execution.md#当前可验证路径) |
| DIST-004 | Remote worker discovery, callable registration across hosts, persistent run_loop, and RoCE/URMA control channel are `design-intended`. | Materials name these capabilities; inspected source/examples do not show a stable remote worker process lifecycle, cross-host callable registry, or remote L3 run loop. | Material `03_distributed_blueprint.md`; material `04_feature_deep_dives.md`; no stable remote example found in inspected repos. | [Distributed Execution](../topics/distributed-execution.md#目标分布式路径) |
| DIST-005 | PyPTO distributed support is hierarchy-aware codegen plus L3 runner integration, not a complete remote runtime. | PyPTO evidence includes distributed codegen and a runner that targets `simpler.Worker(level=3)`; distributed tests cover L3-style behavior and skipped/emerging paths, not remote multi-host runtime. | `pypto/src/codegen/distributed/distributed_codegen.cpp`; `pypto/python/pypto/runtime/distributed_runner.py`; tests under `pypto/tests/st/distributed/`. | [pypto](../repositories/pypto.md#distributed-extension-level--role), [Distributed Execution](../topics/distributed-execution.md#当前可验证路径) |

## Negative Findings

- No stable inspected source showed complete remote L3 / DistWorker lifecycle.
- HCCL evidence supports collective/send/recv and windows, but not PTO runtime worker lifecycle or callable registry.
- `pypto/tests/st/distributed/test_l3_parallel_reduce.py` is skipped, so it is `emerging`, not `implemented`.
- GitHub compound search for PTO-ISA PR history hit search operator limits; PTO-ISA conclusions rely on README, headers, demos, and tests.

## Open Questions

- Will remote L3 live inside `simpler`, a separate distributed runtime, or PyPTO runner integration?
- What is the stable ABI for callable identity across host boundaries?
- How will deferred completion and SDMA/URMA async completion converge?
