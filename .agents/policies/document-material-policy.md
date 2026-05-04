# Document Material Policy

Document materials are user-supplied evidence files, folders, or archives used to update the wiki.

## Storage

Use `materials/` as an optional local workspace for supplied documents and extracted archives. By default, keep ad hoc materials untracked, but allow explicit tracked material bundles when the user requests them or a documentation pass defines them as source evidence.

Do not commit raw supplied documents, extracted archive contents, or converted full-text copies by accident. When committing a material bundle intentionally, record why it is tracked and cite it as source evidence rather than copying it into `wiki/`.

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

Do not copy whole upstream or user-supplied documents into `wiki/`. Record durable material evidence in topic-scoped `wiki/evidence/` ledgers and cite material evidence near factual claims.
