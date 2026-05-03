# Wiki Log

Append-only chronological record of durable wiki maintenance operations.

Format:

```text
## [YYYY-MM-DD] <operation> | <title>
```

Operations include `lookup-update`, `repo-profile`, `topic-synthesis`, `dependency-analysis`, `policy-update`, and `navigation-update`.

---

## [2026-05-04] source-ingestion | PTO Runtime distributed material bundle

将 `materials/pto-runtime-distributed.zip` 提取为 tracked source evidence `materials/pto-runtime-distributed/`，排除 archive metadata files。checksum 和材料覆盖记录在 [PTO Runtime / PTO-ISA / PyPTO Evidence Inventory](./sources/pto-runtime-isa-pypto-evidence-inventory.md)。

## [2026-05-04] repo-profile | simpler, pto-isa, pypto documentation pass

基于已检查的 local repository snapshots 和 distributed runtime material bundle，新增 [simpler](./repositories/simpler.md)、[pto-isa](./repositories/pto-isa.md)、[pypto](./repositories/pypto.md) repository profiles。

## [2026-05-04] topic-synthesis | PTO distributed execution synthesis

新增 [Examples Feature Map](./topics/examples-feature-map.md)、[Distributed Execution](./topics/distributed-execution.md)、[Linqu Level Map](./topics/linqu-level-map.md)、[Distributed Execution Terms](./concepts/distributed-execution-terms.md)。同步更新 overview 和 toolchain navigation，区分已实现的 single-host L3 behavior 与 `design-intended` remote L3 behavior。

## [2026-05-03] policy-update | Add wiki organization and health rules

Added reusable organization rules based on the plain-Markdown wiki maintenance pattern from [SamurAIGPT/llm-wiki-agent](https://github.com/SamurAIGPT/llm-wiki-agent), while intentionally excluding graph-data requirements.

## [2026-05-03] policy-update | Add document material ingestion rules

Added reusable workflow and skill coverage for updating the wiki from document files, folders, and zip archives without committing raw supplied materials.
