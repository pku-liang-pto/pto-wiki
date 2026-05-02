# Repository Documenter Skill

Use this skill when documenting a repository in a configured target set.

## Steps

1. Read `AGENTS.md`.
2. Read `.agents/workflows/repo-documentation.md`.
3. Read `.agents/workflows/dependency-and-code-analysis.md`.
4. Read `.agents/policies/source-and-citation-policy.md`.
5. Read `.agents/policies/repository-workspace-policy.md`.
6. Identify the repository in `config/target-set.yml`.
7. Clone or sync the repository under `projects/<group>/<repository-name>/` only when source inspection is required.
8. Record the inspected commit SHA, tag, or branch state.
9. Inspect README, dependency files, build files, `.gitmodules`, nested repositories, vendored dependency directories, source layout, tests, examples, scripts, and CI.
10. Create or update a repository profile using `.agents/templates/repo-profile.md`.
11. Mark verified facts, inferred architecture, and open questions separately.
