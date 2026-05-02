# Wiki Lookup And Update Workflow

Use this workflow for questions about the target set, repository behavior, dependencies, APIs, architecture, or toolchain concepts.

## Lookup Steps

1. Read `config/target-set.yml` to understand the configured target set.
2. Search `wiki/` for existing coverage.
3. If the wiki answer is missing, stale, or too shallow, inspect upstream repositories or documentation.
4. Prefer primary sources: repository files, upstream docs, releases, tags, commits, issue discussions from maintainers, and official project pages.
5. Answer with clear human-readable explanation.
6. Decide whether the durable knowledge should update `wiki/`.

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
