# Repository Workspace Policy

Target repository checkouts live under `repositories/` and are treated as local workspace cache, not as wiki source.

## Workspace Layout

Use this direct layout for target repositories unless a task has a documented reason to choose another local path:

```text
repositories/<repository-name>/
```

Read repository names, groups, and upstream URLs from `config/target-set.yml`. Reusable workflows must not hard-code a specific target set.

## Lazy Cloning

Clone a target repository only when local wiki coverage, configured metadata, or upstream documentation is insufficient for the request. Do not clone every configured repository at the start of a lookup.

Before cloning:

- read `config/target-set.yml`
- identify the smallest relevant repository set
- check whether an existing checkout already exists under `repositories/`

## Syncing Existing Checkouts

Before relying on an existing checkout when freshness matters, fetch or otherwise sync it against its configured upstream. Preserve any local changes found inside the checkout unless the user explicitly asks to discard them.

Record the commit SHA used as evidence. If the checkout cannot be synced, state that limitation and preserve uncertainty in the answer or wiki update.

## Branch, Issue, And PR Evidence

Do not assume the default branch is the only relevant source. For requests about a specific branch, issue, pull request, release, or commit:

- fetch the requested ref or GitHub object before inspecting it
- check out a local branch or detached commit only after preserving any local checkout changes
- record the branch, issue, PR, tag, or commit inspected
- cite GitHub URLs and local paths with commit SHAs when wiki facts come from that investigation

For pull requests, inspect the PR metadata, base branch, head branch, commits, changed files, and discussion when relevant. For issues, inspect the issue body, labels, comments when relevant, linked PRs or commits, and any referenced source paths.

## Git Hygiene

Do not commit repository checkout contents into this wiki repository. The root `.gitignore` keeps checkout contents ignored while allowing a tracked workspace README.

Wiki updates may cite inspected local checkouts, but citations must include:

- local checkout path
- commit SHA, tag, branch, issue, PR, release, or other ref inspected
- relevant file paths inside the checkout

Prefer stable upstream URLs, commits, tags, or releases when available.
