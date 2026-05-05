---
name: topic-evidence-researcher
description: Use when materials, issues, PRs, branches, commits, logs, filenames, symbols, APIs, or feature names require systematic topic evidence across repositories and GitHub.
---

# Topic Evidence Researcher

Build a source-backed topic synthesis by expanding from strong anchors across materials, repositories, history, and GitHub metadata.

## Required Context

Read:

- `AGENTS.md`
- `.agents/workflows/topic-evidence-discovery.md`
- `.agents/workflows/concept-evidence-lookup.md`
- `.agents/workflows/wiki-lookup-and-update.md`
- `.agents/workflows/github-reference-documentation.md`
- `.agents/policies/wiki-content-boundary-policy.md`
- `.agents/policies/source-and-citation-policy.md`
- `.agents/policies/repository-workspace-policy.md`
- `config/target-set.yml`

Use `document-material-ingester` first when the topic starts from files, folders, or archives.
Use `concept-evidence-lookup` when the topic depends on important acronyms, platform concepts, protocols, APIs, or source identifiers that need stable definitions from repositories, GitHub, or official external docs.

## Discovery

1. Search existing `wiki/` coverage.
2. Extract anchors: repo names, issue/PR numbers, branches, commits, files, symbols, APIs, labels, errors, and domain terms.
3. Stabilize important concept definitions early so the synthesis does not inherit vague or source-only terminology.
4. Identify the smallest relevant repository set.
5. Search local source and history with `rg`, `git log --all --grep`, `git log --all -S`, and `git log --all -- <path>` when history matters.
6. Search GitHub issues and PRs with `gh` by keyword, label, author, assignee, path, symbol, branch, commit, and cross-link.
7. Expand from strong matches through linked issues, closing commits, review discussion, labels, milestones, release notes, and follow-up regressions.
8. Classify candidates as primary, supporting, rejected, stale, or open question.

## Synthesis

Write or update the smallest useful `wiki/topics/` page. For advanced or distributed topics, cite or add the foundation layer first: basic terms, non-distributed execution, repository roles, and representative examples. When examples are central, include background concepts, beginner-to-expert progression, cross-repository comparison, optimization techniques, and TODO/design-intended missing examples. When the topic uses material, GitHub, external-document, or cross-repository evidence, create or update the paired `wiki/evidence/<topic>.md` ledger with source set, material routing, repository anchors, GitHub evidence, claim map, negative findings, and open questions. Keep reusable process requirements in `.agents/`, not in topic pages.

Do not claim exhaustive discovery unless the search scope and queries make that defensible. Prefer listing the anchors searched and the strongest related evidence.
