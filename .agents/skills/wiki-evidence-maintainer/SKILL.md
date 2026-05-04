---
name: wiki-evidence-maintainer
description: Use when answering target-set lookup questions, updating durable wiki knowledge, maintaining wiki navigation, or deciding whether research belongs in the wiki.
---

# Wiki Evidence Maintainer

Maintain a Markdown-first technical wiki as a sourced knowledge layer, not as a transcript of research.

## Required Context

Read these before acting:

- `AGENTS.md`
- `.agents/workflows/wiki-lookup-and-update.md`
- `.agents/policies/wiki-update-policy.md`
- `.agents/policies/wiki-organization-policy.md`
- `.agents/policies/source-and-citation-policy.md`
- `.agents/policies/repository-workspace-policy.md`
- `config/target-set.yml`

Also read `.agents/policies/document-material-policy.md` when user-supplied materials are involved.

## Core Workflow

1. Search existing `wiki/` before upstream research.
2. Identify the smallest source set that can answer the question.
3. Prefer primary sources: repository files, upstream docs, releases, tags, commits, maintainer issue/PR comments, and official pages.
4. Use local checkouts under `repositories/<repository-name>/` only when source inspection is needed.
5. Record the inspected path, ref, commit SHA, PR, issue, tag, release, material path, checksum, or retrieval date when freshness matters.
6. Separate verified facts, inferred architecture, stale evidence, conflicts, and open questions.
7. Update `wiki/` only when the finding is durable, source-backed, and useful without replaying raw research.

## Update Shape

- Use the smallest relevant page.
- Create new pages only for durable standalone scope.
- Put repository profiles in `wiki/repositories/`.
- Put user material source summaries in `wiki/sources/`.
- Put feature, behavior, workflow, and issue-family synthesis in `wiki/topics/`.
- Put reusable terms and architecture concepts in `wiki/concepts/`.

When navigation or synthesis changes, update `wiki/index.md`, the relevant area index, `wiki/overview.md`, and append `wiki/log.md`.

## Boundaries

- Do not put target-specific facts in `.agents/`.
- Do not copy whole upstream or user-supplied documents into `wiki/`.
- Do not update the wiki for one-off debugging state, unsupported guesses, or transient command output.
- Keep GitHub task state separate from durable wiki knowledge unless it explains durable design or compatibility.
