# Agent Instructions

This repository is a reusable technical wiki template. Agents must keep reusable behavior separate from target-specific facts.

## Required Reading

Before answering lookup requests, updating the wiki, or documenting repositories, read the relevant files:

- `.agents/workflows/wiki-lookup-and-update.md`
- `.agents/workflows/repo-documentation.md`
- `.agents/workflows/dependency-and-code-analysis.md`
- `.agents/policies/wiki-update-policy.md`
- `.agents/policies/source-and-citation-policy.md`
- `.agents/policies/repository-workspace-policy.md`
- `.agents/policies/template-reuse-policy.md`

## Core Rules

- Keep `wiki/` human-readable.
- Keep `.agents/` target-set agnostic and reusable.
- Put target-specific repository data in `config/target-set.yml`.
- Put target-specific human knowledge in `wiki/`.
- Cite source files, upstream documentation, repository URLs, commits, tags, or releases for factual claims.
- Distinguish verified facts from inferred architecture.
- Do not copy whole upstream documents into this repository.
- Prefer incremental wiki updates over broad rewrites unless restructuring clearly improves correctness or navigation.
- Preserve uncertainty when sources are incomplete, stale, or conflicting.
