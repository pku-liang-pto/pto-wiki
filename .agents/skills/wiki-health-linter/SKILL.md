---
name: wiki-health-linter
description: Use when checking wiki organization, local links, index coverage, citations, sparse pages, stale claims, or maintainability after wiki updates.
---

# Wiki Health Linter

Check that wiki edits remain navigable, cited, and human-readable.

## Required Context

Read:

- `.agents/workflows/wiki-health-and-lint.md`
- `.agents/policies/wiki-organization-policy.md`
- `.agents/policies/source-and-citation-policy.md`

## Structural Checks

1. Confirm `wiki/index.md`, `wiki/overview.md`, and `wiki/log.md` exist.
2. Confirm every new durable page is linked from `wiki/index.md` or an area index.
3. Check changed Markdown links resolve locally or cite external URLs.
4. Check new pages have meaningful content beyond headings and frontmatter.
5. Check factual durable claims have nearby citations.
6. Check `wiki/log.md` has an append-only entry for durable operations.

## Content Checks

Use when the wiki has grown or after broad updates:

- orphan pages
- stale summaries after newer evidence
- conflicting claims across pages
- sparse pages that should be merged or expanded
- repeated terms missing `wiki/concepts/` coverage
- topic pages missing paired `wiki/evidence/<topic>.md` when they rely on material, GitHub, external-document, or cross-repository synthesis claims
- distributed or advanced topics missing foundation links to basic terms, non-distributed execution, repository profiles, or examples
- example pages missing background concepts, beginner-to-expert progression, cross-repository comparison, optimization notes, or TODO/design-intended missing-example status
- expected target-set questions the wiki still cannot answer

Save a report only when it will help future maintainers. Otherwise summarize issues in the current response.
