---
name: git-change-manager
description: Use when preparing commits, staging related changes, writing commit messages, checking pre-commit readiness, or cleaning merged local and fork branches.
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

1. Identify fork and upstream remotes.
2. Fetch/prune the fork remote.
3. List local and fork remote branches, excluding current branch, `main`, and `HEAD`.
4. Detect regular merged branches with `git branch --merged`.
5. Detect squash-merged branches with `gh pr list --head <branch> --state merged` and compare branch tip to PR head SHA to avoid deleting reused branches.
6. Present safe-to-delete and unfinished branches to the user.
7. Delete only after explicit approval, and never delete upstream remote branches.

## Post-Commit

Run `git log -1` and `git show HEAD --stat` to verify the committed scope and message.
