# Document Material Policy

Document materials are user-supplied evidence files, folders, or archives used to update the wiki.

## Storage

Use `materials/` as an optional local workspace for supplied documents and extracted archives. Use `wiki/materials/` for material bundles that the user explicitly wants to publish as a public source-material library. By default, keep ad hoc materials untracked.

Do not commit raw supplied documents, extracted archive contents, or converted full-text copies by accident. When committing a material bundle intentionally, record why it is tracked, expose it through a small `wiki/materials/` index, and cite it as source evidence. Public learning pages should summarize the material instead of copying long passages from it.

## Supported Inputs

Agents may ingest:

- single files
- folders
- `.zip` archives
- text-like formats such as Markdown, plain text, CSV, JSON, YAML, XML, HTML, RST, and logs
- binary document formats only when an available local converter can produce reliable text

If a format cannot be read or converted, record the limitation instead of inventing content.

## Archive Safety

For zip archives:

- list archive contents before extraction
- reject or skip unsafe paths with absolute paths or `..`
- extract to a temporary or materials workspace path
- move or copy into `wiki/materials/` only when the bundle is intentionally public
- avoid committing extracted files unless the bundle is intentionally tracked as source evidence
- cite the archive path and individual member paths used as evidence

## Evidence Records

For each material or material bundle used for durable wiki facts, record:

- original path or source URL if available
- file name or archive member path
- checksum when feasible
- ingestion date
- conversion tool or method when conversion was needed
- limitations, unreadable files, or excluded files

Do not copy whole upstream or user-supplied documents into learning pages. If the user requests public source materials, store them under `wiki/materials/` with an index page and keep synthesized durable evidence in topic-scoped `wiki/evidence/` ledgers.
