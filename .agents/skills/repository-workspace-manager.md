# Repository Workspace Manager Skill

Use this skill when cloning, syncing, checking out refs, or inspecting local target repositories for wiki lookup or documentation.

## Steps

1. Read `.agents/policies/repository-workspace-policy.md`.
2. Read `config/target-set.yml`.
3. Resolve the repository by configured name, not by guessing from URLs.
4. Use `repositories/<repository-name>/` as the checkout path.
5. Clone lazily only when source inspection is required.
6. Before relying on an existing checkout, inspect local status and preserve local changes.
7. Fetch or sync the configured upstream when freshness matters.
8. For branch, issue, PR, tag, or commit tasks, fetch the requested ref and record the exact ref and commit SHA inspected.
9. Never stage or commit repository checkout contents into this wiki repository.
