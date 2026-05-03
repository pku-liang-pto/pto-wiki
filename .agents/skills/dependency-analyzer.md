# Dependency Analyzer Skill

Use this skill when documenting dependencies, submodules, vendored code, generated source, or repository relationships for a target repository.

## Steps

1. Read `.agents/workflows/dependency-and-code-analysis.md`.
2. Read `.agents/policies/source-and-citation-policy.md`.
3. Identify and sync the target checkout with `.agents/skills/repository-workspace-manager.md`.
4. Inspect `.gitmodules`, nested git repositories, vendored directories, package manifests, lockfiles, build files, source-fetch scripts, generated-code configuration, and CI setup.
5. Check references to other repositories in `config/target-set.yml`.
6. For PR or branch analysis, compare dependency evidence against the relevant base branch when useful.
7. Summarize verified relationships separately from inferred relationships.
8. Cite local paths with ref and commit SHA, plus upstream URLs when available.
