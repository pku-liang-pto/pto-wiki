# 07. 资料来源与可信边界

本文档不使用编号式证据索引，而是在正文必要位置就地说明来源。本文件说明各类来源的使用边界。

## 1. 本地文件

| 文件 | 使用方式 |
| --- | --- |
| `RUNTIME_OPEN_PROBLEMS.md` | 作为当前 runtime gap 和代码调研的高置信来源 |
| `SEND_RECV_RUNTIME.md` | 作为 Send/Receive Runtime 目标设计草案来源 |
| `chathistory_00.pdf` 到 `chathistory_05.pdf` | 作为讨论、进度、争议、待办线索；不能单独证明代码已实现 |
| `智能纪要：Worker技术方案及后续计划会议 2026年4月15日.pdf` | 作为 Worker 模型、会议结论、待办线索 |
| `20260414 分布式Runtime.pdf` | 图片型 PDF，使用逐页截图和图片理解，不使用 OCR |
| `overview.jpg` | 使用图片理解提取软件栈层次，并重绘为纯文本图 |
| `simpler_distributed_runtime_design.md` | top-level HostWorker / DistWorker 设计输入，来自 `hengliao1972/pypto_top_level_design_documents` |

## 2. GitHub

已使用 GitHub 插件核对：

```text
repo: hw-native-sys/simpler
default branch: main
top-level design: hengliao1972/pypto_top_level_design_documents/simpler_distributed_runtime_design.md
```

已核对 PR/issue：

```text
#571 merged
#579 merged
#592 merged
#670 merged
#686 closed
#692 merged
#696 open
#700 merged
```

已检查主线关键代码路径：

```text
python/simpler/worker.py
src/common/hierarchical/worker_manager.h
src/common/hierarchical/orchestrator.h
src/common/hierarchical/scheduler.cpp
src/common/hierarchical/tensormap.h
src/common/hierarchical/types.h
src/common/platform_comm/comm.h
src/common/platform_comm/comm_context.h
src/a2a3/platform/onboard/host/comm_hccl.cpp
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/pto_async_wait.h
src/a2a3/runtime/tensormap_and_ringbuffer/runtime/pto_completion_ingress.h
```

## 3. 公开资料

公开资料只用于解释背景和官方接口语义，不用于证明 PTO-Runtime 的项目进度。

使用过的公开资料包括：

1. 华为昇腾 HCCL API 文档：
   - [HcclGetRootInfo](https://www.hiascend.com/document/detail/zh/canncommercial/800/apiref/hcclapiref/hcclcpp_07_0005.html)
   - [HcclCommInitRootInfo](https://www.hiascend.com/document/detail/en/canncommercial/800/apiref/hcclapiref/hcclcpp_07_0006.html)
   - HCCL 接口参考中关于 `HcclSend` / `HcclRecv` 同步配对的说明。
2. 华为 Ascend C 文档：
   - [Ascend C 通用约束](https://www.hiascend.com/document/detail/zh/canncommercial/80RC3/apiref/ascendcopapi/atlasascendc_api_07_0004.html)
   - [CCE Intrinsic 地址空间限定符](https://www.hiascend.com/document/detail/zh/CANNCommunityEdition/82RC1/opdevg/cceintrinsicguide/cceprogram_0013.html)
3. CloudMatrix384 论文：
   - [Serving Large Language Models on Huawei CloudMatrix384](https://arxiv.org/abs/2506.12708)

## 4. 图片理解说明

用户明确要求图片型 PDF 不使用 OCR。因此 `20260414 分布式Runtime.pdf` 的处理方式是：

```text
PDF -> page image -> visual interpretation -> structured notes -> pure text diagram
```

已识别内容包括：

1. Worker API：init/run/close/malloc/free。
2. Worker = Orch + Sch + WorkerManager。
3. ChipWorker/SubWorker 两类 child。
4. L6/L5/L4/L3/L2 分层和 SubWorker 混合树。
5. Python orchestration、subworker python、L2 scheduler、AICore kernel、TensorMap/Ring/Regs/GM。
6. fork/shared-memory/mailbox。
7. L4 到 remote L3 的草图。
8. SPMD/SYNC_START/group/rank。

## 5. PTO-ISA 与 hcomm 仓库核对

本次额外拉取了两个公开仓库作为软件栈证据：

```text
.analysis/repos/pto-isa  HEAD 4e27a10
.analysis/repos/hcomm    HEAD 2cbe889
```

`pto-isa` 中已核对的关键文件：

1. `agents/skills/pto-comm-isa-reference/SKILL.md`：通信指令参考，说明 `TPUT_ASYNC` / `TGET_ASYNC` 通过 SDMA/URMA 引擎执行 GM 到 GM DMA，并返回 `AsyncEvent`。
2. `agents/skills/pto-comm-isa-reference/references/async-instructions.md`：说明 `BuildAsyncSession` 的 SDMA/URMA 分支、URMA 仅 Ascend950 / `NPU_ARCH 3510`，以及 workspace 约束。
3. `agents/skills/pto-comm-isa-reference/references/core-types.md`：说明 `DmaEngine::SDMA`、`DmaEngine::URMA` 与 `AsyncEvent` 类型。
4. `demos/baseline/allgather_async/README_zh.md`：说明 A2/A3 demo 使用 SDMA/HCCL，A5 demo 使用 URMA/HCCP V2 Jetty RDMA。

`hcomm` 中已核对的关键文件：

1. `src/legacy/unified_platform/external_system/orion_adapter_hccp.h`：能看到 Jetty 创建、导入、绑定、post send、状态查询等 UB/URMA 风格接口。
2. `src/hccd/hccd_impl_pml.cc`：能看到 tag/data SRQ 创建和销毁逻辑。
3. `src/pub_inc/new/hccl_mem_transport.h`：能看到软件轮询 CQ / AICPU / Jetty 相关枚举。

这些证据可以支撑本文对 PTO-ISA SDMA/URMA 分支和 hcomm/Jetty 数据面基础设施的描述；但仍不能证明 PTO-Runtime 已完成 remote L3 管理面或通用服务器部署。

## 6. Top-level HostWorker / DistWorker 设计文档核对

本次下载并纳入：

```text
.analysis/external_docs/simpler_distributed_runtime_design.md
source: https://github.com/hengliao1972/pypto_top_level_design_documents/blob/main/simpler_distributed_runtime_design.md
downloaded lines: 406
```

该文档的可信边界：

1. 可作为上层/目标设计来源，解释 HostWorker、DistWorker、L3 Phase 2、Linqu runtime 与 simpler 的关系。
2. 可作为“为什么 L3 要同构复用 L2 scope/ringbuffer/tensormap/submit”的证据。
3. 不可直接当作当前主线实现事实；例如它描述的 256B HostSubWorker mailbox 已与当前主线 4096B unified mailbox 不一致。
4. 不可把它的 L4+ future 描述写成当前已完成 multi-host remote runtime。

## 7. 仍需进一步核对的来源

以下内容当前还没有完全核对，不能写成最终事实：

1. `hcomm` / URMA 库是否可以脱离 full CANN 在通用服务器部署。
2. `pypto_top_level_documents/UBL128_serving.md` 中关于超节点和通用服务器的完整设计。
3. PR #696 是否后续合入或被替代。
4. remote L3 PoC 是否已有未公开分支。
5. PTO-ISA / hcomm 在真实硬件上的运行结果；本次只做源码与文档核对，没有运行硬件 demo。
