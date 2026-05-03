# Repository Documenter Skill

Use this skill when documenting a repository in a configured target set.

## Steps

1. Read `AGENTS.md`.
2. Read `.agents/workflows/repo-documentation.md`.
3. Read `.agents/workflows/dependency-and-code-analysis.md`.
4. Read `.agents/workflows/github-reference-documentation.md` when the task names a branch, issue, PR, release, or commit.
5. Read `.agents/policies/source-and-citation-policy.md`.
6. Read `.agents/policies/repository-workspace-policy.md`.
7. Identify the repository in `config/target-set.yml`.
8. Clone or sync the repository under `repositories/<repository-name>/` only when source inspection is required.
9. Record the inspected commit SHA, tag, branch, issue, PR, or release state.
10. Inspect README, dependency files, build files, `.gitmodules`, nested repositories, vendored dependency directories, source layout, tests, examples, scripts, and CI.
11. Create or update a repository profile using `.agents/templates/repo-profile.md`.
12. Mark verified facts, inferred architecture, and open questions separately.
