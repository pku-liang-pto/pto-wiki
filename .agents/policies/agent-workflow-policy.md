# Agent Workflow Policy

Reusable agent process belongs in `.agents/`; target-set knowledge belongs in `wiki/`.

## Routing

- Start from the user's task, not from the full workflow directory.
- Load the smallest matching skill.
- Load only workflows, policies, templates, and references directly needed by that skill.
- If multiple skills match, prefer the most specific one and use a broader operator only when the request spans multiple operations.

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
