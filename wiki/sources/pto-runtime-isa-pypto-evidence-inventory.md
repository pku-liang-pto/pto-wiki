---
title: "PTO Runtime / PTO-ISA / PyPTO Evidence Inventory"
type: source-inventory
status: draft
sources:
  - materials/pto-runtime-distributed/
  - repositories/simpler/
  - repositories/pto-isa/
  - repositories/pypto/
  - repositories/pypto_top_level_documents/
  - repositories/hccl/
last_updated: 2026-05-04
---

# PTO Runtime / PTO-ISA / PyPTO 证据清单

本页记录 2026-05-04 文档化 PTO Runtime、PTO-ISA、PyPTO 及分布式执行路径时使用的证据。结论页只写综合判断；本页保留材料覆盖、仓库快照、PR/issue、负面发现和未决问题。

## 状态标签

- `implemented`: 源码、测试、示例或已合并 PR 中已经存在。
- `emerging`: 有打开的 PR/issue、跳过测试或部分实现，尚未形成稳定能力。
- `design-intended`: 材料或设计文档明确描述目标形态，但当前仓库还没有完整实现。
- `stale`: 材料中存在但已被后续材料或代码替代。
- `open question`: 证据不足，需要后续确认。

## 材料包

- 原始压缩包：`materials/pto-runtime-distributed.zip`
- SHA256：`aa8d92ae9892a6fbda4f9dbfb49111724ad61b286ca081f2a4f02d426a4634a0`
- 提取目录：`materials/pto-runtime-distributed/`
- 提取规则：只保留真实文档文件；排除 `__MACOSX` 和 `._*` AppleDouble 元数据。
- 提取规模：10 个文件，合计 3843 行。

## 提取文件清单

| 文件 | 行数 | 用途 |
| --- | ---: | --- |
| `00_README.md` | 215 | 总览、术语、当前 runtime 缺口、PR 状态 |
| `01_hardware_and_software_stack.md` | 270 | Ascend/CANN/HCCL/HCOMM/URMA/RoCE 边界 |
| `02_pto_isa_and_runtime_basics.md` | 529 | PTO-ISA 与当前 PTO runtime 基础 |
| `03_distributed_blueprint.md` | 536 | 目标分布式蓝图 |
| `04_feature_deep_dives.md` | 511 | remote L3、callable、memory、comm window、deferred completion 深挖 |
| `05_progress_and_timeline.md` | 355 | PR/issue 时间线与当前进展 |
| `06_development_tasks.md` | 359 | P0/P1/P2 开发任务 |
| `07_source_notes.md` | 140 | 来源边界与证据可信度 |
| `08_top_level_design_alignment.md` | 328 | 与 Linqu/top-level design 的对齐 |
| `PTO-Runtime分布式拓展文档系统设计.md` | 600 | 文档系统设计、写作优先级、可视化和证据规则 |

## 材料覆盖清单

| 材料文件 | 主要信息 | 去向 |
| --- | --- | --- |
| `00_README.md` | runtime 当前四类缺口：remote L3 worker 管理、callable 注册跨 remote 层级、child worker 同步方式、平台 ABI/部署耦合；PR #571/#579/#592/#670/#686/#692/#700/#696 状态 | [Distributed Execution](../topics/distributed-execution.md)、[simpler](../repositories/simpler.md)、本页 PR/issue map |
| `00_README.md` | 术语速查：L1/L2/L3/L4、HostWorker、DistWorker、CommContext、window、rank、affinity | [Distributed Execution Terms](../concepts/distributed-execution-terms.md) |
| `01_hardware_and_software_stack.md` | Ascend 硬件、CANN Runtime/ACL、HCCL/HCOMM、URMA/RoCE 的分层关系；control plane 与 data plane 边界 | [Distributed Execution](../topics/distributed-execution.md)、[Linqu Level Map](../topics/linqu-level-map.md) |
| `02_pto_isa_and_runtime_basics.md` | PTO-ISA 通信指令、worker 层级、mailbox、TensorMap/child_memory、CommContext/window、deferred completion；为什么现有架构不能直接变成分布式 | [pto-isa](../repositories/pto-isa.md)、[simpler](../repositories/simpler.md)、[Distributed Execution](../topics/distributed-execution.md) |
| `03_distributed_blueprint.md` | 目标拓扑、远程 worker model、callable registration、rank/affinity、bootstrap、persistent run_loop、deferred completion 目标、platform decoupling | [Distributed Execution](../topics/distributed-execution.md)、[Linqu Level Map](../topics/linqu-level-map.md) |
| `04_feature_deep_dives.md` | remote L3、callable registration、worker memory、comm window、rank/device id、deferred completion、send/recv runtime、platform decoupling 深挖 | [Distributed Execution](../topics/distributed-execution.md)、[Distributed Execution Terms](../concepts/distributed-execution-terms.md) |
| `05_progress_and_timeline.md` | 已合并和打开的 PR/issue、阶段性实现和图片线索 | 本页 PR/issue map、[Examples Feature Map](../topics/examples-feature-map.md) |
| `06_development_tasks.md` | P0/P1/P2 任务拆分和分布式后续工作 | [Distributed Execution](../topics/distributed-execution.md) 的缺口/路线图；未逐项搬入 wiki，因为任务跟踪应留在 issue/PR |
| `07_source_notes.md` | 材料可信度、source notes、哪些信息应以仓库为准 | 本页“证据边界”和各页面“未决问题” |
| `08_top_level_design_alignment.md` | HostWorker/DistWorker 与 Linqu L0-L6 的映射，以及 top-level design 对齐 | [Linqu Level Map](../topics/linqu-level-map.md)、[pypto](../repositories/pypto.md) |
| `PTO-Runtime分布式拓展文档系统设计.md` | 用户要求的写作优先级：repo 直觉、示例、repo-specific architecture、distributed 第二层阅读、HCCL 只作 supporting evidence | 本轮页面组织；不单独复制为 wiki 正文，因为它是文档工作流设计而非目标系统事实 |

## 仓库快照

| 仓库 | 本地路径 | 远端 | 分支 | 记录 commit | 本轮用途 |
| --- | --- | --- | --- | --- | --- |
| `simpler` | `repositories/simpler` | `https://github.com/hw-native-sys/simpler` | `main` | `5029466197ab26cdef80c34b5d2cdcfca86b71d7` | PTO runtime、L3 examples、HCCL window、deferred completion |
| `pto-isa` | `repositories/pto-isa` | `https://github.com/PTO-ISA/pto-isa` | `main` | `a977dd1161222a8b779fb5ff5d1c8b7f4518c3a2` | tile ISA、communication ISA、SDMA/URMA demos/tests |
| `pypto` | `repositories/pypto` | `https://github.com/hw-native-sys/pypto` | `main` | `f21c2dd48cfe1e5c4add78b0e391a31196420862` | Python DSL、distributed codegen、runtime runner、L3 tests |
| `pypto_top_level_documents` | `repositories/pypto_top_level_documents` | `https://github.com/hengliao1972/pypto_top_level_design_documents` | `main` | `7faac0b910e40989a6bbd381a80595b65ab29708` | `linqu_runtime_design.md` |
| `hccl` | `repositories/hccl` | `https://gitcode.com/cann/hccl` | `master` | `e8c897660d2afd02b1428b1daa2ce9576f00a5cd` | HCCL public API and collective support evidence |

## 主要源码锚点

### simpler

- `repositories/simpler/README.md`：声明 simpler 是 Ascend 上 host/AICPU/AICore task dependency graph runtime；列出 `a2a3`、`a2a3sim`、`a5`、`a5sim` 平台和 `host_build_graph`、`tensormap_and_ringbuffer` runtime 变体。
- `repositories/simpler/python/simpler/worker.py`：`Worker(level=2/3/4)` factory 示例、unified mailbox 常量、process child loop 从 shared-memory mailbox 读取 callable 并执行。
- `repositories/simpler/python/simpler/task_interface.py`：`ChipCommBootstrapConfig`、`ChipBufferSpec`、`ChipContext`、`bootstrap_context()`、`comm_init()`、`comm_alloc_windows()` 和 window buffer slicing。
- `repositories/simpler/src/common/hierarchical/worker_manager.h`：worker pool、THREAD/PROCESS 模式、process mailbox ABI、控制命令。
- `repositories/simpler/src/common/platform_comm/comm_context.h` 与 `comm.h`：backend-neutral comm C API、`CommContext`、window metadata、barrier/destroy。
- `repositories/simpler/examples/workers/l3/allreduce_distributed/main.py`：two-chip hardware allreduce demo，HCCL window scratch、`child_memory=True`、4-phase pattern。
- `repositories/simpler/examples/workers/l3/ffn_tp_parallel/main.py`：two-stage FFN tensor-parallel demo，TensorMap 自动链接 stage1/stage2，cross-rank sum 使用 HCCL-window scratch。

### pto-isa

- `repositories/pto-isa/README.md`：PTO Tile Library、virtual ISA、communication extension、examples、roadmap。
- `repositories/pto-isa/include/pto/comm/README.md`：通信指令集布局，`TPUT/TGET/TNOTIFY/TWAIT/TTEST`、collectives、async、A2/A3/A5/CPU sim。
- `repositories/pto-isa/include/pto/comm/async_common/async_types.hpp`：SDMA、URMA、engine-agnostic `AsyncSession`。
- `repositories/pto-isa/tests/npu/a5/comm/st/testcase/twait/twait_kernel.cpp`：`TNOTIFY/TWAIT` 基本同步和多 rank wait 测试。
- `repositories/pto-isa/demos/baseline/allgather_async/README.md` 与 kernel 文件：SDMA `TPUT_ASYNC/TGET_ASYNC` 和 A5 URMA 路径。
- `repositories/pto-isa/demos/baseline/gemm_basic/README.md`：GEMM 示例、tiling、pipeline scheduling。

### pypto

- `repositories/pypto/README.md`：Python DSL、examples、tests。
- `repositories/pypto/.gitmodules`：`runtime` submodule 指向 `https://github.com/hw-native-sys/simpler`。
- `repositories/pypto/include/pypto/ir/function.h`：`Level`、`Role` 与 `LevelToLinquLevel()` 映射。
- `repositories/pypto/src/codegen/distributed/distributed_codegen.cpp`：只生成最高层 orchestrator Python 入口；同层 SubWorker 和下一层 Orchestrator call lowering。
- `repositories/pypto/python/pypto/runtime/distributed_runner.py`：通过 `simpler.Worker(level=3)` 执行 L3 distributed program，注册 subworker、fork chip workers、run、close。
- `repositories/pypto/tests/st/distributed/test_l3_distributed.py`：HOST orchestrator -> CHIP worker -> SubWorker 的端到端测试。
- `repositories/pypto/tests/st/distributed/test_l3_parallel_reduce.py`：多 chip callable + SubWorker reduce 测试目前被 skip，原因是 runtime support pending。

### HCCL

- `repositories/hccl/include/hccl.h`：公开 `HcclAllReduce`、`HcclBroadcast`、`HcclAllGather`、`HcclSend`、`HcclRecv`、`HcclAlltoAllV` 等 API。
- `repositories/hccl/include/hccl_mc2.h`：MC2/KFC 资源上下文接口。
- `repositories/hccl/src/CMakeLists.txt`：AIV target 包含 all_gather、all_reduce、all_to_all、broadcast、reduce、reduce_scatter、scatter、send、recv。

## PR / Issue Map

| 项目 | 编号 | 状态 | 结论 |
| --- | --- | --- | --- |
| simpler | PR #571 | merged | `examples/workers/l3/ffn_tp_parallel` two-stage tensor-parallel demo。`implemented` |
| simpler | PR #579 | merged | `child_memory`、`TensorKey`、scheduler affinity for device-resident tensors。`implemented` |
| simpler | PR #592 | merged | HCCL backend for comm C API and hardware UT。`implemented` |
| simpler | PR #670 | merged | a2a3/a5 runtime deferred completion support。`implemented` |
| simpler | issue #686 | closed | wait condition 从 kernel registration 推导，而不是 submit-time flag。`implemented`/design change |
| simpler | PR #692 | merged | deferred notification API 对齐。`implemented` |
| simpler | PR #700 | merged | deferred completion context 简化。`implemented` |
| simpler | PR #696 | open | a2a3 SDMA async completion。`emerging` |
| simpler | issue #303 | closed | L1-L4 多卡支持议题；作为早期背景，不直接当作当前架构事实。`stale`/background |
| pypto | PR #611 | merged | Linqu hierarchy runtime distributed C++ codegen 阶段完成。`implemented` |
| pypto | issue #1127 | open | L3 Distributed Programming Interface Design RFC。`emerging` |
| pypto | issue #1189 | open | orchestration-level collectives `pl.all_reduce`、`all_gather`、`all_to_all`。`design-intended` |
| pypto | PR #1227 | open | host_orch `tensor.create` 预初始化，修复 fork 后 POSIX shm visibility。`emerging` |
| pypto | PR #1112 | merged | bump simpler runtime，包含 HCCL/sim backend 和 ChipBootstrapChannel 集成。`implemented` |

## 代表性示例地图

| 示例 | 仓库 | 展示能力 | 状态 |
| --- | --- | --- | --- |
| `examples/workers/l3/multi_chip_dispatch` | simpler | L3 host orchestrator 派发 chip task 和 SubWorker | `implemented` |
| `examples/workers/l3/allreduce_distributed` | simpler | HCCL window scratch、rank window、device barrier、kernel 内 allreduce | `implemented` |
| `examples/workers/l3/ffn_tp_parallel` | simpler | TensorMap stage dependency + cross-rank sum | `implemented` |
| `demos/baseline/gemm_basic` | pto-isa | tile ISA GEMM、tiling、pipeline scheduling | `implemented` |
| `demos/baseline/allgather_async` | pto-isa | SDMA/URMA async communication demo | `implemented` |
| `tests/st/distributed/test_l3_distributed.py` | pypto | DSL 编译后通过 simpler L3 runner 执行 | `implemented` |
| `tests/st/distributed/test_l3_parallel_reduce.py` | pypto | 多 chip callable + SubWorker reduce | `emerging`，测试被 skip |

## 负面发现

- 当前 `simpler` L3/L4 仍主要是本机进程/fork/shared-memory 语义；材料中的 remote L3/RoCE control plane 是目标设计，不是当前已完成能力。
- 当前 `pypto` distributed runner 明确通过 `simpler.Worker(level=3)` 执行；没有看到完整 remote DistWorker control plane。
- HCCL 提供 collective/send/recv 与 window/remote pointer 基础，但本轮没有证据表明 HCCL 本身承担 PTO runtime 的 remote worker 生命周期、callable registry 或 scheduler。
- `pypto` 的多 chip callable + SubWorker reduce ST 测试被 skip，说明该组合仍有 runtime support gap。
- GitHub 复合搜索 PTO-ISA PR 时触发 search operator limit；PTO-ISA 结论主要来自 README、include、demos 和 tests，而不是 PR 历史。

## HCCL 触点

HCCL 在本轮只作为 supporting evidence：它证明底层 collective、send/recv、window 和 kernel target 存在，但不等同于 PTO Runtime 的分布式 control plane。相关页面引用 HCCL 时只说明它支撑 data plane 或 comm window，不把它写成 repo 主体架构。

## 未决问题

- remote L3 的首个可运行 vertical slice 是否会放在 `simpler`、独立 `distributed-runtime`，还是 PyPTO runner 层？
- callable identity 跨 host/remote worker 的稳定 ABI 是 Python pickle、module path、ELF symbol、registry id，还是混合格式？
- `pypto` orchestration-level collectives 会先落到 simpler L3 API，还是直接生成 PTO-ISA comm primitive 调用？
- HCCL window 和 future URMA/RoCE memory registration 之间是否共享抽象，或者保持平台 backend 分离？
- Linqu L4-L6 什么时候从 design-intended 进入源码可验证阶段？
