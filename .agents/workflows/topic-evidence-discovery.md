# Topic Evidence Discovery Workflow

Use this workflow when the user provides materials about a topic, feature, design, bug class, or behavior and wants systematic wiki knowledge for a configured repository or target set.

## Inputs

Materials may include prose, issue or PR URLs, branch names, commits, design notes, logs, stack traces, filenames, symbols, APIs, error messages, or feature names.

## Discovery Steps

1. Read `AGENTS.md`, `config/target-set.yml`, and existing `wiki/` coverage.
2. Extract search anchors from the materials: repository names, people or teams, issue and PR numbers, branch names, commits, files, symbols, APIs, labels, error messages, and domain terms.
3. Identify the smallest relevant repository set. Use `repositories/<repository-name>/` for local checkouts when source inspection is needed.
4. Search local source and history when available:
   - `rg` for symbols, filenames, errors, and feature terms
   - `git log --all --grep`, `git log --all -S`, and `git log --all -- <path>` when history matters
   - tags, branches, and release notes when the topic is versioned
5. Search GitHub evidence with `gh` when available:
   - issues and PRs by keyword, label, author, assignee, file path, symbol, branch, commit, and linked references
   - PR commits, changed files, review threads or comments when relevant
   - issue comments and linked PRs or commits when they affect the topic
6. Expand the evidence set from strong matches:
   - issue and PR cross-links
   - closing keywords and linked commits
   - branch names, commit messages, release notes, labels, milestones, and referenced files
   - follow-up issues or regressions that change the durable understanding
7. Classify candidates as:
   - primary: directly about the topic or feature
   - supporting: explains design, dependency, test, release, or context
   - rejected: similar terms but unrelated
8. Inspect primary and supporting evidence deeply enough to explain the topic in human terms.
9. Write or update the smallest useful page under `wiki/topics/` with a synthesis, not a dump of links.
10. Update `wiki/topics/index.md`, `wiki/index.md`, `wiki/overview.md` when warranted, and `wiki/log.md`.

## Output Standard

The wiki should explain:

- what the topic or feature is
- which repositories, branches, issues, PRs, commits, and files are involved
- the timeline or evolution when that matters
- verified facts, inferred architecture, and unresolved questions
- rejected or ambiguous evidence when it prevents overclaiming
- links to related repository and concept pages when they exist

## Citation Standard

Cite the supplied materials and every durable factual claim. Include GitHub URLs, local checkout paths, inspected refs, commit SHAs, file paths, and search date when freshness matters.

Do not claim to have found every related issue or PR unless the search scope and queries make that defensible. Prefer “searched for related evidence using these anchors” plus a concise list of the strongest related items.
