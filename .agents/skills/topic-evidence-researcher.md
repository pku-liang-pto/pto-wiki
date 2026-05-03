# Topic Evidence Researcher Skill

Use this skill when supplied materials describe a topic, feature, bug class, behavior, or design and the wiki needs systematic source-backed knowledge across related issues, PRs, commits, branches, and files.

## Steps

1. Read `.agents/workflows/topic-evidence-discovery.md`.
2. Read `.agents/skills/wiki-lookup-and-updater.md`.
3. Read `.agents/skills/github-reference-documenter.md`.
4. Read `.agents/skills/repository-workspace-manager.md`.
5. Extract search anchors from the supplied materials.
6. Search existing `wiki/` and configured repositories before broad external search.
7. Use `gh` to search related issues and PRs when GitHub metadata is relevant.
8. Expand from strong matches through cross-links, commits, branches, labels, milestones, changed files, and comments when relevant.
9. Classify evidence as primary, supporting, or rejected.
10. Update the wiki with a synthesis only when the finding is durable and sourced.
11. Cite supplied materials, GitHub URLs, local checkout paths, inspected refs, commit SHAs, and source files.
