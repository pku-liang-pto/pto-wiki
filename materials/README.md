# Materials Workspace

This directory is an optional local workspace for user-supplied document files, folders, and extracted archives.

Materials are evidence inputs for wiki updates, not wiki content. Keep ad hoc supplied documents untracked by default. Commit a material bundle only under `wiki/materials/` when the user explicitly wants it public; keep raw originals intact, add or update the material index, and cite the bundle from topic evidence ledgers.

When durable knowledge is extracted from materials, summarize it under `wiki/evidence/`, `wiki/topics/`, `wiki/concepts/`, or another appropriate wiki page with citations to the material path, checksum, and retrieval or ingestion date.

## Tracked Source Materials

These files are tracked because the user explicitly requested public source-material copies under both `materials/` and `wiki/materials/`:

- `simpler_distributed_runtime_design.md`: upstream design material for `simpler` HostWorker / DistWorker distributed runtime.
- `UBL128_serving.md`: upstream design material for UBL128 prefill/decode serving with prefix support.
