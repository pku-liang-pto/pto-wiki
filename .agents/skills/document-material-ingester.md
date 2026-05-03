# Document Material Ingester Skill

Use this skill when a user asks to update the wiki from a document file, folder, archive, zip, notes bundle, exported docs, meeting notes, logs, PDFs, markdown, CSV, JSON, or other non-code material.

## Steps

1. Read `.agents/workflows/document-material-ingestion.md`.
2. Read `.agents/policies/document-material-policy.md`.
3. Read `.agents/skills/wiki-maintainer.md`.
4. Identify whether the input is a file, folder, or zip archive.
5. Enumerate materials and exclude unsafe, generated, duplicate, or unreadable files.
6. For zip archives, list members before extraction and reject unsafe paths.
7. Record path, archive member, checksum, ingestion date, and conversion method for material evidence.
8. Create or update `wiki/sources/` summaries for durable source knowledge.
9. Create or update `wiki/topics/` or `wiki/concepts/` only when the material supports a durable synthesis.
10. Keep `wiki/sources/index.md`, `wiki/index.md`, `wiki/overview.md`, and `wiki/log.md` current.
11. Run wiki health checks before claiming completion.
