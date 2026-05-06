---
name: github-pr-operator
description: Use when checking out, reviewing, publishing, fixing CI or review comments for, or cleaning branches after GitHub pull requests.
---

# GitHub PR Operator

Operate on GitHub pull requests with explicit PR context, correct refs, clean push behavior, and narrow branch cleanup.

## Setup

1. Run `gh auth status`.
2. Detect repository context with `gh repo view --json owner,name,defaultBranchRef`.
3. Record remotes, current branch, upstream tracking branch, dirty state, base ref, push remote, and whether the PR head is same-repo or cross-fork.
4. Preserve local changes before checkout, rebase, or branch switching.

## Checkout PR

For a PR number:

1. `gh pr view <number> --json number,title,headRefName,headRepository,headRepositoryOwner,baseRefName,state,maintainerCanModify,author`
2. Validate state: open continues; closed warns; merged exits unless user explicitly wants historical inspection.
3. If head repo is not the canonical repo, add/fetch a remote named for the head owner.
4. Fetch the head branch and create a local `pr-<number>-work` branch tracking the writable push target.
5. Report PR number, author, local branch, push remote, base branch, and head branch.

## Review PR

1. Fetch the actual base branch.
2. Compute `MERGE_BASE=$(git merge-base <base-ref> HEAD)`.
3. Verify the diff is PR-only, then inspect `git diff "$MERGE_BASE"...HEAD`.
4. Read surrounding source when diff context is insufficient.
5. Lead with findings: bugs, regressions, missing tests, risks. Keep summaries secondary.
6. If there are no findings, say that clearly and mention remaining test gaps or unverified assumptions.

## Publish PR

1. If no PR exists and the current branch is default, create a feature branch from the base.
2. If there are uncommitted changes, use `git-change-manager` to verify, stage, and commit related files.
3. Fetch and rebase on the base ref unless project policy or branch state makes rebase inappropriate.
4. Push to the correct remote/head branch. Use `--set-upstream` for first push.
5. Use `--force-with-lease` only after an intentional local history rewrite.
6. Create or edit the PR with concise title, summary, testing section, and linked issue when applicable.

## Fix CI Or Review Comments

1. Fetch unresolved review threads and CI status.
2. Classify review comments as actionable, discussable, or informational.
3. Fetch failed GitHub Actions logs online before local reproduction; for pending runs, wait until completion before reading failed logs.
4. Present non-obvious or discussable items to the user before skipping or resolving.
5. Make minimal code/docs changes on the PR branch, test, commit, and push.
6. Do not reply to or resolve review threads unless the user explicitly asks or project policy requires it.

## Branch Cleanup

1. Identify remotes and current branch.
2. Fetch/prune candidate fork remote refs.
3. List local merged branches and non-main branches.
4. Detect squash-merged branches with `gh pr list --head <branch-name> --state merged --json number,title,headRefOid --limit 1`.
5. Compare branch tip to the merged PR `headRefOid`; if they differ, treat the branch as unfinished.
6. Present safe-to-delete and unfinished branches to the user and wait for explicit approval.
7. Delete only approved local branches and fork-remote branches.

## Guardrails

- Never diff against stale local `main`.
- Never delete or rewrite another contributor's work without explicit user direction.
- Never delete `main`, `HEAD`, the current branch, or upstream remote branches.
- Never add AI co-author footers.
- Never create a PR from the default branch; create a feature branch first.
- Keep GitHub task state separate from durable wiki knowledge unless it becomes source evidence.
