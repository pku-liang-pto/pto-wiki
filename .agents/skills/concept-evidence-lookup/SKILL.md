---
name: concept-evidence-lookup
description: Use when answering questions or updating documentation that introduces, relies on, or explains important concepts, acronyms, protocols, platform components, code identifiers, APIs, or repository-specific terms that may require lookup from official internet sources, GitHub history, or local code repositories.
---

# Concept Evidence Lookup

Stabilize important concept explanations before writing public wiki content or user-facing answers.

## Required Context

Read:

- `AGENTS.md`
- `.agents/workflows/concept-evidence-lookup.md`
- `.agents/policies/source-and-citation-policy.md`
- `.agents/policies/wiki-writing-style-policy.md` when writing public wiki content
- `config/target-set.yml` when the concept is target-set specific

## Workflow

1. Identify important concepts in the user request or draft text.
2. Search existing `wiki/` first for prior definitions and status labels.
3. Search local target repositories with `rg` when the concept is code-specific or implementation-specific.
4. Inspect GitHub issues, PRs, branches, commits, or reviews when the concept appears in project history or design discussion.
5. Use official internet documentation for external protocols, platform components, libraries, hardware, and version-sensitive behavior.
6. Write a local explanation: canonical name, aliases, concise definition, mental model or diagram when useful, project-specific role, status boundary, and nearby citations.
7. If a concept recurs across pages, add or update a reusable `wiki/concepts/` entry and link it from the page that introduced the concept.

## Guardrails

- Do not cite a source path or external URL as a replacement for explaining the concept.
- Do not claim current behavior from design material alone.
- Do not use stale checkout evidence when freshness affects the answer.
- Prefer official documentation and repository source over blog posts or secondary summaries.
- Preserve conflicts and unresolved scope as `open question`.
