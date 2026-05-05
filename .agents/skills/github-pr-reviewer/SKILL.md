---
name: github-pr-reviewer
description: Use when reviewing a GitHub pull request, analyzing PR changes, checking a branch diff before merge, or giving code/documentation review feedback.
---

# GitHub PR Reviewer

Review the PR-only diff against the correct merge base.

## Required Context

Read:

- `AGENTS.md`
- `.agents/policies/agent-workflow-policy.md`
- `.agents/policies/source-and-citation-policy.md` when review findings affect wiki facts

## Workflow

1. Run `gh auth status`.
2. Fetch PR metadata when a PR number is provided:
   ```bash
   gh pr view <number> --json number,title,body,headRefName,baseRefName,state,author,commits
   ```
3. Fetch the actual base branch:
   ```bash
   git fetch origin <base-branch>
   MERGE_BASE=$(git merge-base origin/<base-branch> HEAD)
   ```
4. Inspect PR-only changes:
   ```bash
   git diff "$MERGE_BASE"...HEAD --stat
   git diff "$MERGE_BASE"...HEAD --name-only
   git diff "$MERGE_BASE"...HEAD
   ```
5. Read surrounding files when diff context is insufficient.
6. Lead the response with findings ordered by severity. Include file/line references for concrete issues.

## Guardrails

- Never review against stale local `main`.
- Do not summarize before listing serious findings.
- Separate correctness risks, maintainability risks, missing tests, and residual uncertainty.
- If there are no findings, say that clearly and mention remaining test gaps or unverified assumptions.
