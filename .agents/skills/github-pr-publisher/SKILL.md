---
name: github-pr-publisher
description: Use when creating a new GitHub pull request, updating an existing PR branch, pushing committed changes for review, or preparing a PR summary and testing section.
---

# GitHub PR Publisher

Publish committed work to the correct remote and create or update a PR.

## Required Context

Read:

- `AGENTS.md`
- `.agents/policies/agent-workflow-policy.md`
- `.agents/skills/git-change-manager/SKILL.md`
- `.agents/skills/wiki-health-linter/SKILL.md` when wiki files changed

## Workflow

1. Run `gh auth status`.
2. Detect repo, branch, remotes, base branch, dirty state, and existing PR:
   ```bash
   gh repo view --json owner,name,defaultBranchRef
   git branch --show-current
   git remote -v
   git status --short
   gh pr view --json number,title,state,url,headRefName,baseRefName 2>/dev/null || true
   ```
3. If there are uncommitted changes, use `git-change-manager` to verify, stage, and commit related files.
4. Fetch and rebase on the base branch unless project policy or branch state makes rebase inappropriate.
5. Push to the correct branch. Use `--set-upstream` for first push; use `--force-with-lease` only after an intentional local history rewrite.
6. Create or update the PR with:
   - concise title
   - summary of changed behavior or documentation
   - testing / verification commands
   - linked issue when applicable

## Guardrails

- Do not push unreviewed unrelated changes.
- Do not add AI co-author trailers.
- Do not create a PR from the default branch; create a feature branch first.
- For docs-only wiki changes, run link/build checks when available before publishing.
