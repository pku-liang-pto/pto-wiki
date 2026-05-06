# Wiki Verification Workflow

Use before committing wiki or harness changes.

## Mechanical Checks

- `npm run agents:check` for `.agents` or `AGENTS.md` changes when available.
- `npm run wiki:links` for wiki Markdown changes when available.
- `npm run docs:build:pages` for rendered wiki, nav, sidebar, or VitePress changes when available.
- `git diff --check` before commit.

## Harness Checks

- Skill directories contain `SKILL.md`.
- Skill frontmatter has `name` and `description`.
- Skill folder names match frontmatter names.
- Primary routing points to `wiki-qa-maintainer`, `wiki-researcher`, `wiki-review-maintainer`, `agent-harness-maintainer`, `github-pr-operator`, `github-issue-operator`, and `git-change-manager`.
- Active `.agents` references do not point to deleted skills or workflows.

## Human Review Checks

- Does public wiki content teach locally instead of only linking out?
- Are important concepts defined?
- Are implemented, future, design-intended, and open-question claims separated?
- Is Future content under `wiki/future/` when it is durable planned or ongoing work?
- Are raw QA histories under `wiki/evidence/qa/`?
- Are material, GitHub, external-document, or cross-repository topic claims supported by evidence ledgers when needed?
