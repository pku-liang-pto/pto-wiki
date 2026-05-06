# Wiki Review And Feedback Workflow

Use through `wiki-review-maintainer`.

## Review

1. Check whether the page can teach the topic without opening source links.
2. Check important concepts have local definitions and status boundaries.
3. Check examples include source-shaped code, source excerpts, expected behavior, and proof boundaries when implementation behavior is discussed.
4. Check tables summarize already-explained knowledge instead of replacing explanation.
5. Check Future content is not mixed into implemented behavior pages without clear labels.
6. Check durable factual claims include nearby citations.
7. Check changed durable pages are linked from `wiki/index.md` or an area index.
8. Check `wiki/log.md` has an append-only entry when the operation changes durable wiki knowledge.

## Feedback Integration

1. Fetch issue, PR, or review comments when requested.
2. Classify each comment as content gap, evidence gap, organization gap, writing-quality gap, Future/roadmap gap, harness gap, PR mechanics, or non-actionable.
3. Map actionable comments to target pages or `.agents` files.
4. Ask for human judgement when scope, interpretation, or promotion is unclear.
5. Route PR mechanics through `github-pr-operator`.
6. Route recurring harness failures through `agent-harness-maintainer`.
7. Run `wiki-verification.md` checks before commit or PR update.

## Content Lint

Look for sparse pages, orphaned pages, stale summaries, conflicting claims, missing concept pages for repeated terms, missing paired evidence ledgers, distributed-only explanations without foundations, example pages that only list coverage, and public material pages that read like raw extracted files instead of maintained learning material.

Save reports only when the report itself is useful to future maintainers. Otherwise summarize findings in the current response.
