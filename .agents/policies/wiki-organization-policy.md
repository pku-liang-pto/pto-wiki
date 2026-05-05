# Wiki Organization Policy

The wiki should be easy to query, browse, and update incrementally.

Follow `.agents/policies/wiki-content-boundary-policy.md` when deciding whether a sentence belongs in `wiki/` or `.agents/`.

Follow `.agents/policies/wiki-writing-style-policy.md` for public learning pages.

## System Positioning

This wiki is not a distributed-only documentation space. Distributed topics must be grounded in the non-distributed foundations that make them possible: basic terms, normal execution flow, repository roles, kernels, runtime launch paths, and representative examples.

When a topic depends on advanced or distributed behavior, document the foundation layer first or cite an existing foundation page. Do not let a temporary project focus bias the durable wiki taxonomy.

The wiki is standalone learning material, not only a reading guide over repositories, issues, PRs, or user-supplied documents. A reader should be able to understand the main architecture, concepts, examples, and current status from `wiki/` itself. External references, source paths, and evidence pages are audit support: they justify claims and help maintainers verify details, but they must not be the only place where the knowledge is explained.

Prefer this page shape for durable learning pages:

1. Explain the concept in prose first.
2. Add a small ASCII diagram or concrete example when it makes the idea easier to learn.
3. Use tables as summaries or comparison aids, not as the primary explanation.
4. Put citations close to the claims they support.
5. Keep links to source/evidence, but avoid sentences that only tell readers to go elsewhere.

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
- `wiki/examples/`: public example domains. Put current PTO examples under `wiki/examples/pto/`; keep run surface and cross-repository source comparison inside each concrete example chapter.
- `wiki/topics/`: feature, design, workflow, issue family, or behavior syntheses.
- `wiki/evidence/`: topic-scoped evidence ledgers for user materials, GitHub references, external documents, repository anchors, claim maps, negative findings, and open questions.
- `wiki/concepts/`: reusable technical concepts, APIs, protocols, acronyms, and architecture ideas.
- `wiki/materials/`: public source-material library used for direct reading, writing-style reference, and audit.

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
- top navigation and left sidebar expose the same public hierarchy: Home, Repositories, Examples, Topics, Concepts, Materials
- links added by the change resolve
- pages are not empty stubs
- major topic and repository pages are understandable as standalone learning material before source links are followed
- tables summarize prose instead of replacing it
- the update has source citations near factual claims
- distributed or advanced topics have a clear foundation path through basic terms, non-distributed execution, repository profiles, or examples
- example pages include enough background, progression, comparison, optimization context, and missing-example status to teach the reader why the examples matter
- `wiki/log.md` has an entry for durable operations
- broad synthesis changes are reflected in `wiki/overview.md` when warranted
