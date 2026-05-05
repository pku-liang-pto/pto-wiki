# Agent Workflow Model

This repository separates reusable agent behavior from target-specific wiki facts.

## Loading Model

Agents should not pre-read every workflow and policy file. Use this order:

1. Read `AGENTS.md`.
2. Select the smallest matching skill from `.agents/skills/`.
3. Read only the workflows and policies named by that skill.
4. Update `wiki/` only for target-set knowledge.
5. Update `.agents/` for reusable process, quality gates, command patterns, or templates.

## Directory Roles

- `.agents/skills/`: auto-triggerable unit capabilities. A skill should answer "when should I load this behavior?"
- `.agents/workflows/`: reusable multi-step procedures that skills reference as needed.
- `.agents/policies/`: durable constraints that apply across workflows.
- `.agents/templates/`: reusable page/evidence skeletons.
- `.agents/agents/`: reviewer role profiles for content review and learning-quality audits.

## Skill Granularity

Prefer unit skills over workflow-shaped mega-skills:

- Good: `concept-evidence-lookup`, `wiki-health-linter`, `github-pr-reviewer`.
- Too broad: one skill that claims to handle all wiki, GitHub, repository, material, and branch work.
- Too narrow: one skill per file, command, or checklist row.

When a user asks for a broad operation, use a router skill or `agent-command-reference.md` to choose the unit skill.

## Current Core Skill Families

- Wiki knowledge: `wiki-evidence-maintainer`, `topic-evidence-researcher`, `repository-evidence-documenter`, `document-material-ingester`, `concept-evidence-lookup`, `wiki-health-linter`.
- GitHub operations: `github-pr-checkout`, `github-pr-reviewer`, `github-pr-publisher`, `github-pr-operator`, `github-issue-operator`, `github-branch-cleaner`.
- Change management: `git-change-manager`.

Keep this file target-set agnostic. Put PTO-specific facts in `wiki/` or `config/target-set.yml`.
