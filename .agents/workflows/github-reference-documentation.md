# GitHub Reference Documentation Workflow

Use this workflow when documenting a specific branch, issue, pull request, release, or commit from a repository in the target set.

For material-driven topic research that needs to find multiple related issues or PRs, use `.agents/workflows/topic-evidence-discovery.md` before writing the wiki synthesis.

## Setup

1. Read `AGENTS.md`.
2. Read `config/target-set.yml`.
3. Identify the target repository and checkout path under `repositories/<repository-name>/`.
4. Use `gh` when GitHub metadata is needed and local git for source inspection.

## Reference Types

- Branch: fetch the branch, inspect its tip commit, and compare against the relevant base when useful.
- Pull request: inspect PR title, body, state, base branch, head branch, commits, changed files, review discussion when relevant, and the checked-out head ref.
- Issue: inspect issue title, body, state, labels, comments when relevant, linked PRs or commits, and referenced files.
- Release or tag: inspect release notes or tag metadata and the tagged source tree.
- Commit: inspect the commit metadata, diff, touched files, and surrounding source context.

## Documentation Standard

Explain what the reference changes or reveals, why it matters to the target set, and what evidence supports the claim. Keep durable findings in `wiki/`; keep transient review state out unless it explains a durable design or compatibility fact.

Citations should include GitHub URLs and, when source was checked out locally, `repositories/<repository-name>/`, the inspected ref, commit SHA, and relevant file paths.
