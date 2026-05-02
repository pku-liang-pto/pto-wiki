# Repository Workspace Policy

Target repository clones live under `projects/` and are treated as local workspace cache, not as wiki source.

## Workspace Layout

Use this layout for target repositories unless a task has a documented reason to choose another local path:

```text
projects/<group>/<repository-name>/
```

Read groups, repository names, and upstream URLs from `config/target-set.yml`. Reusable workflows must not hard-code a specific target set.

## Lazy Cloning

Clone a target repository only when local wiki coverage, configured metadata, or upstream documentation is insufficient for the request. Do not clone every configured repository at the start of a lookup.

Before cloning:

- read `config/target-set.yml`
- identify the smallest relevant repository set
- check whether an existing clone already exists under `projects/`

## Syncing Existing Clones

Before relying on an existing clone when freshness matters, fetch or otherwise sync it against its configured upstream. Preserve any local changes found inside the clone unless the user explicitly asks to discard them.

Record the commit SHA used as evidence. If the clone cannot be synced, state that limitation and preserve uncertainty in the answer or wiki update.

## Git Hygiene

Do not commit cloned repository contents into this wiki repository. The root `.gitignore` keeps cloned project contents ignored while allowing a tracked workspace README.

Wiki updates may cite inspected local clones, but citations must include:

- local clone path
- commit SHA, tag, or branch state inspected
- relevant file paths inside the clone

Prefer stable upstream URLs, commits, tags, or releases when available.
