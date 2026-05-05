# Document Material Policy

Document materials are user-supplied evidence files, folders, or archives used to update the wiki.

## Storage

Use `materials/` as an optional local workspace for supplied documents and extracted archives. Use `wiki/materials/` only for material bundles that the user explicitly wants to publish as a public source-material library. By default, keep ad hoc materials untracked.

Do not commit raw supplied documents, extracted archive contents, or converted full-text copies by accident. Commit a material bundle only under `wiki/materials/` when the user explicitly wants it public; keep raw originals intact, expose the public copy through `wiki/materials/` indexes, and cite it as source-material evidence from topic ledgers.

Once a material bundle is published in the public sidebar, its pages are no longer allowed to be thin archive dumps. They must be readable learning material: descriptive titles, first-use explanations for important terms, diagrams when they clarify relationships, local explanation of source-shaped code or pseudocode when code behavior matters, and status boundaries for design-intended or open claims. External links and source paths are for audit, not substitutes for the page's own explanation.

Public material pages may be refactored to improve self-contained reading. Allowed changes include section reordering, clearer headings, concise definitions, diagrams, background notes from external sources, and source-shaped pseudocode. Do not silently change the meaning of the supplied material; if an edit changes a status judgment, evidence interpretation, or source boundary, record it in `wiki/log.md` or the paired evidence ledger.

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
- move or copy into `wiki/materials/` only when the user explicitly wants the bundle public
- avoid committing extracted files unless they are the intentional public `wiki/materials/` copy
- cite the archive path and individual member paths used as evidence

## Evidence Records

For each material or material bundle used for durable wiki facts, record:

- original path or source URL if available
- file name or archive member path
- checksum when feasible
- ingestion date
- conversion tool or method when conversion was needed
- limitations, unreadable files, or excluded files

Do not copy whole upstream or user-supplied documents into synthesized Examples/Topics/Repositories pages. If the user requests public source materials, store them under `wiki/materials/` with index pages, make the public copy self-contained enough to read, and keep synthesized durable evidence in topic-scoped `wiki/evidence/` ledgers.
