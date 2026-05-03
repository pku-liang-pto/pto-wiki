# GitHub Reference Documenter Skill

Use this skill when a wiki task needs GitHub branch, issue, pull request, release, tag, or commit evidence from a configured target repository.

## Steps

1. Read `.agents/workflows/github-reference-documentation.md`.
2. Read `.agents/policies/repository-workspace-policy.md`.
3. Read `.agents/policies/source-and-citation-policy.md`.
4. Resolve the repository from `config/target-set.yml`.
5. Use `gh` for GitHub metadata and local git for source inspection.
6. Fetch the requested branch, PR head/base, tag, or commit before inspecting source.
7. For issues, inspect the issue body, labels, comments when relevant, linked PRs or commits, and referenced files.
8. For PRs, inspect title, body, state, base, head, commits, changed files, and review discussion when relevant.
9. Update `wiki/` only when the finding is durable and source-backed.
10. Cite GitHub URLs, local checkout path, inspected ref, commit SHA, and source file paths.
