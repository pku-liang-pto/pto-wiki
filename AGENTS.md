# Agent Instructions

This repository is a reusable technical wiki template. Agents must keep reusable behavior separate from target-specific facts.

## Required Reading

Before answering lookup requests, updating the wiki, or documenting repositories, read the relevant files:

- `.agents/workflows/agent-command-reference.md`
- `.agents/workflows/wiki-lookup-and-update.md`
- `.agents/workflows/document-material-ingestion.md`
- `.agents/workflows/repo-documentation.md`
- `.agents/workflows/dependency-and-code-analysis.md`
- `.agents/workflows/github-reference-documentation.md`
- `.agents/workflows/topic-evidence-discovery.md`
- `.agents/workflows/wiki-health-and-lint.md`
- `.agents/policies/wiki-content-boundary-policy.md`
- `.agents/policies/wiki-update-policy.md`
- `.agents/policies/wiki-organization-policy.md`
- `.agents/policies/wiki-writing-style-policy.md`
- `.agents/policies/document-material-policy.md`
- `.agents/policies/source-and-citation-policy.md`
- `.agents/policies/repository-workspace-policy.md`
- `.agents/policies/template-reuse-policy.md`

## Core Rules

- Keep `wiki/` human-readable.
- Keep `wiki/` self-contained enough to learn from directly. Source links, PRs, issues, materials, and evidence ledgers are audit support, not substitutes for explanation.
- Write public wiki narrative mostly in Chinese. Preserve English for code identifiers, repository names, APIs, classes, functions, file paths, PR titles, and source-native technical terms.
- Keep `wiki/index.md`, `wiki/overview.md`, and `wiki/log.md` current enough for navigation, synthesis, and auditability.
- Do not narrow this wiki system to only distributed features. Non-distributed foundations, normal execution flows, basic terminology, and representative examples must be covered before or alongside distributed synthesis.
- Keep `.agents/` target-set agnostic and reusable.
- Put reusable agent process, command patterns, quality gates, and templates in `.agents/`; do not put agent operating instructions in rendered wiki content.
- Put target-specific repository data in `config/target-set.yml`.
- Put target-specific human knowledge in `wiki/`.
- Keep local target repository checkouts in `repositories/`.
- Keep user-supplied document materials in `materials/` or another clearly named workspace. Prefer summarizing durable evidence in `wiki/`, but tracked material bundles are allowed when the user explicitly asks for them or when a pass defines them as source evidence.
- Cite source files, upstream documentation, repository URLs, commits, tags, or releases for factual claims.
- When users provide materials for a topic, trace related issues, PRs, commits, branches, and files before writing a systematic wiki synthesis.
- Treat examples as first-class documentation evidence. Example pages should provide background concepts, beginner-to-expert progression, cross-repository comparison, optimization notes, and explicit TODO/design-intended entries for important missing examples.
- Public pages should be concise but information-rich: prose first, small ASCII diagrams when useful, concrete examples before abstract status tables, and no table-only explanation of important ideas.
- Distinguish verified facts from inferred architecture.
- Do not copy whole upstream documents into this repository.
- Prefer incremental wiki updates over broad rewrites unless restructuring clearly improves correctness or navigation.
- Preserve uncertainty when sources are incomplete, stale, or conflicting.
