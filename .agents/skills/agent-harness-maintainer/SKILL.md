---
name: agent-harness-maintainer
description: Use when changing AGENTS.md, .agents skills, workflows, policies, templates, validator scripts, CI checks, or reusable agent harness behavior.
---

# Agent Harness Maintainer

Maintain reusable agent process. Keep target-set facts in `wiki/` or `config/target-set.yml`, not `.agents/`.

## Load

1. Read `AGENTS.md`.
2. Read `.agents/workflows/agent-harness-maintenance.md`.
3. Read `.agents/policies/agent-workflow-policy.md`.
4. Read the active spec for cross-cutting harness changes.

## Rules

- Small typo, wording, and broken-link fixes can be direct.
- New skills, deleted skills, routing changes, workflow loading changes, validators, CI gates, and cross-task policies require a spec.
- Repeated failures become the smallest useful durable rule: policy, workflow, skill, template, or validator.
