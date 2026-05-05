# Wiki Lookup And Update Workflow

Use this workflow for questions about the target set, repository behavior, dependencies, APIs, architecture, or toolchain concepts.

## Lookup Steps

1. Read `config/target-set.yml` to understand the configured target set.
2. Search `wiki/` for existing coverage.
3. If the wiki answer is missing, stale, or too shallow, locate the smallest relevant upstream repositories or documentation.
4. Prefer primary sources: repository files, upstream docs, releases, tags, commits, issue discussions from maintainers, and official project pages.
5. Clone missing repositories lazily under `repositories/<repository-name>/` only when source inspection is needed.
6. Before relying on an existing checkout when freshness matters, fetch or sync it against the configured upstream.
7. Inspect repository docs, build files, dependency files, source layout, tests, examples, CI, and relevant commits or releases as required by the question.
8. For branch, issue, or PR questions, inspect the requested GitHub object and the relevant ref instead of assuming the default branch.
9. For material-driven topic questions, use `.agents/workflows/topic-evidence-discovery.md` to search related issues, PRs, commits, branches, and files before synthesizing wiki knowledge.
10. When local checkout evidence is used, record the checkout path, ref, and commit SHA in the answer or wiki citation.
11. Answer with clear human-readable explanation. For public wiki updates, follow `.agents/policies/wiki-writing-style-policy.md`: Chinese narrative by default, English technical identifiers preserved, prose-first, self-contained, and concise but information-rich.
12. Decide whether the durable knowledge should update `wiki/`.
13. If updating `wiki/`, maintain `wiki/index.md`, relevant area indexes, `wiki/overview.md`, and `wiki/log.md` according to `.agents/policies/wiki-organization-policy.md`.
14. If the update is about agent process, command patterns, placement rules, or reusable quality gates, update `.agents/` or `AGENTS.md` instead of rendered wiki pages.

## Update Decision

Update the wiki when the finding is:

- durable beyond the current conversation
- source-backed
- likely to help future readers
- understandable without replaying raw research

Do not update the wiki for:

- one-off debugging state
- unsupported guesses
- transient command output
- facts that are likely to change immediately without a stable reference

## Update Shape

Add knowledge to the smallest relevant page. Create a new page only when the topic has enough durable scope to stand alone. Include source links or local file references with each factual section.

Use `.agents/policies/wiki-content-boundary-policy.md` before writing process-heavy text. `wiki/` should explain target-set knowledge; `.agents/` should explain how agents work.

When citing local checkout evidence, include the local path, ref, commit SHA or tag inspected, and the relevant file path. Prefer upstream URLs with commits, tags, pull requests, issues, or releases when they are available.

New repository profiles belong under `wiki/repositories/`. Topic pages that depend on user-supplied materials, GitHub issues or PRs, external documents, or cross-repository synthesis must have and cite a paired `wiki/evidence/<topic>.md` ledger near the claims it supports. Small topic pages based only on nearby direct repository citations do not need a paired evidence page. Feature, behavior, workflow, and issue-family syntheses belong under `wiki/topics/`. Reusable technical terms belong under `wiki/concepts/`.
