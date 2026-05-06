# Wiki QA And Update Workflow

Use through `wiki-qa-maintainer`.

## QA Flow

1. Search `wiki/` first.
2. If the wiki is sufficient, answer from wiki and cite relevant wiki/source evidence.
3. If the wiki is missing, stale, or shallow, use `wiki-researcher`.
4. Record QA history under `wiki/evidence/qa/`.
5. Do not update curated wiki pages unless the user explicitly asks.
6. When the user asks to update the wiki from QA history, synthesize selected QA into the smallest curated page.
7. Promote future-facing synthesis to `wiki/future/`, not raw QA.

## QA History Shape

Each QA history entry should record:

- date
- question
- short answer
- whether the answer came from wiki or fresh research
- source trail: wiki pages, repository paths, material paths, GitHub URLs, official docs
- uncertainty or open questions
- promotion status: `not-promoted`, `promoted`, or `rejected`

## Update Decision

Update curated wiki pages only when the finding is durable beyond the current conversation, source-backed, useful to future readers, and understandable without replaying raw research.

Do not promote one-off debugging state, unsupported guesses, transient command output, or facts likely to change immediately without a stable reference.

## Update Shape

Add knowledge to the smallest relevant page. Create a new page only when the topic has enough durable scope to stand alone.

When updating public wiki pages, keep `wiki/index.md`, relevant area indexes, `wiki/overview.md`, and `wiki/log.md` current when navigation, synthesis, or audit history changes.
