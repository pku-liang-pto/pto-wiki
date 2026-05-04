# PTO-CANN Toolchain Wiki

This wiki is the human-readable knowledge base for the PTO-CANN target set.

It starts as a map, not as a complete mirror of every upstream project. Pages are expanded when a concrete lookup, repository documentation pass, or toolchain investigation discovers durable knowledge that future readers are likely to need.

## Start Here

- New to PTO-CANN: [Basic Terms](./concepts/basic-terms.md) -> [Non-Distributed Execution](./topics/non-distributed-execution.md) -> [Examples Feature Map](./topics/examples-feature-map.md) -> [Repository Profiles](./repositories/) -> [Distributed Execution](./topics/distributed-execution.md).
- Examples-first path: [Examples Feature Map](./topics/examples-feature-map.md) starts from source-only examples, then simulator, single-device hardware, and multi-device communication lanes.
- [Overview](./overview.md): living synthesis across the configured target set.
- [Projects](./projects.md): current PTO and CANN repository index.
- [Usage](./usage.md): Pixi commands, target configuration, workspace behavior, and agent lookup patterns.
- [Toolchain Map](./toolchain-map.md): how the current projects are expected to relate.
- [Repository Profiles](./repositories/): per-repository documentation as it is created.
- [Evidence](./evidence/): topic-scoped evidence ledgers for material, GitHub, and cross-repository claims.
- [Topics](./topics/): feature, workflow, behavior, and issue-family syntheses.
- [Concepts](./concepts/): reusable technical concepts and acronyms.
- [Glossary](./glossary.md): terms and acronyms collected during wiki growth.
- [Wiki Log](./log.md): append-only record of durable wiki maintenance operations.

## How This Wiki Grows

When a topic is looked up, agents first check this wiki. If the answer is missing or stale, they inspect the configured target repositories and upstream documentation. Durable, sourced findings are added back here in clear prose.

The wiki should explain what is known, cite where it came from, and preserve uncertainty when evidence is incomplete.

New durable pages should be reachable from this index or an area index. Broad target-set findings should also update [Overview](./overview.md) when they change the synthesis.
