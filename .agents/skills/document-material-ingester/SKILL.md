---
name: document-material-ingester
description: Use when user-supplied files, folders, archives, notes, logs, PDFs, markdown, CSV, JSON, or other non-code materials should inform the wiki.
---

# Document Material Ingester

Treat supplied materials as evidence inputs. Summarize durable knowledge in `wiki/`; do not turn the wiki into a raw document mirror.

## Required Context

Read:

- `AGENTS.md`
- `.agents/workflows/document-material-ingestion.md`
- `.agents/policies/document-material-policy.md`
- `.agents/policies/wiki-content-boundary-policy.md`
- `.agents/policies/wiki-organization-policy.md`
- `.agents/policies/source-and-citation-policy.md`
- `wiki/index.md`
- `wiki/overview.md`
- `wiki/evidence/index.md` when present

## Input Handling

1. Identify whether the input is a file, folder, or archive.
2. Enumerate candidate files before reading or extracting.
3. For archives, list members first and reject unsafe paths with absolute paths or `..`.
4. Skip hidden/system metadata, generated caches, duplicates, and unreadable files unless explicitly relevant.
5. Convert binary documents only with available local tools; record partial conversion or unreadable limitations.
6. Record material path, archive member, checksum when feasible, ingestion date, conversion method, and exclusions.

## Wiki Update

1. Read enough of every used material to identify title, date, topic, claims, repositories, people, and concepts.
2. Search existing `wiki/` for overlap before creating pages.
3. Create or update topic-scoped evidence ledgers under `wiki/evidence/` using `.agents/templates/evidence-ledger.md`.
4. Create or update `wiki/topics/` or `wiki/concepts/` only when materials support durable synthesis.
5. Cite evidence ledgers where topic claims need material/GitHub/source routing support.
6. Preserve contradictions, stale claims, missing coverage, and open questions.
7. Update indexes, `wiki/overview.md` when broad synthesis changes, and `wiki/log.md` with `material-ingest`.

## Boundaries

- Do not commit raw supplied documents or extracted archive contents by accident. Commit a material bundle only under `wiki/materials/` when the user explicitly wants it public; keep raw originals intact, add or update the material index, and cite the bundle from topic evidence ledgers.
- Do not copy whole documents into synthesized learning pages. Public source-material bundles belong only under `wiki/materials/` when the user explicitly requests them.
- Do not smooth over conflicts between materials and repository evidence.
