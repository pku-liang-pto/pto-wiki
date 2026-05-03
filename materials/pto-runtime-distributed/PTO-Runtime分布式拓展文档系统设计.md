# PTO-Runtime 分布式拓展文档系统设计

> 状态：设计草案 v0.1  
> 生成时间：2026-05-03  
> 目标：先设计一套可审阅、可追溯、可持续扩展的学习文档系统，再基于本地资料、代码仓库和在线资料逐步生成正式文档。

## 1. 背景与目标

你当前已了解 PTO-Runtime 的非分布式部分，但需要接手分布式拓展部分。现有材料分散在聊天记录、会议纪要、Markdown 设计草案、图片和 PDF 中；其中部分内容是设计意图，部分是进度记录，部分是代码调研结论，还有一些是尚未确认的假设。

本设计文档定义一个“文档系统”，用于把这些材料整理成一套自包含、证据充分、中文易读、结构化、可视化的学习资料。正式文档不应该只复述聊天记录，而要把它们转化成接手者能直接使用的知识体系：

1. 先补齐硬件、通信、PTO-ISA、PTO-Runtime 的背景模型。
2. 再解释分布式拓展为什么需要做，以及它在现有 runtime 中打破了哪些假设。
3. 然后按特性拆解设计、代码路径、当前进度、已合入能力、未合入能力和风险。
4. 最后输出后续开发任务、验证任务和需要对齐的问题。

## 2. 本地资料盘点

当前目录内可用资料如下：

| 资料 | 类型 | 当前可读性 | 主要用途 |
| --- | --- | --- | --- |
| `RUNTIME_OPEN_PROBLEMS.md` | Markdown | 已可直接解析 | 当前 runtime 架构的四个核心 gap：远端 L3 管理、Callable 注册、child worker 异步通信、platform 解耦 |
| `SEND_RECV_RUNTIME.md` | Markdown | 已可直接解析 | Send/Receive Runtime 的统一 API、后端矩阵、run_loop、路线图 |
| `chathistory_00.pdf` 到 `chathistory_05.pdf` | PDF 聊天记录 | 已成功转文本 | 项目进度、PR 演进、讨论分歧、开放问题、负责人线索 |
| `智能纪要：Worker技术方案及后续计划会议 2026年4月15日.pdf` | PDF 会议纪要 | 已成功转文本 | Worker 分层模型、内存管理、通信机制、编程范式、待办 |
| `20260414 分布式Runtime.pdf` | 图片型 PDF | `pdftotext` 为空 | 需要通过截图和图片理解逐页解读，不使用 OCR；可能是关键设计图和评审材料 |
| `overview.jpg` | 图片 | 需要视觉解读 | 用作架构图证据或重绘依据 |

已生成的中间文本位于 `.analysis/pdf_text/`，仅作为分析缓存，不作为正式交付文档。

## 3. 已识别的关键事实

以下事实来自本地资料，正式文档需要逐条引用原始来源。

### 3.1 PTO-Runtime 分层与 Worker 模型

会议纪要指出，Worker 有 Cheap Worker 和 SUB Worker 两类。Cheap Worker 从 L2 层开始，L2 本身可视为一个 cheap worker；SUB Worker 用于运行 Python 函数或 C++ 程序，是软件概念，不需要真实 device ID。高层可以通过 cheap worker 与 SUB worker 组合成非同构的分层模型。

聊天记录进一步说明，`src/common` 更偏 L3+ host runtime，`src/a2a3` 和 `src/a5` 更偏 L2 runtime；历史上 `dist_orchestrator`、`orchestrator`、host/chip/device/L2/L3 等命名混杂，正式文档需要先建立术语表，避免读者被目录名误导。

### 3.2 当前 runtime 的核心缺口

`RUNTIME_OPEN_PROBLEMS.md` 已把当前 runtime 的 gap 收敛成四类：

1. 没有通过 RoCE 网络管理 Next Level Worker 的能力。
2. 没有完整注册 Callable 的能力，尤其 L2 / mailbox / AICPU 侧没有下沉。
3. 没有和 child worker 异步通信的能力。
4. 基础 platform 没有干净解耦，Runtime / ACL / Comm 共享单一 `.so` ABI。

这些不是孤立问题。远端 L3 管理会牵连 Callable 注册；send/recv 长循环会牵连 child worker 异步通信；通用服务器无 CANN 运行的要求会牵连 platform 解耦。

### 3.3 已讨论或已推进的能力

聊天记录显示，项目已经围绕以下能力有过设计和 PR 推进：

| 能力 | 资料线索 | 状态判断 |
| --- | --- | --- |
| HCCL / comm window / bootstrap | PR #571、#592、会议纪要、聊天记录 | 基座曾被拆小推进，涉及 communicator、window、CommDeviceContext |
| worker malloc/free/copy | PR #579 线索 | 用于辅助后续分布式能力，后续又讨论 L2 ring level 0 驻留内存 |
| deferred completion / async runtime | PR #670、#692、#700、issue #686 线索 | 已合入过若干接口和统一 submit_task 方向，仍有 API 暴露和 PTO-ISA 对齐问题 |
| SDMA async example | PR #696 线索 | SDMA 示例被补充，URMA completion 机制不同，仍需统一 poll 后端 |
| 指定 worker 调度 | 廖博反馈、聊天记录 2026-04-18 | L3+ submit orch task 需要增加 worker ID 参数，`-1` 随机，`>=0` 指定 |
| logical rank / physical device 映射 | 聊天记录 2026-04-15 | 需要区分任务内 logical rank 与物理 device id |
| 远端 L3 / RoCE 自通信 | 聊天记录 2026-04-29 | 被列为 top 问题；可用 16 卡节点假装两个 8 卡 host 做验证 |
| 通用服务器运行 simpler | 聊天记录 2026-04-30 | 需要确认 UB/URMA 通信库是否可脱离 CANN 部署 |

正式文档要把这些状态分成“已合入事实”“PR/讨论线索”“未验证假设”三类，避免把聊天中的判断写成确定结论。

## 4. 目标读者与阅读路径

目标读者是“了解 PTO-Runtime 非分布式部分、但不了解华为硬件架构、超节点分布式架构、HCCL、PTO-ISA、分布式拓展进度”的接手开发者。

推荐阅读路径：

```text
+----------------------+
| 00 总览与阅读路径    |
+----------+-----------+
           |
           v
+----------------------+
| 01 硬件与超节点背景 |
+----------+-----------+
           |
           v
+-------------------------------------------+
| 02 CANN / HCCL / HCOMM / URMA / RoCE 软件栈 |
+----------+--------------------------------+
           |
           v
+--------------------------+
| 03 PTO-ISA 通信与异步原语 |
+----------+---------------+
           |
           v
+-------------------------+
| 04 PTO-Runtime 原有架构 |
+----------+--------------+
           |
           v
+--------------------------+
| 05 分布式拓展目标蓝图   |
+----------+---------------+
           |
           v
+----------------------------------------+
| 06 特性详解：Worker / Comm / Async / SendRecv |
+----------+-----------------------------+
           |
           v
+--------------------------+
| 07 当前真实进度与来源说明 |
+----------+---------------+
           |
           v
+-------------------------+
| 08 后续开发任务与风险   |
+-------------------------+
```

该路径先让读者理解系统所在的硬件和通信语境，再进入 PTO-ISA 和 runtime，最后才讨论具体分布式特性。

## 5. 正式文档拆分方案

正式文档建议放在 `docs/pto-runtime-distributed/` 下，采用多文件组织。

### 5.1 `00_README.md`：总览与导航

用途：让读者在 15 分钟内知道这套文档是什么、怎么读、读完能解决什么问题。

核心章节：

1. 项目一句话解释。
2. 为什么 PTO-Runtime 需要分布式拓展。
3. 文档地图。
4. 术语速查。
5. 当前最重要的结论。
6. 证据等级说明。

### 5.2 `01_hardware_and_supernode.md`：华为硬件与超节点背景

用途：补齐 Ascend / Kunpeng / UB / RoCE / HCCS / 超节点等背景。

核心章节：

1. Ascend NPU、AICore、AICPU、GM、cache 的最小心智模型。
2. 单卡、单机多卡、多机、超节点之间的区别。
3. CloudMatrix / supernode 的逻辑：为什么把很多 NPU 当成一个大资源池。
4. UB、HCCS、RoCE、RDMA 各自解决什么问题。
5. CPU、NPU、通信网卡、host process、device task 的位置关系。
6. 对 PTO-Runtime 设计的影响。

可视化：

```text
+------------------------+       +--------------------------+
| Host CPU / L3+ Runtime | ----> | AICPU / L2 Orchestrator |
+------------------------+       +------------+-------------+
                                               |
                                               v
                                  +--------------------------+
                                  | AICore / L1 Kernel      |
                                  +------------+-------------+
                                               |
                                               v
                                  +--------------------------+
                                  | GM / Comm Window        |
                                  +------------+-------------+
                                               |
                              HCCS / UB / RoCE / RDMA
                                               |
                                               v
                                  +--------------------------+
                                  | Peer Device GM          |
                                  +--------------------------+
```

### 5.3 `02_distributed_software_stack.md`：分布式软件栈

用途：解释 CANN、ACL、HCCL、HCOMM、URMA、RoCE verbs 与 PTO-Runtime 的边界。

核心章节：

1. CANN 与 ACL：运行时、stream、device memory、host/device 交互。
2. HCCL：集合通信、P2P、rank、communicator、window。
3. HCOMM / RDMA service：更底层通信封装。
4. URMA / UB：A5 / 超节点相关的通信语义。
5. RoCE：跨 host 的 RDMA 网络语义。
6. 哪些能力属于 PTO-Runtime，哪些能力应交给底层库。

证据来源优先级：

1. 华为/昇腾官方 CANN 与 HCCL 文档。
2. 代码仓库中的 `hccl.h`、`comm_hccl.cpp`、`rdma_service`、`urma_*`。
3. 本地聊天记录中关于接口使用方式的讨论。

### 5.4 `03_pto_isa_stack.md`：PTO-ISA 与通信/异步原语

用途：解释 PTO-Runtime 依赖 PTO-ISA 的哪些能力。

核心章节：

1. PTO-ISA 在系统中的层级。
2. TLOAD / TSTORE / TNOTIFY / TWAIT / TPUT_ASYNC / TGET_ASYNC 的用途。
3. AsyncEvent、completion counter、CQ polling、engine 类型。
4. SDMA 与 URMA completion 的差异。
5. PTO-ISA 更新对 runtime API 的影响。

重点解释聊天记录中的判断：SDMA async 可能只需要最后一个 event；URMA completion 需要查 CQ；runtime 应有统一 poll API，但后端按 engine 分发。

### 5.5 `04_current_pto_runtime.md`：现有 PTO-Runtime 架构

用途：让读者理解非分布式 runtime 如何运行，以及为什么分布式会破坏原假设。

核心章节：

1. Worker、Orchestrator、TaskArgs、TensorArg、HeapRing、Mailbox。
2. L3+ host runtime 与 L2 chip runtime 的职责。
3. fork、shared memory、mailbox、callable registry 的当前工作方式。
4. 当前同步 dispatch 路径。
5. 当前架构的共享 VA 假设。
6. 当前架构不能自然支持远端 L3 的原因。

主要来源：`RUNTIME_OPEN_PROBLEMS.md` 与后续代码仓库。

### 5.6 `05_distributed_extension_blueprint.md`：分布式拓展目标蓝图

用途：给出分布式拓展的总架构图和关键设计决策。

核心章节：

1. 总目标与非目标。
2. 分布式 Worker 拓扑：L4 -> L3 -> L2 -> L1。
3. logical rank 与 physical device id。
4. remote next-level worker 管理。
5. comm domain / comm window / bootstrap。
6. callable registration 的分层设计。
7. persistent run_loop 与 send/recv runtime。
8. platform 解耦策略。
9. 蓝图中的能力边界：哪些是必须实现，哪些是未来扩展。
10. 蓝图到当前进度的映射表。

可视化：

```text
                         +-------------------------+
                         | L4 POD / Parent Runtime |
                         +-----------+-------------+
                                     |
                 +-------------------+-------------------+
                 |                                       |
                 v                                       v
      +----------------------+              +----------------------+
      | Local L3 Host Worker | <----------> | Remote L3 Host Worker|
      +----------+-----------+  RoCE/URMA   +----------+-----------+
                 |             control                 |
                 |              plane                  |
                 v                                     v
      +----------------------+              +----------------------+
      | L2 Chip Worker 0..N  | <----------> | Remote L2 Chip 0..N  |
      +----------+-----------+ HCCL/HCOMM   +----------+-----------+
                 |            comm window              |
                 v             data plane              v
      +----------------------+              +----------------------+
      | AICore Kernels       |              | AICore Kernels       |
      +----------------------+              +----------------------+
```

### 5.7 `06_feature_deep_dives.md`：重点特性详解

用途：把每个特性拆成“需求、设计、代码、状态、测试、风险”。

建议章节：

1. Worker malloc/free/copy 与驻留内存。
2. HCCL window 与 bootstrap。
3. logical rank / physical device 映射。
4. 指定 worker 调度。
5. Callable 注册与远端注册。
6. deferred completion 与异步完成。
7. Send/Receive Runtime 与 persistent run_loop。
8. platform ABI 解耦。

每节统一模板：

```text
背景问题
设计目标
关键接口
数据结构
执行流程
代码位置
当前状态
测试方式
已知风险
后续任务
证据索引
```

### 5.8 `07_progress_and_timeline.md`：当前真实进度与时间线

用途：把聊天记录中的 PR、issue、合入状态、讨论结论整理成可验证时间线。

核心章节：

1. 2026-04-13 到 2026-04-30 时间线。
2. PR / issue 索引：#522、#560、#571、#579、#592、#640、#670、#686、#692、#696、#700 等。
3. 已合入能力。
4. 未完成能力。
5. 仍需代码确认的状态。

注意：因为当前目录不是 git 仓库，正式文档生成时需要接入 `hw-native-sys/simpler`、`pto-isa`、`hcomm`、`hccl` 等仓库或 GitHub/GitCode 链接，否则 PR 状态只能标为“聊天记录线索”。

### 5.9 `08_development_plan.md`：后续开发任务

用途：把开放问题转成可执行任务。

建议分组：

1. 资料确认任务。
2. 设计对齐任务。
3. Runtime 实现任务。
4. PTO-ISA 对齐任务。
5. HCCL / HCOMM / URMA 验证任务。
6. 测试与 benchmark 任务。
7. 文档维护任务。

每个任务包含：

```text
任务名
背景
依赖
输入
输出
验收标准
风险
证据来源
建议负责人或相关讨论人
```

### 5.10 `09_source_notes.md`：资料来源与使用说明

用途：说明正式文档使用了哪些资料，以及不同来源的可信边界。该文件不是逐条编号索引，也不是正文引用的跳转表；正文应在必要位置直接说明来源。

证据类型：

| 等级 | 来源 | 可用于 |
| --- | --- | --- |
| A | 代码仓库、官方文档、已合入 PR | 确定事实 |
| B | 本地 Markdown 调研、会议纪要 | 高置信设计背景 |
| C | 聊天记录 | 进度、意图、争议、待确认问题 |
| D | 第三方文章、论文 | 背景补充，需要标注外部推断 |

正文写法示例：

```text
根据 `RUNTIME_OPEN_PROBLEMS.md` 对当前 runtime 的代码调研，现有 L4 -> L3 dispatch 建立在 fork 和共享 VA 假设上。

根据 2026-04-17 的聊天记录，comm window + bootstrap 的流程被描述为：每个 L2 分配 window，L3 收集后再把 context 下发给各 L2。

根据华为昇腾 HCCL API 文档，HcclSend / HcclRecv 是通信域内的 P2P 接口，不能直接等同于本项目设计中的 persistent RecvQueue。
```

这种写法要求来源贴近结论，但不引入额外编号系统，避免读者在正文和索引之间来回跳转。

## 6. 资料处理流水线

正式生成文档时建议按以下流程推进：

```text
[收集本地资料]
        |
        v
[PDF 文本抽取]
        |
        v
[图片型 PDF 截图 / 图片理解]
        |
        v
[聊天记录事件抽取]
        |
        v
[代码仓库检索]
        |
        v
[官方资料补证]
        |
        v
[整理来源说明]
        |
        v
[生成分章节文档]
        |
        v
[grill-me 逐轮对齐]
        |
        v
[修订与冻结版本]
```

### 6.1 PDF 与图片处理

1. 对可抽文本 PDF 使用 `pdftotext -layout`。
2. 对 `20260414 分布式Runtime.pdf` 这类图片型 PDF，使用逐页截图和图片理解，不使用 OCR。
3. 对 `overview.jpg`，需要判断是否为架构图；如果是，正式文档中应重绘为纯文本/ASCII 图，并保留原图引用。

### 6.2 聊天记录处理

聊天记录不能直接当成“事实”，需要抽取为：

1. 决策：例如“L3+ submit 增加 worker ID 参数”。
2. 进度：例如“PR #670 merged”。
3. 风险：例如“URMA completion 与 SDMA 不同”。
4. 待确认：例如“通用服务器是否可部署 UB Comm lib”。
5. 术语解释：例如“src/common 是 L3+，src/a2a3/a5 是 L2”。

### 6.3 代码仓库处理

当前目录没有 git 仓库。正式文档要达到“证据充分”，至少需要读取：

1. `hw-native-sys/simpler`
2. `pto-isa`
3. `hcomm`
4. `hccl` 或 CANN HCCL header / docs
5. 可能的 `pypto_top_level_documents`

每个代码结论必须带文件路径、函数名、必要时带 commit 或 PR 编号。

### 6.4 在线资料处理

在线资料只用于补齐公开背景，不替代项目内部代码事实。优先使用：

1. 华为/昇腾官方 CANN、HCCL、Ascend C 文档。
2. 官方或项目仓库中的接口定义、示例。
3. CloudMatrix384 / supernode 论文，用于解释超节点背景。
4. 其他第三方资料只能作为辅助，并标注可信度较低。

## 7. 可视化规范

正式文档至少应包含以下图：

1. PTO-Runtime 分层图。
2. L4/L3/L2/L1 worker 调度图。
3. local fork/shared-memory 模型与 remote worker 模型对比图。
4. HCCL / comm window / bootstrap 时序图。
5. Callable 注册路径图。
6. deferred completion 状态机。
7. Send/Receive run_loop 数据流图。
8. platform 解耦前后 ABI 图。
9. 当前进度路线图。

使用纯文本/ASCII 风格的可视化图，不使用 Mermaid。图应能在普通 Markdown、终端和纯文本复制场景中保持可读。对于复杂拓扑图，可以用框线、箭头、缩进、泳道、时序列表和表格组合表达；必要时保留原始图片或截图作为资料来源，但正式文档中的核心解释图应有纯文本版本。

## 8. 证据与写作原则

正式文档必须遵守以下原则：

1. 自包含：读者不需要打开聊天记录才能理解正文。
2. 证据充分：每个关键事实给来源。
3. 区分事实和推断：聊天记录中的想法不能写成已实现事实。
4. 中文直观：先讲人话，再给代码和术语。
5. 多层结构：每个文件至少有清晰章节和小节。
6. 面向接手开发：每章结尾给“你需要记住什么”和“接下来该看什么”。
7. 面向实现：设计章节必须落到接口、数据结构、代码位置和验收测试。

## 9. 设计风险

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| 当前目录缺代码仓库 | 无法确认 PR 合入状态和真实代码路径 | 接入 GitHub/GitCode 仓库；所有聊天线索先标注为待代码确认 |
| 20260414 PDF 无文本 | 可能遗漏关键设计 | 做逐页截图和图片理解，不使用 OCR |
| 外部资料版本变化快 | CANN/HCCL/URMA 接口可能和当前项目依赖版本不一致 | 正式文档写明资料版本和访问日期 |
| 聊天记录有口语和临时判断 | 容易误写成确定结论 | 使用证据等级；C 类来源只支撑“讨论过/计划过” |
| 术语过多且命名历史混乱 | 接手者理解成本高 | 第一章提供术语表；每章局部重复解释关键术语 |
| 文档过于庞大 | 难以维护 | 按文件拆分，建立证据索引和路线图 |

## 10. 首轮 grill-me 对齐

按照 `grill-me` 的要求，下面先问第一个必须对齐的问题，并给出推荐答案。

**问题 1：这套文档的第一目标应该是“快速接手开发”，还是“完整背景学习”？**

推荐答案：第一目标应是“快速接手开发”，但开头必须提供足够完整的背景学习路径。原因是你已经要接手分布式拓展，真正需要的是能指导后续开发、review 和排障的文档；硬件、HCCL、PTO-ISA、超节点背景都应服务于理解 runtime 设计和开发任务，而不是写成百科。落地上，`00_README.md` 和每章末尾的“开发者需要记住什么”应优先保证接手效率；`01` 到 `03` 章负责补齐背景。

用户已于 2026-05-03 确认同意该优先级。

**问题 2：正式文档应该优先冻结“当前真实进度”，还是优先冻结“目标设计蓝图”？**

推荐答案原本是优先冻结当前真实进度，以降低把“已合入”“PR 中”“讨论中”“希望实现”混写的风险。

用户于 2026-05-03 修正该方向：应先冻结目标设计蓝图，再详细描述当前真实进度和未办事项。

已采纳决策：正式文档的主叙事采用“目标蓝图优先”。也就是先回答最终系统应该是什么、为什么这么设计、关键模块之间如何配合；随后用进度章节逐项标注每个蓝图能力当前是否已实现、已合入、仍在 PR/issue、还是只停留在讨论阶段。为避免蓝图误导读者，所有蓝图章节必须包含“当前状态映射”和“证据等级”。

**问题 3：目标蓝图应该按“系统层级”组织，还是按“开发特性”组织？**

推荐答案：蓝图按系统层级组织，特性详解按开发特性组织。

用户已于 2026-05-03 确认同意该双结构。

已采纳决策：`05_distributed_extension_blueprint.md` 负责按系统层级讲清楚整体架构，例如硬件拓扑、通信软件栈、PTO-ISA、PTO-Runtime、Worker 层级、control plane / data plane；`06_feature_deep_dives.md` 负责按开发特性拆解实现，例如 remote L3、Callable 注册、comm window、deferred completion、send/recv run_loop、platform 解耦。这样读者先获得全局模型，再进入可执行任务。

**问题 4：文档中的证据标准要不要非常严格到“每个关键结论都必须带来源编号”？**

推荐答案原本是关键结论使用来源编号，并在独立证据索引中展开。

用户于 2026-05-03 修正该方向：不要写成分离的编号结构，应在文档必要位置直接写“根据某文档提到的 xxx”或“根据聊天消息 yyy”，不需要编号，也不需要独立证据索引。

已采纳决策：正式文档采用“就地来源说明”。正文优先保持学习材料的连续可读性，在关键结论附近直接说明来源，例如“根据 `RUNTIME_OPEN_PROBLEMS.md` 的代码调研……”“根据 2026-04-17 的聊天记录……”“根据华为昇腾 HCCL API 文档……”。独立 `09_source_notes.md` 只作为资料来源与可信边界说明，不承担逐条证据编号索引功能。

**问题 5：正式文档要不要把“外部公开资料”放进主线叙事里，还是只作为背景补充？**

推荐答案：外部公开资料只用于补齐背景和术语，不作为项目真实状态的主证据。

用户已于 2026-05-03 确认同意该边界。

已采纳决策：华为硬件、CANN、HCCL、HCOMM、URMA、RoCE、CloudMatrix/超节点等公开资料可以进入背景章节和术语解释，用于说明“概念是什么”“官方接口语义是什么”“业界或公开资料如何描述超节点”。但 PTO-Runtime 分布式拓展的真实设计、实现进度、PR 状态和后续任务，必须以本地设计文档、聊天记录、会议纪要、仓库代码、PR/issue 为准。公开资料不能用来证明项目已实现某能力。

**问题 6：正式文档是否允许在多个章节重复解释同一个核心概念，比如 rank、comm window、AICPU、deferred completion？**

推荐答案：允许必要重复，但每次重复要服务当前章节。

用户已于 2026-05-03 确认同意该重复策略。

已采纳决策：正式文档为了自包含和易读，允许在不同章节重复解释核心概念，但不能机械复制同一段定义。每次重复都应贴合当前章节：硬件背景章解释 AICPU 的硬件位置，runtime 章解释 AICPU orchestrator 的职责，异步完成章解释 AICPU 如何观察 completion counter 或 CQ 状态。这样读者可以从任一特性章节读起，不需要频繁跳转。

**问题 7：正式文档的代码解释要深入到什么粒度？**

推荐答案：关键路径必须到文件、类、函数、核心字段；普通背景到模块级即可。

用户已于 2026-05-03 确认同意该代码粒度。

已采纳决策：对分布式拓展关键路径，例如 `worker.py`、mailbox、WorkerManager、Orchestrator、CommContext、deferred completion、send/recv runtime，正式文档需要写到文件、类、函数和关键字段层级，并解释调用关系和状态变化。对 HCCL、CANN、URMA、PTO-ISA 等背景栈，如果不是本项目直接改动点，则写到接口语义和依赖边界即可。对后续开发任务，需要说明预计改动的文件或模块，以及改动原因。

**问题 8：生成正式文档前，是否必须先核对真实代码仓库和 PR 状态？**

推荐答案：必须。否则不能把“当前进度”和“后续任务”写到可信级别。

用户已于 2026-05-03 确认同意该门槛。

已采纳决策：正式文档可以先基于本地资料撰写目标蓝图和背景章节，但涉及当前进度、已合入能力、真实代码路径、后续开发任务的章节，必须先核对真实代码仓库和 PR/issue 状态。尤其需要核对 `hw-native-sys/simpler` 中 PR #571、#579、#592、#670、#692、#696、#700 等状态与改动，检查 `worker.py`、`worker_manager.cpp`、`orchestrator.h`、`comm_hccl.cpp`、AICPU runtime 等关键文件是否与本地资料一致，并确认 PTO-ISA 最新 async event / URMA completion 机制。

**问题 9：正式文档是否要把“设计争议和被否决方案”也写进去？**

推荐答案：要写，但放在每个特性章节的“设计取舍”小节，不要单独堆成争议史。

用户已于 2026-05-03 确认同意该写法。

已采纳决策：正式文档需要记录关键设计取舍，尤其是那些会影响后续实现路线和 review 判断的分歧。例如为什么不能继续依赖裸指针和 fork-COW 表达 callable，为什么 HCCL send/recv 不能直接等同于 persistent `RecvQueue`，为什么 comm window 需要 bootstrap 或等价机制，为什么 SDMA counter 与 URMA CQ polling 需要统一抽象但不同后端实现，以及为什么通用服务器无 CANN 运行要求会倒逼 platform 解耦。这些内容放入对应特性的“设计取舍”小节，不单独写成争议时间线。

**问题 10：正式交付物是否只需要 Markdown 文档，还是还需要导出 PDF/图片资产？**

推荐答案原本是主交付物用 Markdown，多数图用 Mermaid，暂不强制导出 PDF。

用户于 2026-05-03 修正该方向：不要使用 Mermaid，使用纯文本的图片可视化。

已采纳决策：正式文档主交付物仍使用 Markdown，但所有核心图都使用纯文本/ASCII 风格表达，不使用 Mermaid。纯文本图需要能在普通 Markdown、终端、代码 review 和纯文本复制场景中保持可读。复杂拓扑可以用框线、箭头、缩进、泳道、时序列表和表格组合表达；原始图片或截图可作为资料来源保留，但正文解释图必须有纯文本版本。

**问题 11：正式文档是否需要包含“术语中英对照 + 项目内别名/历史命名”？**

推荐答案：需要，而且应该放在总览和每章局部术语表里。

用户已于 2026-05-03 确认支持该要求。

已采纳决策：正式文档必须包含全局术语中英对照，并记录项目内别名、历史命名和容易误解的目录名。例如 L2/L3、chip worker、cheap worker、SUB worker、dist_orchestrator、orchestrator、rank、logical child id、device id、comm window、HCCL window、UB、URMA、RoCE、HCCS 等。`00_README.md` 放全局术语表；各章节在首次引入复杂术语时，用一句贴合当前上下文的话重新解释。

**问题 12：正式文档是否要提供两条路线：“学习路线”和“开发接手路线”？**

推荐答案：要。

用户已于 2026-05-03 确认支持该双路线。

已采纳决策：`00_README.md` 开头必须提供两条阅读路径。学习路线面向补齐背景，顺序是硬件与超节点、分布式软件栈、PTO-ISA、当前 PTO-Runtime、分布式目标蓝图。开发接手路线面向尽快进入工作，顺序是目标蓝图、当前真实进度、未办事项、关键代码路径、测试与验证方法。两条路线共享同一套文档，只是入口顺序不同。

**问题 13：正式文档做到什么程度才算“完成第一版”？**

推荐答案：第一版完成标准包含六条：目标蓝图完整、背景自包含、进度可信、任务可执行、图示可读、来源就地说明。

用户已于 2026-05-03 确认同意，并补充要求：图片格式的 PDF 需要经过图片理解，不要使用 OCR。

已采纳决策：第一版完成标准如下：

1. 目标蓝图完整：能解释最终分布式 PTO-Runtime 应该如何分层、通信、调度、注册 callable、处理异步完成。
2. 背景自包含：不了解华为硬件、HCCL、PTO-ISA 的人也能读懂主线。
3. 进度可信：已核对 GitHub/GitCode 仓库和 PR 状态，区分已合入、未合入、讨论中。
4. 任务可执行：后续开发任务有依赖、改动范围、验收标准。
5. 图示可读：所有关键架构和流程都有纯文本/ASCII 可视化图。
6. 来源就地说明：关键结论旁边能看出来自文档、聊天、代码、PR 还是公开资料。
7. 图片型 PDF 处理正确：`20260414 分布式Runtime.pdf` 这类图片格式资料使用逐页截图和图片理解，不使用 OCR。

## 11. 下一步计划

1. 与你完成多轮 grill-me 对齐，冻结文档系统结构和证据标准。
2. 对 `20260414 分布式Runtime.pdf` 做逐页截图和图片理解，不使用 OCR。
3. 接入或下载相关代码仓库，核对 PR、issue、文件路径、接口实现。
4. 生成 `docs/pto-runtime-distributed/` 下的正式多文件文档。
5. 对每个章节做就地来源说明和可视化补强。
