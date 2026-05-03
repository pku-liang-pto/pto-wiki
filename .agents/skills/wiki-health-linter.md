# Wiki Health Linter Skill

Use this skill when checking wiki organization, local links, index coverage, stale pages, missing citations, or maintainability after wiki updates.

## Steps

1. Read `.agents/workflows/wiki-health-and-lint.md`.
2. Read `.agents/policies/wiki-organization-policy.md`.
3. Confirm `wiki/index.md`, `wiki/overview.md`, and `wiki/log.md` exist.
4. Check new or changed durable pages are reachable from `wiki/index.md` or an area index.
5. Check changed Markdown links resolve locally or cite external URLs.
6. Check new pages have real content beyond headings and frontmatter.
7. Check durable factual claims have nearby citations.
8. Check `wiki/log.md` records durable wiki operations.
9. Report structural issues separately from content-quality suggestions.
