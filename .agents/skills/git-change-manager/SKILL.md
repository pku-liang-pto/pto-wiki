---
name: git-change-manager
description: Use when preparing commits, staging related changes, writing commit messages, checking pre-commit readiness, or verifying committed scope.
---

# Git Change Manager

Keep commits intentional and branch cleanup conservative.

## Before Commit

1. Inspect `git status --short`, `git diff --name-only`, and `git diff --cached --name-only`.
2. Preserve unrelated user changes; stage only files related to the task.
3. Decide verification from changed file types:
   - code, build, CI, or runtime config: run relevant tests/checks
   - docs-only or simple config: run formatting/link/build checks when available
4. Review staged diff with `git diff --staged`.

## Commit Message

Use:

```text
Type: concise imperative subject

Optional body explaining what changed and why.
```

Common types: `Add`, `Fix`, `Update`, `Refactor`, `Support`, `Docs`, `CI`, `Sim`.

Rules:

- Subject under 72 characters.
- No trailing period.
- Body for multi-file changes when the why is not obvious.
- No AI co-author lines.
- Preserve human `Co-authored-by:` trailers only when squashing commits from multiple human authors.

## Branch Cleanup

Use `github-branch-cleaner` for cleaning merged local or remote branches. This skill only covers commits and committed scope verification.

## Post-Commit

Run `git log -1` and `git show HEAD --stat` to verify the committed scope and message.
