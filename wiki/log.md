# Wiki Log

Append-only chronological record of durable wiki maintenance operations.

Format:

```text
## [YYYY-MM-DD] <operation> | <title>
```

Operations include `lookup-update`, `repo-profile`, `topic-synthesis`, `dependency-analysis`, `policy-update`, and `navigation-update`.

---

## [2026-05-19] topic-synthesis | NVIDIA distributed communication overview

新增 [NVIDIA Distributed Communication](./topics/nvidia-distributed-communication.md) 和 [NVIDIA Distributed Communication Evidence](./evidence/nvidia-distributed-communication.md)，基于 NVIDIA 官方 CUDA、NCCL、GPUDirect RDMA、NVSHMEM、Multi-Node NVLink/IMEX、UCX 和 NVLink Domain 文档，整理 NVIDIA 多机多卡通信方式，并把它定位为 PTO-CANN distributed runtime 的外部平台对照背景。

## [2026-05-03] policy-update | Add wiki organization and health rules

Added reusable organization rules based on the plain-Markdown wiki maintenance pattern from [SamurAIGPT/llm-wiki-agent](https://github.com/SamurAIGPT/llm-wiki-agent), while intentionally excluding graph-data requirements.

## [2026-05-03] policy-update | Add document material ingestion rules

Added reusable workflow and skill coverage for updating the wiki from document files, folders, and zip archives without committing raw supplied materials.

## [2026-05-04] source-ingestion | PTO Runtime distributed material bundle

将用户提供的 `materials/pto-runtime-distributed.zip` 作为原始输入检查，排除 archive metadata files，并在用户决定公开材料后，把可阅读 Markdown 副本放入 [Materials / PTO Runtime Distributed](./materials/pto-runtime-distributed/index.md)。checksum 和材料覆盖记录在 topic-scoped evidence ledgers, starting with [Distributed Execution Evidence](./evidence/distributed-execution.md)。

## [2026-05-04] repo-profile | simpler, pto-isa, pypto documentation pass

基于已检查的 local repository snapshots 和 distributed runtime material bundle，新增 [simpler](./repositories/simpler.md)、[pto-isa](./repositories/pto-isa.md)、[pypto](./repositories/pypto.md) repository profiles。

## [2026-05-04] topic-synthesis | PTO distributed execution synthesis

新增 [Examples Feature Map](./topics/examples-feature-map.md)、[Distributed Execution](./topics/distributed-execution.md)、[Lingqu Level Map](./topics/lingqu-level-map.md)、[Distributed Execution Terms](./concepts/distributed-execution-terms.md)。同步更新 overview 和 toolchain navigation，区分已实现的 single-host L3 behavior 与 `design-intended` remote L3 behavior。

## [2026-05-04] repo-profile | Add non-distributed foundations after PR review

根据 PR review，补充 [simpler](./repositories/simpler.md) 的 L0-L2 Ascend launch path、`tensormap_and_ringbuffer` runtime 和 L2 examples；补充 [pto-isa](./repositories/pto-isa.md) 的 tile/programming-model、baseline/CPU/kernel examples；补充 [pypto](./repositories/pypto.md) 的普通 DSL、parser、pass pipeline、compile/run path。同步扩展 topic-scoped evidence ledgers 的非分布式基础证据。

## [2026-05-04] navigation-update | Replace sources with topic evidence ledgers

将 `wiki/sources/` 替换为 [Evidence](./evidence/) 区域。Evidence pages 按 topic 组织，用于记录 materials、GitHub references、repository anchors、claim maps、negative findings 和 open questions；raw materials 仍留在 `materials/` workspace。

## [2026-05-04] review-update | Add non-distributed and maintainer reading layers

根据新一轮 PR review，新增 [Basic Terms](./concepts/basic-terms.md)、[Non-Distributed Execution](./topics/non-distributed-execution.md) 和 [Developer Takeover Guide](./topics/developer-takeover-guide.md)；将 Lingqu 拼写修正为 human-facing spelling；重写 [Examples Feature Map](./topics/examples-feature-map.md)，按 beginner-to-expert、LLM concept、common example family、optimization technique 和 missing distributed complete NN TODO 组织。

## [2026-05-04] policy-update | Position wiki beyond distributed-only scope

将“本 wiki 不能只覆盖 distributed features”写入 `AGENTS.md`、wiki policy、topic workflow、health checks、templates 和 [Usage](./usage.md)。明确 non-distributed foundations 是必备基础，examples 是 first-class documentation，需要 background、progression、cross-repo comparison、optimization notes 和 missing-example TODO/status。

## [2026-05-04] topic-synthesis | Close Phase 2 wiki synthesis gaps

补齐 [Examples Feature Map](./topics/examples-feature-map.md) 的 run surface、environment assumptions 和 not-run caveats；扩展 [Distributed Execution Terms](./concepts/distributed-execution-terms.md) 的 cross-repository name map；在 repository profiles 中补充 evidence-based interpretation，明确 non-distributed foundations 与 distributed extension 的阅读边界。

## [2026-05-04] review-update | Add role-based wiki content review and fixes

新增 `.agents/agents/` reviewer profiles，并根据 project-newbie、next-maintainer、examples-first developer、evidence-auditor 四类反馈补充 newcomer/examples navigation、project documentation status、glossary/CANN foundation、maintainer action tables、repo Try First blocks、GitHub evidence URLs、material manifest 和 status-label centralization。

## [2026-05-04] review-update | Reposition wiki as standalone learning material

根据 PR review，明确 wiki 的主要形态不是外部资料学习指南，而是可独立阅读的 synthesized learning material。更新 AGENTS、wiki organization/source citation policies 和 workflows，要求 topic/repository pages 先用 prose/diagram/example 解释知识，再用 citations/evidence ledgers 支撑审计；重写 overview、developer takeover guide、examples map、non-distributed execution 和 repo profiles 的关键段落，减少“读别处”的表达。

## [2026-05-04] policy-update | Decouple wiki content from agent rules

新增 `.agents/policies/wiki-content-boundary-policy.md` 和 `.agents/workflows/agent-command-reference.md`，将 human-agent command patterns、placement rules、standalone-learning quality gates 和 reusable process guidance 收拢到 `.agents/`。精简 [Usage](./usage.md)、area indexes 和 overview 中的 agent/process wording，使 rendered wiki 主要承载 PTO-CANN target-set knowledge。

## [2026-05-04] review-update | Strengthen standalone learner risks and simpler docs synthesis

根据 wiki-only learner review，新增 [simpler Runtime Architecture](./topics/simpler-runtime-architecture.md)，把 `simpler/docs/` 的 L2 三程序模型、L3+ component composition、TaskArgs data flow、TensorMap/ring、Scheduler、WorkerManager、THREAD/PROCESS mode 和 worker examples 合成到 wiki。同步扩展 [Basic Terms](./concepts/basic-terms.md)、[Examples Feature Map](./topics/examples-feature-map.md)、[Distributed Execution](./topics/distributed-execution.md)、[CANN Foundation](./concepts/cann-foundation.md) 和 evidence claim maps，使示例、基础概念、status labels 和 evidence summaries 更接近 self-contained learning material。

## [2026-05-04] review-update | Normalize material whitespace before merge

清理 tracked material extraction 中触发 `git diff --check` 的 trailing whitespace，并同步更新 [Distributed Execution Evidence](./evidence/distributed-execution.md) 中对应 extracted file checksums。Archive checksum 保持不变。

## [2026-05-05] navigation-update | Public learning navigation and examples area

将 public top nav 和 sidebar 对齐为 Home、Repositories、Examples、Topics、Concepts、Materials。新增 [Examples](./examples/) / [PTO Examples](./examples/pto/) 区域，并按 example granularity 拆成 hello/elementwise、GEMM/FFN、softmax/attention、complete models、distributed runtime 和 missing roadmap；run surface 与 source comparison 跟随每个具体 example chapter。将 source materials 移动到 [Materials](./materials/) 作为 public source-material library；新增 wiki writing style policy，要求 public narrative 以中文为主、保留 English technical identifiers、chapter-style、prose-first、self-contained、concise but information-rich。

## [2026-05-05] review-update | Comprehensive standalone writing pass

根据 rendered wiki 内容 review，对 public learning pages 和 evidence/material framing 做系统写作增强：为 overview、repository profiles、major topics、concept pages、example chapters 添加或强化 `How To Read This Page`、mental model、background explanation、cross-repository role boundaries、run-surface caveats 和 status-boundary prose。保留 `wiki/materials/pto-runtime-distributed/*.md` 原文作为 public source-material library，不在 source evidence 中 silent rewrite material contents。

## [2026-05-05] review-update | Multi-agent writing and policy audit

用 public learner、examples developer、evidence auditor 和 agent-rules maintainer 四类 reviewer 重新检查 public wiki。根据反馈补强 example run surfaces 的 exact cwd/commands/status，扩展 advanced example chapters，修正 Lingqu L1 status、developer takeover/process leakage、glossary 中文叙述和 materials framing；同步更新 `.agents/` policies/workflows/skills，明确 public `wiki/materials/` 只在用户显式要求时使用，topic page 一旦依赖 material/GitHub/external/cross-repo evidence 就必须引用 paired evidence ledger，并把 public navigation hierarchy 纳入 wiki health checks。

## [2026-05-05] review-update | Implement standalone learning content rewrite spec

根据 `docs/specs/2026-05-05-wiki-standalone-learning-content-upgrade.md`，系统升级 public wiki contents：Home/Overview/area indexes 更聚焦阅读路径；repository chapters 强化 ownership、architecture diagram、source anchors、examples/tests、proof boundaries 和 safe first change；PTO example chapters 补足背景、run surface、source comparison、what it proves / does not prove；topics/concepts/glossary 增加 mental model、status boundary、What To Remember；evidence ledgers 增加 status-change criteria；materials index 明确 source-material 与 synthesized wiki 的边界。

## [2026-05-05] review-update | Add implementation code walkthroughs

根据 PR review，进一步提升 standalone-learning 标准：repository/topic/example pages 不能只列 source paths 或 run tables，必须嵌入短 source excerpts 或 source-shaped pseudocode，并解释代码证明哪一层实现、不能证明什么。重点补强 [GEMM / FFN](./examples/pto/gemm-ffn.md)、[Distributed Runtime](./examples/pto/distributed-runtime.md)、repository profiles、[Non-Distributed Execution](./topics/non-distributed-execution.md)、[simpler Runtime Architecture](./topics/simpler-runtime-architecture.md) 和 [Distributed Execution](./topics/distributed-execution.md)。同步更新 `.agents` writing/health rules，避免后续页面退回 code-free summary。

## [2026-05-05] review-update | Make public materials navigable and self-contained

根据 PR review，修正 Materials 在 top nav/sidebar 中的 page labels，避免 `Stack`、`00 README` 等过短名称隐藏实际主题。将 [Materials](./materials/) 和 [PTO Runtime Bundle Guide](./materials/pto-runtime-distributed/index.md) 从“原始材料库”重新定位为 public source-material learning pages：允许为了自包含阅读补充定义、图示、source-shaped pseudocode、外部背景引用和状态边界。重点补强 [00 Overview and Reading Paths](./materials/pto-runtime-distributed/00_README.md) 中本地 `fork`/mailbox 与 remote L3 control-plane 差异，以及 [01 Hardware, CANN, HCCL, RoCE](./materials/pto-runtime-distributed/01_hardware_and_software_stack.md) 中 RoCE/RDMA、RoCEv1/v2、HCCL over RoCE 和 PTO Runtime remote L3 的边界解释。同步更新 `.agents` material、writing 和 health rules，要求 public material pages 首次引入专业缩写时必须就地解释。

## [2026-05-05] policy-update | Add automatic concept evidence lookup skill

新增 `.agents/skills/concept-evidence-lookup/` 和 `.agents/workflows/concept-evidence-lookup.md`，把重要概念 lookup 稳定成 reusable agent skill。后续回答问题或更新文档时，若涉及关键缩写、protocol、platform component、API、runtime layer、hardware term 或 repository-specific identifier，agent 应先查 existing wiki、local repositories、GitHub history 或 official internet docs，再在正文中给出本地定义、mental model、project-specific role、status boundary 和 citations。同步更新 AGENTS、wiki lookup、repo documentation、material ingestion、topic evidence、source citation 和 health lint rules，使该能力在文档更新和问答场景自动触发。

## [2026-05-06] review-update | Replace module tables with architecture prose

根据 PR review 中对 table-driven writing 的反馈，重新审查 public wiki table blocks，重点修正 repository profiles 中用 module/source-path table 承载架构解释的问题。将 [simpler](./repositories/simpler.md) 的关键模块表改写为 L2 chip launch、L3+ host DAG、communication data-plane 三条运行路径；将 [pto-isa](./repositories/pto-isa.md) 的主要结构表改写为 public instruction interface、runnable operator packaging、communication primitive layer 三层；将 [pypto](./repositories/pypto.md) 的核心模块表改写为 language-to-IR、normal codegen/runner、distributed extension 三条主线。同步强化 `.agents` writing/health rules，要求后续 table audit 检查每个表格是否只是 lookup support，而不是正文解释的替代品。

## [2026-05-06] policy-update | Refactor agent workflow routing

将 `.agents` 重新定位为 skill-first workflow system：新增 `.agents/README.md` 和 `.agents/policies/agent-workflow-policy.md`，明确 agents 不应预读所有 workflows，而应先选最小匹配 skill，再加载该 skill 引用的 workflows/policies。新增 GitHub unit skills：`github-pr-checkout`、`github-pr-reviewer`、`github-pr-publisher`、`github-branch-cleaner`，并把 `github-pr-operator` 收窄为复合 PR work、review comments 和 CI failure 的 operator。同步更新 `agent-command-reference.md` 和 `git-change-manager`，把 branch cleanup 从 commit workflow 中拆出。

## [2026-05-06] policy-update | Simplify persistent wiki agent harness

将 `.agents` harness 简化为四个 primary wiki/harness skills：`wiki-qa-maintainer`、`wiki-researcher`、`wiki-review-maintainer`、`agent-harness-maintainer`。新增 [Future](./future/) 作为 public ongoing-work section，用于保存目标、约束、roadmap/task division、blocker、planned feature 和 design-intended behavior；raw QA histories 放在 [QA Evidence](./evidence/qa/) 而不是 public learning sidebar。新增 mechanical validators for skill shape, local Markdown links, and VitePress builds。

## [2026-05-06] future-update | Add runtime dispatch and serving roadmap

新增 [Runtime Dispatch and Serving Roadmap](./future/runtime-dispatch-and-serving-roadmap.md)，把 `simpler` PR #711、`pypto_top_level_documents/UBL128_serving.md`、`materials/A5_send_recv_dispatch.pdf`、`materials/L4_L3_data_plane_design.md` 和 `materials/RUNTIME_OPEN_PROBLEMS.md` 整理为 Future workstream。同步新增 [Future Runtime Dispatch and Serving Roadmap Evidence](./evidence/future-runtime-dispatch-and-serving-roadmap.md)，记录 PR state、external document commit/blob、local material checksums、claim map、negative findings 和 status-change criteria；更新 Future navigation、Evidence index、Home/Overview reading path。

## [2026-05-07] qa-promotion | Add PR 711 gRPC dispatch primer

根据 QA 反馈，新增 [PR 711 gRPC Dispatch Primer](./future/pr711-grpc-dispatch-primer.md)，用自包含、图示化方式解释 gRPC、Protocol Buffers、generated stubs、`RpcServer`/`RpcClient`、`RemoteWorkerProxy`、local mailbox shim、`L3Daemon` backend process、example path、error/heartbeat model 和 PR #711 当前边界。同步记录 [QA evidence](./evidence/qa/2026-05-07-pr711-grpc-primer.md)，并扩展 Future roadmap evidence 中的 gRPC/protobuf source trail。

## [2026-05-08] future-update | Sync PR 711 RXE data-plane commits

根据 PR #711 新 commits，将 [PR 711 gRPC Dispatch Primer](./future/pr711-grpc-dispatch-primer.md) 重新定位为 [PR 711 Remote Dispatch and Data Plane Primer](./future/pr711-grpc-dispatch-primer.md)，补足 `TensorRef` / `TensorHandle`、`TensorPool`、gRPC chunk fallback、RXE/ibverbs data-plane MVP、HCOMM adapter boundary、`OUTPUT / OUTPUT_EXISTING` output writeback、remote closure result-return correction、tests 和 serving non-goals。同步更新 [Runtime Dispatch and Serving Roadmap](./future/runtime-dispatch-and-serving-roadmap.md)、[Future Runtime Dispatch and Serving Roadmap Evidence](./evidence/future-runtime-dispatch-and-serving-roadmap.md)、Future/QA navigation、Home/Overview 和 VitePress Future sidebar labels。

## [2026-05-08] material-update | Publish top-level runtime and serving designs

按用户要求，将 upstream `simpler_distributed_runtime_design.md` 和 `UBL128_serving.md` 同时加入 `materials/` 与 [Materials](./materials/) 根目录，并在 Materials sidebar 中公开。同步增强 [Runtime Dispatch and Serving Roadmap](./future/runtime-dispatch-and-serving-roadmap.md)：补充 HostWorker / DistWorker baseline、fork+shared-memory mailbox、recursive `IWorker.run(payload)` 模型、UBL128 HBD/PC16/SU/SO/DCN topology、KV Meta/SSU/LBA model、F/M/PC/PN/DC/DN/S serving roles 和 Future status boundary；对应 checksum、upstream commit/blob 和 public-copy link rewrite 记录在 [Future Runtime Dispatch and Serving Roadmap Evidence](./evidence/future-runtime-dispatch-and-serving-roadmap.md)。
