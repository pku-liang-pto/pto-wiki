---
name: wiki-qa-maintainer
description: Use when answering questions from the wiki, recording persistent QA history, or promoting selected QA findings into curated wiki pages.
---

# Wiki QA Maintainer

Answer from existing wiki knowledge first. Research only when the wiki is missing, stale, or too shallow.

## Load

1. Read `AGENTS.md`.
2. Read `.agents/workflows/wiki-qa-and-update.md`.
3. Read `.agents/workflows/wiki-research.md` only when source research is needed.
4. Read `.agents/workflows/wiki-verification.md` before committing wiki updates.

## Rules

- Record raw QA history under `wiki/evidence/qa/`.
- Do not edit curated wiki pages unless the user explicitly asks for promotion or update.
- Future-facing QA still stays in `wiki/evidence/qa/`; curated future summaries belong under `wiki/future/`.
