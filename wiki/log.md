# Wiki Log

Append-only chronological record of durable wiki maintenance operations.

Format:

```text
## [YYYY-MM-DD] <operation> | <title>
```

Operations include `lookup-update`, `repo-profile`, `topic-synthesis`, `dependency-analysis`, `policy-update`, and `navigation-update`.

---

## [2026-05-04] source-ingestion | PTO Runtime distributed material bundle

将 `materials/pto-runtime-distributed.zip` 提取为 tracked source evidence `materials/pto-runtime-distributed/`，排除 archive metadata files。checksum 和材料覆盖记录在 topic-scoped evidence ledgers, starting with [Distributed Execution Evidence](./evidence/distributed-execution.md)。

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

## [2026-05-03] policy-update | Add wiki organization and health rules

Added reusable organization rules based on the plain-Markdown wiki maintenance pattern from [SamurAIGPT/llm-wiki-agent](https://github.com/SamurAIGPT/llm-wiki-agent), while intentionally excluding graph-data requirements.

## [2026-05-03] policy-update | Add document material ingestion rules

Added reusable workflow and skill coverage for updating the wiki from document files, folders, and zip archives without committing raw supplied materials.
