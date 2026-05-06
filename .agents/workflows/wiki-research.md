# Wiki Research Workflow

Use through `wiki-researcher`.

## Source Ladder

Use the smallest source set that can answer the question and prove the claim.

1. Existing `wiki/` and `config/target-set.yml`.
2. Local target repositories under `repositories/`.
3. Public material pages under `wiki/materials/` and user-supplied material workspaces.
4. GitHub issues, PRs, branches, commits, releases, and review comments.
5. Official internet documentation for external concepts, protocols, hardware, libraries, and current platform behavior.

Prefer primary sources: repository files, upstream docs, releases, tags, commits, maintainer issue or PR discussion, and official project pages.

## Source Modes

### Concept Mode

Use when important terms, acronyms, protocols, platform components, APIs, runtime layers, hardware terms, or repository-specific identifiers need stable local definitions.

- Search existing wiki definitions first.
- Search local repositories with `rg` for identifiers, docs, tests, examples, build files, and comments.
- Inspect exact branch, PR, issue, commit, or review thread when the concept is tied to GitHub history.
- Use official upstream documentation for external concepts.
- Preserve conflicts and mark unresolved differences as `open question`.

Each important concept should have a canonical name, aliases when useful, local definition, project-specific role, status boundary, and nearby citations.

### Repository Mode

Use when documenting or answering from source code.

- Resolve repositories from `config/target-set.yml`.
- Clone missing repositories lazily under `repositories/<repository-name>/` only when source inspection is needed.
- Before relying on existing checkouts when freshness matters, fetch or sync configured upstreams while preserving local changes.
- Inspect README, metadata, manifests, lockfiles, build files, package metadata, toolchain files, `.gitmodules`, nested repositories, vendored code, source-fetch scripts, source tree, entry points, public APIs, tests, examples, scripts, CI, and release context.
- Record checkout path, ref, commit SHA or tag, and relevant file paths for local checkout evidence.

### Material Mode

Use when user-supplied files, folders, archives, or public material pages support wiki claims.

- Identify whether input is a file, folder, or archive.
- For folders, skip generated caches, unreadable binaries, and hidden/system files unless explicitly relevant.
- For archives, list members first, reject unsafe paths, extract only to temporary or clearly named material workspaces, and preserve raw originals.
- Record path, archive member, checksum when feasible, ingestion date, conversion method, exclusions, and conversion limitations.
- Commit raw material bundles under `wiki/materials/` only when the user explicitly wants them public.

### GitHub Mode

Use when branches, issues, PRs, releases, commits, or review discussions are evidence.

- Inspect metadata, state, labels, linked references, comments, commits, changed files, and relevant discussion.
- Fetch or inspect the relevant ref before making implementation claims.
- For topic research, expand from strong anchors: issue and PR cross-links, closing keywords, linked commits, branch names, commit messages, release notes, labels, milestones, and referenced files.
- Classify candidates as primary, supporting, or rejected.

### Dependency And Code Mode

Use when architecture, dependencies, or execution behavior need source-level proof.

- Inspect manifests, lockfiles, build files, compiler/runtime config, generated-code config, CI setup, submodules, nested repos, vendored dependencies, external source fetch scripts, and target-set references.
- Inspect top-level directories, executable entry points, library public APIs, core modules, data flow, extension points, tests, and examples.
- Distinguish verified dependency relationships from inferred relationships.

### Official Internet Mode

Use for external concepts or current platform behavior. Browse or search only as needed, prefer official vendor/project documentation, and record retrieval dates when freshness matters.

## Placement

- Implemented behavior: `wiki/repositories/`, `wiki/topics/`, `wiki/examples/`, or `wiki/concepts/`.
- Future, roadmap, ongoing, planned, blocker, task split, missing example, or design-intended behavior: `wiki/future/`.
- Raw QA evidence: `wiki/evidence/qa/`.
- Public material pages: `wiki/materials/` only when intentionally published for readers.
- Topic evidence ledgers: `wiki/evidence/<topic>.md` when material, GitHub, external-document, or cross-repository synthesis supports durable topic claims.

## Output Standard

Write standalone synthesis, not a link dump. Explain mental models in prose, add compact ASCII diagrams or source-shaped pseudocode when useful, cite factual claims near the relevant text, preserve uncertainty, and separate verified facts from inference.

Topic pages should answer "what does this mean?". Evidence ledgers should answer "why do we trust this?".
