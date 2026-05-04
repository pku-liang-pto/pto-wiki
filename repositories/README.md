# Repository Workspace

This directory holds target repository checkouts.

Committed entries under this directory may be Git submodules when the repository is part of the current documented target set. Submodules pin the source snapshots used by the wiki and make the source-evidence workspace reproducible.

Agents still clone additional repositories here only when a lookup, documentation pass, GitHub issue or PR investigation, or dependency analysis needs source inspection. Ad hoc checkouts that are not intentionally added as submodules remain workspace cache data and should not be committed.

Use this direct layout:

```text
repositories/<repository-name>/
```

Repository names and upstream URLs come from `config/target-set.yml`. When a task needs a branch, issue, or pull request, use the same checkout and record the exact ref or commit inspected.
