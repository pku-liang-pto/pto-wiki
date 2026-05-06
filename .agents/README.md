# Agent Workflow Model

This repository separates reusable agent behavior from target-specific wiki facts.

## Loading Model

Agents should not pre-read every workflow and policy file. Use this order:

1. Read `AGENTS.md`.
2. Select one primary wiki/harness skill for wiki or harness tasks.
3. Read only the workflows and policies named by that skill.
4. Update `wiki/` only for target-set knowledge.
5. Update `.agents/` for reusable process, quality gates, command patterns, or templates.

## Primary Skills

Use four primary wiki/harness skills:

- `wiki-qa-maintainer`: answer from wiki, record QA history, and promote selected QA when explicitly ordered.
- `wiki-researcher`: research missing knowledge through concept, repository, material, GitHub, dependency/code, or official internet source modes.
- `wiki-review-maintainer`: review standalone learning quality or integrate issue/PR/review feedback into wiki changes.
- `agent-harness-maintainer`: change `.agents`, validators, CI gates, routing, workflows, policies, and recurring-failure rules.

Use support skills for support operations:

- `github-pr-operator`
- `github-issue-operator`
- `git-change-manager`

## Directory Roles

- `.agents/skills/`: auto-triggerable unit capabilities. A skill should answer "when should I load this behavior?"
- `.agents/workflows/`: reusable multi-step procedures that skills reference as needed.
- `.agents/policies/`: durable constraints that apply across workflows.
- `.agents/templates/`: reusable page/evidence skeletons.
- `.agents/agents/`: reviewer role profiles for content review and learning-quality audits.

## Skill Granularity

Prefer unit skills over workflow-shaped mega-skills:

- Good: `wiki-qa-maintainer`, `wiki-researcher`, `wiki-review-maintainer`, `agent-harness-maintainer`.
- Too broad: one skill that claims to handle all wiki, GitHub, repository, material, and branch work.
- Too narrow: one skill per file, command, or checklist row.

When a user asks for a broad operation, use a router skill or `agent-command-reference.md` to choose the unit skill.

Keep this file target-set agnostic. Put PTO-specific facts in `wiki/` or `config/target-set.yml`.
