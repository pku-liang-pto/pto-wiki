# Agent Harness Maintenance Workflow

Use through `agent-harness-maintainer`.

## Change Classes

- Small direct fix: typo, wording, broken local link.
- Skill change: trigger or concise behavior changes.
- Workflow change: source mode, QA, review, Future placement, GitHub operation, or verification procedure.
- Policy change: durable rule that must hold across workflows.
- Validator change: cheap mechanical check.
- Router change: `AGENTS.md`, `.agents/README.md`, or skill family reshaping.

## Spec Requirement

Require a spec for new skills, deleted or renamed skills, routing changes, workflow loading changes, validators, CI gates, and cross-task policies.

## Escalation

Repeated failures become the smallest useful durable rule:

- page-local issue: fix page only
- repeated writing failure: writing policy or review workflow
- repeated evidence failure: source policy or research workflow
- repeated routing failure: skill or agent workflow policy
- cheap mechanical miss: validator

## Boundaries

Keep `.agents/` target-set agnostic and reusable. Keep target-specific facts in `wiki/` or `config/target-set.yml`.

Do not put agent operating instructions in rendered wiki content. Do not make public wiki pages depend on reading `.agents` process files.
