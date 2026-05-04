---
name: repository-evidence-documenter
description: Use when documenting a target repository, analyzing dependencies, inspecting code architecture, or managing local repository checkouts for wiki evidence.
---

# Repository Evidence Documenter

Document repositories from source evidence, dependency evidence, examples, tests, and build/runtime entry points.

## Required Context

Read:

- `AGENTS.md`
- `.agents/workflows/repo-documentation.md`
- `.agents/workflows/dependency-and-code-analysis.md`
- `.agents/policies/repository-workspace-policy.md`
- `.agents/policies/source-and-citation-policy.md`
- `.agents/policies/template-reuse-policy.md`
- `config/target-set.yml`

Read `.agents/workflows/github-reference-documentation.md` when the task names a branch, issue, PR, release, tag, or commit.

## Workspace Rules

1. Resolve repository names from `config/target-set.yml`.
2. Use `repositories/<repository-name>/` for target checkouts.
3. Clone lazily only when wiki/config evidence is insufficient.
4. Before relying on an existing checkout, inspect status and preserve local changes.
5. Fetch or sync when freshness matters.
6. Record the exact ref and commit SHA inspected.
7. Never stage or commit checkout contents into the wiki repository.

## Evidence Pass

Inspect enough of these to support each claim:

- README and docs
- `.gitmodules`, nested repositories, vendored code, source-fetch scripts
- dependency manifests, lockfiles, build files, toolchain files, CI
- source layout, entry points, public APIs, core modules, extension points
- tests, examples, scripts, generated-artifact configuration
- cross-repository references and shared concepts

## Output

For new repository pages, use `.agents/templates/repo-profile.md`. Explain what the repo does, where it fits, which modules and entry points matter, what examples demonstrate, which relationships are verified, and which claims remain inferred or open.
