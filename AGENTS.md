# Agent Instructions

This repository is a reusable technical wiki template. Agents must keep reusable behavior separate from target-specific facts.

## Required Reading

Before answering lookup requests, updating the wiki, documenting repositories, or operating GitHub tasks:

1. Read `.agents/README.md` and `.agents/policies/agent-workflow-policy.md`.
2. Select the smallest matching skill from `.agents/skills/`.
3. Read only the workflows and policies named by that skill.

Do not pre-read every workflow file. Workflows are reference procedures loaded through skills, not global required context.

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
- Keep ad hoc user-supplied document materials in `materials/` or another clearly named local workspace; preserve raw originals and record checksums/conversion methods for used materials. Track raw material bundles under `wiki/materials/` only when the user explicitly wants them public, expose them through a `wiki/materials/` index, and cite them as audit/source-material evidence.
- Cite source files, upstream documentation, repository URLs, commits, tags, or releases for factual claims.
- Stabilize important concept explanations before writing answers or wiki updates. For acronyms, protocols, platform components, APIs, runtime layers, hardware terms, or code identifiers that matter to the reader, look up existing wiki coverage, local repository source, GitHub history, or official internet documentation as needed; then define the concept locally with status and citations.
- When users provide materials for a topic, trace related issues, PRs, commits, branches, and files before writing a systematic wiki synthesis.
- Treat examples as first-class documentation evidence. Example pages should provide background concepts, beginner-to-expert progression, cross-repository comparison, optimization notes, and explicit TODO/design-intended entries for important missing examples.
- Public pages should be concise but information-rich: prose first, small ASCII diagrams when useful, concrete examples before abstract status tables, and no table-only explanation of important ideas.
- Distinguish verified facts from inferred architecture.
- Do not copy whole upstream documents into this repository.
- Prefer incremental wiki updates over broad rewrites unless restructuring clearly improves correctness or navigation.
- Preserve uncertainty when sources are incomplete, stale, or conflicting.
