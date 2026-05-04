# PTO-CANN Toolchain Wiki

This wiki is the human-readable knowledge base for the PTO-CANN target set.

It is a standalone learning layer, not only a pointer map to repositories and review threads. Pages explain the synthesized knowledge directly, then cite source paths, PRs, issues, materials, and evidence ledgers so maintainers can audit the claims.

## Core Learning Pages

- [Overview](./overview.md): living synthesis across the configured target set.
- [Basic Terms](./concepts/basic-terms.md): vocabulary for tensors, tiles, memory spaces, workers, and runtime levels.
- [Non-Distributed Execution](./topics/non-distributed-execution.md): how a normal PyPTO/PTO-ISA/simpler program becomes device work.
- [Examples Feature Map](./topics/examples-feature-map.md): self-contained example explanations from kernel to complete NN and distributed TODOs.
- [Distributed Execution](./topics/distributed-execution.md): hierarchy, rank/window communication, current L3 behavior, and remote-runtime boundaries.
- [Developer Takeover Guide](./topics/developer-takeover-guide.md): maintainer ownership model, risks, and safe change boundaries.
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
