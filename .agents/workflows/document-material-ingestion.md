# Document Material Ingestion Workflow

Use this workflow when updating the wiki from a user-supplied document file, folder, or zip archive rather than from repository source code.

## Setup

1. Read `AGENTS.md`.
2. Read `.agents/policies/document-material-policy.md`.
3. Read `.agents/policies/wiki-organization-policy.md`.
4. Read `.agents/policies/source-and-citation-policy.md`.
5. Read existing `wiki/index.md`, `wiki/overview.md`, `wiki/sources/index.md`, and relevant wiki pages.

## Input Handling

1. Identify whether the input is a file, folder, or zip archive.
2. For folders, enumerate candidate files and skip generated caches, binaries that cannot be converted, and hidden/system files unless explicitly relevant.
3. For zip archives, list members first, reject unsafe paths, then extract only to an ignored or temporary workspace.
4. For every material used, record path, archive member if any, checksum when feasible, ingestion date, and conversion method.
5. Convert non-text documents only with available local tools. If conversion is partial or unavailable, record the limitation.

## Ingestion Steps

1. Read enough of each material to identify title, date, topic, key claims, entities, repositories, and concepts.
2. Search existing `wiki/` for overlap before adding pages.
3. Create or update `wiki/sources/<slug>.md` for durable source summaries. Use `.agents/templates/source-summary.md`.
4. Update `wiki/sources/index.md` and `wiki/index.md`.
5. Update `wiki/overview.md` only when the material changes broad target-set synthesis.
6. Create or update `wiki/topics/` and `wiki/concepts/` pages when the material supports durable synthesis beyond a source summary.
7. Flag contradictions, uncertainty, and data gaps instead of smoothing them away.
8. Append to `wiki/log.md` with `material-ingest` and the material title or bundle name.
9. Run wiki health checks from `.agents/workflows/wiki-health-and-lint.md`.

## Output Standard

The wiki update should preserve:

- concise source summary, not full document copy
- key claims with citations
- important quotes only when short and necessary
- connections to repositories, topics, and concepts
- contradictions or conflicts with existing wiki pages
- open questions or unreadable material limitations

For a folder or zip, provide a bundle-level summary and per-file source pages only for files that add durable knowledge.
