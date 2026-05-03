# Repository Workspace

This directory holds local checkouts of target repositories.

Agents clone repositories here only when a lookup, documentation pass, GitHub issue or PR investigation, or dependency analysis needs source inspection. Checkouts are workspace cache data and should not be committed to this wiki repository.

Use this direct layout:

```text
repositories/<repository-name>/
```

Repository names and upstream URLs come from `config/target-set.yml`. When a task needs a branch, issue, or pull request, use the same checkout and record the exact ref or commit inspected.
