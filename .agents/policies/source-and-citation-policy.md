# Source And Citation Policy

Factual wiki claims need evidence.

Evidence supports the wiki; it does not replace explanation. Durable wiki pages should state the synthesized knowledge directly, then cite the source path, material file, PR, issue, commit, or evidence ledger that backs the statement. Avoid making readers leave the wiki just to learn the basic concept.

## Preferred Sources

1. Source files in the target repository.
2. Build, dependency, CI, test, and example files.
3. Upstream documentation.
4. Releases, tags, commits, and maintainer-authored issue or PR comments.
5. Official project pages.
6. User-supplied document materials with path, checksum, and ingestion date.

## Citation Rules

- Cite URLs for external sources.
- Cite local paths when documenting files checked out in the workspace.
- Cite document materials by path, archive member, checksum when feasible, and ingestion date.
- Include commit, tag, or retrieval date when freshness matters.
- For branch, issue, or PR-specific claims, cite the branch, issue URL, PR URL, commit SHA, or checked-out ref that was inspected.
- For topic synthesis from supplied materials, cite the materials, search anchors, GitHub issues or PRs, commits, refs, and source files that support the synthesis.
- For topic pages that use material, GitHub, external-document, or cross-repository synthesis evidence, create and cite a paired `wiki/evidence/<topic>.md` ledger; direct nearby repository citations alone do not require a ledger.
- Mark claims as inference when they come from reading code structure rather than explicit docs.
- Preserve conflicting evidence instead of forcing a false conclusion.
- Do not turn source citations into a learning plan. If a page cites a source for an important concept, summarize the concept in the wiki page itself.
