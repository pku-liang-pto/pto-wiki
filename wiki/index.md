# PTO-CANN Toolchain Wiki

This wiki is the human-readable knowledge base for the PTO-CANN target set.

It is a standalone learning layer for the configured target set. Pages explain synthesized knowledge directly, with evidence links available for audit.

## Core Learning Pages

- [Overview](./overview.md): living synthesis across the configured target set.
- [Basic Terms](./concepts/basic-terms.md): vocabulary for tensors, tiles, memory spaces, workers, and runtime levels.
- [Non-Distributed Execution](./topics/non-distributed-execution.md): how a normal PyPTO/PTO-ISA/simpler program becomes device work.
- [simpler Runtime Architecture](./topics/simpler-runtime-architecture.md): self-contained synthesis of simpler's L2, L3+, task-flow, scheduler, and worker docs.
- [Examples Feature Map](./topics/examples-feature-map.md): self-contained example explanations from kernel to complete NN and distributed TODOs.
- [Distributed Execution](./topics/distributed-execution.md): hierarchy, rank/window communication, current L3 behavior, and remote-runtime boundaries.
- [Developer Takeover Guide](./topics/developer-takeover-guide.md): maintainer ownership model, risks, and safe change boundaries.
- [Projects](./projects.md): current PTO and CANN repository index.
- [Usage](./usage.md): Pixi commands, target configuration, and workspace behavior.
- [Toolchain Map](./toolchain-map.md): how the current projects are expected to relate.
- [Repository Profiles](./repositories/): per-repository documentation as it is created.
- [Evidence](./evidence/): topic-scoped evidence ledgers for material, GitHub, and cross-repository claims.
- [Topics](./topics/): feature, workflow, behavior, and issue-family syntheses.
- [Concepts](./concepts/): reusable technical concepts and acronyms.
- [Glossary](./glossary.md): terms and acronyms collected during wiki growth.
- [Wiki Log](./log.md): append-only record of durable wiki maintenance operations.

## How To Read

Start with [Overview](./overview.md) for the target-set shape, then use concepts and topic pages for standalone explanations. Follow evidence links when you need to audit a claim against source paths, materials, PRs, issues, or inspected commits.
