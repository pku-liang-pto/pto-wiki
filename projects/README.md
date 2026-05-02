# Projects Workspace

This directory is a local workspace for target repository clones.

Agents clone repositories here only when a lookup, documentation pass, or dependency analysis needs source inspection. Cloned repositories are workspace cache data and should not be committed to this wiki repository.

Use this layout unless a task has a specific reason to choose another local path:

```text
projects/<group>/<repository-name>/
```

The configured groups, repository names, and upstream URLs come from `config/target-set.yml`.
