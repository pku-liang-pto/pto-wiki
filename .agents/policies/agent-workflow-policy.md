# Agent Workflow Policy

Reusable agent process belongs in `.agents/`; target-set knowledge belongs in `wiki/`.

## Routing

- Start from the user's task, not from the full workflow directory.
- For wiki and harness tasks, choose one of four primary skills: `wiki-qa-maintainer`, `wiki-researcher`, `wiki-review-maintainer`, or `agent-harness-maintainer`.
- Use support skills for support operations: `github-pr-operator`, `github-issue-operator`, and `git-change-manager`.
- Load only workflows, policies, templates, and references directly needed by that skill.
- If multiple skills match, prefer the most specific one and use a broader operator only when the request spans multiple operations.

## Request Classes

- QA/update: answer from wiki, record QA history, or promote selected QA into curated wiki pages.
- Research: inspect source modes for missing knowledge.
- Review/feedback: review wiki quality or integrate issue/PR/review comments.
- Harness: update `.agents`, validators, CI, policies, workflows, skills, or routing.
- Support operation: GitHub PRs, GitHub issues, or commits.

## Skill Shape

Skills should be triggerable units:

- frontmatter `description` states when to use the skill, not the whole process
- body is concise and points to workflows/policies for detail
- no target-specific facts unless the skill is intentionally repository-local
- no duplicate long workflow copied across multiple skills

## Workflow Shape

Workflows are reference procedures. They may be longer than skills and may be shared by multiple skills. They should not be globally required reading for every task.

## Wiki Boundary

Do not put agent operating instructions in rendered wiki pages. If a statement tells an agent how to work, put it in `.agents/`. If it teaches a human reader target-set knowledge, put it in `wiki/`.

## Persistent Memory Placement

- Raw QA history belongs under `wiki/evidence/qa/`.
- Curated implemented knowledge belongs under `wiki/repositories/`, `wiki/examples/`, `wiki/topics/`, or `wiki/concepts/`.
- Curated future, ongoing, roadmap, task-division, blocker, missing-example, planned, or design-intended knowledge belongs under `wiki/future/` unless verified as implemented.
- Reusable process rules belong under `.agents/`.

## Verification

Start with mechanical checks:

- `.agents` or `AGENTS.md` changes: `npm run agents:check`.
- wiki Markdown changes: `npm run wiki:links`.
- rendered wiki or navigation changes: `npm run docs:build:pages`.
- all committed work: `git diff --check`.

Use reviewer judgement, not brittle scripts, for table-heavy writing, evidence-ledger placement, and standalone learning quality until those heuristics are stable.
