---
name: github-evidence-documenter
description: Use when wiki work needs evidence from a GitHub branch, issue, pull request, release, tag, commit, review discussion, or changed-file set.
---

# GitHub Evidence Documenter

Use GitHub metadata as evidence for wiki work, then inspect source at the matching ref before making code or architecture claims.

## Required Context

Read:

- `AGENTS.md`
- `.agents/workflows/github-reference-documentation.md`
- `.agents/policies/repository-workspace-policy.md`
- `.agents/policies/source-and-citation-policy.md`
- `config/target-set.yml`

Run `gh auth status` before relying on private or authenticated GitHub metadata.

## Reference Handling

- Branch: fetch the branch, inspect tip commit, compare against base when useful.
- Pull request: inspect title, body, state, base, head, commits, changed files, and review discussion when relevant; fetch the head/base refs before source inspection.
- Issue: inspect title, body, state, labels, relevant comments, linked PRs/commits, and referenced files.
- Release or tag: inspect notes or tag metadata and the tagged source tree.
- Commit: inspect metadata, diff, touched files, and surrounding source context.

## Citation Standard

For durable wiki claims, cite:

- GitHub URL
- local checkout path under `repositories/<repository-name>/` when used
- inspected ref and commit SHA
- relevant source paths or changed files
- search date when freshness matters

Keep transient review state out of `wiki/` unless it explains durable design, behavior, compatibility, or project history.
