---
name: github-pr-checkout
description: Use when checking out a GitHub pull request locally, especially a cross-fork PR, or when preparing a local branch to inspect or modify a PR head.
---

# GitHub PR Checkout

Check out a PR head without confusing base, head, remotes, or push target.

## Required Context

Read:

- `AGENTS.md`
- `.agents/policies/agent-workflow-policy.md`
- `.agents/policies/repository-workspace-policy.md`

## Workflow

1. Run `gh auth status`.
2. Detect repository context:
   ```bash
   gh repo view --json owner,name,defaultBranchRef
   git remote -v
   git status --short
   ```
3. Fetch PR metadata:
   ```bash
   gh pr view <number> --json number,title,headRefName,headRepository,headRepositoryOwner,baseRefName,state,author,maintainerCanModify
   ```
4. Validate the PR is open unless the user explicitly wants historical inspection.
5. If the head repo is not the canonical repo, add or reuse a remote named for the head owner.
6. Fetch the head branch and create a local `pr-<number>-work` branch tracking the writable remote/head.
7. Report PR number, author, local branch, push remote, base branch, and head branch.

## Guardrails

- Never diff against stale local `main`; fetch the PR base before review work.
- Preserve local uncommitted changes before switching branches.
- For cross-fork PRs, push back to the PR author's remote/head branch only when permissions and project policy allow it.
