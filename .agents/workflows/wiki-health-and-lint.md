# Wiki Health And Lint Workflow

Use this workflow to keep the wiki organized, queryable, and safe to update.

## Structural Health

Run these checks before and after durable wiki maintenance:

1. Verify `wiki/index.md`, `wiki/overview.md`, and `wiki/log.md` exist.
2. Verify every new durable page is linked from `wiki/index.md` or an area index.
3. Check Markdown links changed in the update for broken local targets.
4. Check new pages have meaningful body content beyond headings and frontmatter.
5. Check major topic and repository pages explain the knowledge directly, not only through tables or links to external sources.
6. Check public top navigation and left sidebar expose the same primary hierarchy: Home, Repositories, Examples, Topics, Concepts, Materials. Evidence, Usage, Log, Projects, and Toolchain Map may remain linked but should not become primary public learning sidebar areas.
7. Check public navigation labels are descriptive enough to identify the page subject without opening it. Avoid vague labels such as `Stack`, `README`, or `Overview` when the page has a concrete topic.
8. Check public learning pages follow the writing style policy: mostly Chinese narrative, English technical identifiers preserved, concise but information-rich prose, and diagrams/examples where they reduce cognitive load.
9. Check public `wiki/materials/` pages meet the same self-contained reading bar as other public pages: important acronyms and platform terms are defined at first use, source paths are explained locally, and design-intended claims remain labeled.
10. Audit Markdown table blocks in changed public pages. For each table, ask whether the surrounding prose already explains the concept; if the table lists files, modules, examples, commands, statuses, or sources, it must be lookup support rather than the teaching content.
11. Check durable factual claims include nearby citations.
12. Check `wiki/log.md` has an append-only entry for the operation.

## Content Lint

Use periodically or when the wiki has grown after several updates:

- orphan pages not reachable from the index or area indexes
- stale summaries after newer evidence
- conflicting claims across pages
- sparse pages that should be merged or expanded
- pages that read like a learning guide to outside sources instead of standalone learning material
- public pages written primarily as English/internal process prose when Chinese learning narrative would be clearer for this wiki
- public sidebar or nav entries with overly compressed labels that make pages hard to choose
- long repository/topic/example pages missing an opening `How To Read This Page` section or equivalent lookup guidance
- pages where tables are the only explanation for core concepts
- repository or topic pages where module/source-path tables replace architecture prose
- example pages where run tables replace source-shaped walkthroughs and expected behavior explanation
- repository/topic/example pages that discuss implemented code but contain no embedded source excerpt or source-shaped pseudocode
- public material pages that read like raw extracted files instead of maintained learning material
- material pages that introduce specialized terms without concise in-page definitions and a local mental model
- source-path tables that are not followed by explanation of what the code proves and does not prove
- missing topic or concept pages for terms repeatedly referenced in multiple pages
- missing paired `wiki/evidence/<topic>.md` pages for topic pages that rely on material, GitHub, external-document, or cross-repository synthesis claims
- distributed or advanced topic pages without links to foundation concepts, non-distributed execution, repository profiles, or examples
- example pages that only list coverage without explaining background concepts, beginner-to-expert ordering, cross-repository comparison, optimization techniques, and missing-example TODO/design-intended status
- data gaps where the wiki cannot answer an expected target-set question

## Scope Boundary

Do not build or require graph data. Link checks and page organization checks are enough for this template.

Save reports only when the report itself is useful to future maintainers. Otherwise summarize findings in the current response.
