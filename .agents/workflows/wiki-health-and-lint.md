# Wiki Health And Lint Workflow

Use this workflow to keep the wiki organized, queryable, and safe to update.

## Structural Health

Run these checks before and after durable wiki maintenance:

1. Verify `wiki/index.md`, `wiki/overview.md`, and `wiki/log.md` exist.
2. Verify every new durable page is linked from `wiki/index.md` or an area index.
3. Check Markdown links changed in the update for broken local targets.
4. Check new pages have meaningful body content beyond headings and frontmatter.
5. Check major topic and repository pages explain the knowledge directly, not only through tables or links to external sources.
6. Check public learning pages follow the writing style policy: mostly Chinese narrative, English technical identifiers preserved, concise but information-rich prose, and diagrams/examples where they reduce cognitive load.
7. Check durable factual claims include nearby citations.
8. Check `wiki/log.md` has an append-only entry for the operation.

## Content Lint

Use periodically or when the wiki has grown after several updates:

- orphan pages not reachable from the index or area indexes
- stale summaries after newer evidence
- conflicting claims across pages
- sparse pages that should be merged or expanded
- pages that read like a learning guide to outside sources instead of standalone learning material
- public pages written primarily as English/internal process prose when Chinese learning narrative would be clearer for this wiki
- long repository/topic/example pages missing an opening `How To Read This Page` section or equivalent lookup guidance
- pages where tables are the only explanation for core concepts
- missing topic or concept pages for terms repeatedly referenced in multiple pages
- missing paired `wiki/evidence/<topic>.md` pages for topic pages that rely on material, GitHub, external-document, or cross-repository synthesis claims
- distributed or advanced topic pages without links to foundation concepts, non-distributed execution, repository profiles, or examples
- example pages that only list coverage without explaining background concepts, beginner-to-expert ordering, cross-repository comparison, optimization techniques, and missing-example TODO/design-intended status
- data gaps where the wiki cannot answer an expected target-set question

## Scope Boundary

Do not build or require graph data. Link checks and page organization checks are enough for this template.

Save reports only when the report itself is useful to future maintainers. Otherwise summarize findings in the current response.
