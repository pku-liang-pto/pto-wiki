---
name: github-issue-operator
description: Use when creating GitHub issues, deduplicating issue reports, filling issue templates, assigning issues, or fixing a specific issue through branch and PR workflow.
---

# GitHub Issue Operator

Create and work issues through the repository's GitHub templates and branch workflow.

## Setup

1. Run `gh auth status`.
2. Detect repository context with `gh repo view --json owner,name,defaultBranchRef`.
3. Read `.github/ISSUE_TEMPLATE/` before creating an issue when templates exist.

## Create Issue

1. Determine whether input comes from direct user text, a local known-issues file, or another source.
2. Search open issues for duplicates by title and keywords before creating a new issue.
3. Deep-read only likely duplicates or related issues.
4. If exact duplicate exists, report it and stop.
5. Classify the issue by current templates, not memory.
6. Fill every required template field; ask for required information that cannot be inferred.
7. Use command output for inferable environment fields such as current commit, OS/arch, or hardware only when relevant.
8. Create with `gh issue create`, applying template labels and related issue links.

## Fix Issue

1. Fetch issue title, body, state, labels, assignees, and relevant comments.
2. If closed or assigned to someone else, ask before proceeding.
3. Assign to self best-effort when unassigned and permissions allow.
4. Create a branch from the detected base with a prefix matching issue type: `fix/`, `feat/`, `refactor/`, `docs/`, or `support/`.
5. Diagnose or plan before editing when root cause or scope is unclear.
6. Implement, test, commit, and open a PR that references `Fixes #<number>` when appropriate.

## Guardrails

- Do not create issues from stale known-issue entries without verifying they still apply.
- Do not invent required template fields.
- Do not block useful local work solely because best-effort assignment fails.
