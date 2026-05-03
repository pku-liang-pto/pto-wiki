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
9. When local checkout evidence is used, record the checkout path, ref, and commit SHA in the answer or wiki citation.
10. Answer with clear human-readable explanation.
11. Decide whether the durable knowledge should update `wiki/`.

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

When citing local checkout evidence, include the local path, ref, commit SHA or tag inspected, and the relevant file path. Prefer upstream URLs with commits, tags, pull requests, issues, or releases when they are available.
