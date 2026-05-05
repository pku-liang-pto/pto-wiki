---
name: github-pr-operator
description: Use when a GitHub pull request task spans multiple PR operations, involves PR review comments or CI failures, or is too broad for a single checkout, review, or publish skill.
---

# GitHub PR Operator

Operate on GitHub pull requests with explicit PR context, correct refs, and clean push behavior.

## Prefer Unit Skills

Use the more specific skill when the request is clearly one operation:

- `github-pr-checkout`: check out a PR head locally.
- `github-pr-reviewer`: review or analyze a PR diff.
- `github-pr-publisher`: push a branch and create or update a PR.
- `github-branch-cleaner`: clean merged branches after PRs merge.

Use this operator for compound PR work, unresolved review comments, failing PR checks, or ambiguous "resolve PR" requests.

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

## Review PR

1. Fetch the actual base branch.
2. Compute `MERGE_BASE=$(git merge-base <base-ref> HEAD)`.
3. Verify the diff is PR-only, then inspect `git diff "$MERGE_BASE"...HEAD`.
4. Read surrounding source when diff context is insufficient.
5. Lead with findings: bugs, regressions, missing tests, risks. Keep summaries secondary.

## Fix PR Comments Or CI

1. Fetch unresolved review threads and CI status.
2. Classify review comments as actionable, discussable, or informational.
3. Fetch failed GitHub Actions logs online before local reproduction; for pending runs, wait until completion before reading failed logs.
4. Present non-obvious or discussable items to the user before skipping or resolving.
5. Make minimal code/docs changes on the PR branch, test, commit, and push.
6. Do not reply to or resolve review threads unless the user explicitly asks or project policy requires it.

## Create Or Update PR

1. If no PR exists and the current branch is default, create a feature branch from the base.
2. Commit related changes with `git-change-manager`.
3. Rebase on the base ref before push.
4. Push to the correct remote/head branch; use `--force-with-lease` only for updating an existing PR branch after history rewrite.
5. Create or edit the PR with a concise title, summary, testing section, and linked issue when applicable.

## Guardrails

- Never diff against stale local `main`.
- Never delete or rewrite another contributor's work without explicit user direction.
- Never add AI co-author footers.
- Keep GitHub task state separate from durable wiki knowledge unless it becomes source evidence.
