---
name: github-branch-cleaner
description: Use when cleaning merged local or remote Git branches, pruning stale branch refs, or tidying branches after PRs have been merged.
---

# GitHub Branch Cleaner

Clean only branches that are demonstrably safe to remove.

## Required Context

Read:

- `AGENTS.md`
- `.agents/policies/agent-workflow-policy.md`

## Workflow

1. Identify remotes and current branch:
   ```bash
   git remote -v
   git branch --show-current
   ```
2. Fetch/prune candidate fork remote refs:
   ```bash
   git fetch <fork-remote> --prune
   git remote prune <fork-remote> --dry-run
   ```
3. List local branches merged into `main` and all non-main branches:
   ```bash
   git branch --merged main
   git branch
   git branch -r --list '<fork-remote>/*'
   ```
4. Detect squash-merged branches with GitHub:
   ```bash
   gh pr list --head <branch-name> --state merged --json number,title,headRefOid --limit 1
   ```
5. Compare the branch tip to the merged PR `headRefOid`. If they differ, treat the branch as unfinished.
6. Present safe-to-delete and unfinished branches to the user and wait for explicit approval.
7. Delete only approved local branches and fork-remote branches. Never delete upstream remote branches.

## Guardrails

- Never delete `main`, `HEAD`, the current branch, or upstream remote branches.
- Never delete branches without explicit user approval.
- If `gh` is unavailable, report that squash-merge detection was skipped.
