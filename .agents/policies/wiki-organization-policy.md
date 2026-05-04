# Wiki Organization Policy

The wiki should be easy to query, browse, and update incrementally.

## System Positioning

This wiki is not a distributed-only documentation space. Distributed topics must be grounded in the non-distributed foundations that make them possible: basic terms, normal execution flow, repository roles, kernels, runtime launch paths, and representative examples.

When a topic depends on advanced or distributed behavior, document the foundation layer first or cite an existing foundation page. Do not let a temporary project focus bias the durable wiki taxonomy.

## Core Files

Maintain these root wiki files:

- `wiki/index.md`: human entry point and catalog of major wiki areas.
- `wiki/overview.md`: living synthesis of the configured target set.
- `wiki/log.md`: append-only chronological record of durable wiki maintenance operations.
- `wiki/usage.md`: human-facing usage documentation.

Update `wiki/index.md` whenever adding, renaming, or deleting a durable wiki page. Update `wiki/overview.md` when new evidence changes the broad synthesis of the target set. Append to `wiki/log.md` for durable documentation, lookup-and-update, repository documentation, and topic synthesis operations.

## Page Areas

Use stable directories for recurring page types:

- `wiki/repositories/`: repository profiles.
- `wiki/topics/`: feature, design, workflow, issue family, or behavior syntheses.
- `wiki/evidence/`: topic-scoped evidence ledgers for user materials, GitHub references, external documents, repository anchors, claim maps, negative findings, and open questions.
- `wiki/concepts/`: reusable technical concepts, APIs, protocols, acronyms, and architecture ideas.

Add new top-level wiki directories only when repeated pages justify the area. Prefer extending these areas before introducing a new taxonomy.

## Page Metadata

New durable pages should include lightweight YAML frontmatter:

```yaml
---
title: "Page Title"
type: repository | topic | evidence | concept | overview | index | usage
status: draft | stable
sources: []
last_updated: YYYY-MM-DD
---
```

Existing pages without frontmatter may be updated incrementally; do not rewrite broad sections just to add metadata.

## Linking

Each durable page should link to:

- its parent area index when one exists
- related repository, topic, or concept pages
- source evidence near the claims it supports

Topic pages that depend on user-supplied materials, GitHub issues or PRs, external documents, or cross-repository synthesis should cite a paired `wiki/evidence/<topic>.md` page where the evidence is needed. Small topic pages based only on nearby direct repository citations do not need a paired evidence page.

Use normal Markdown links for file paths and URLs. Do not require graph data or graph-specific wikilink syntax.

## Quality Checks

Before claiming a wiki update is complete, check:

- no new page is orphaned from `wiki/index.md` or an area index
- links added by the change resolve
- pages are not empty stubs
- the update has source citations near factual claims
- distributed or advanced topics have a clear foundation path through basic terms, non-distributed execution, repository profiles, or examples
- example pages include enough background, progression, comparison, optimization context, and missing-example status to teach the reader why the examples matter
- `wiki/log.md` has an entry for durable operations
- broad synthesis changes are reflected in `wiki/overview.md` when warranted
