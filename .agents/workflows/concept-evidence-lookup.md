# Concept Evidence Lookup Workflow

Use this workflow when an answer or wiki update depends on an important concept that readers may not already know, or whose meaning depends on external systems, target repositories, GitHub history, or current platform documentation.

## Trigger Conditions

Run this lookup before writing when a concept is:

- a non-obvious acronym, protocol, platform component, library, instruction, runtime layer, or hardware term
- central to the page or answer, not just incidental
- introduced in public wiki pages, including `wiki/materials/`
- ambiguous across repositories, design notes, GitHub threads, or external documentation
- likely to have version, platform, branch, or implementation-state differences
- explicitly questioned by the user

Examples: `RoCE`, `RDMA`, `URMA`, `HCCL`, `HCOMM`, `HCCS`, `GM`, `CQ`, `QP`, `Worker(level=3)`, `DistWorker`, `TensorMap`, `TPUT_ASYNC`, `deferred completion`.

## Lookup Ladder

Use the smallest source set that can define the concept and prove its project-specific meaning.

1. Search existing `wiki/` for prior definitions and status boundaries.
2. Search local target repositories with `rg` for identifiers, docs, tests, examples, build files, and comments.
3. Inspect the exact branch, PR, issue, commit, or review thread when the concept is tied to GitHub history.
4. Use official upstream documentation for external concepts, hardware, protocols, libraries, and platform behavior.
5. Use non-official sources only as secondary background when official or repository evidence is unavailable, and label that limitation.

When source freshness matters, record the ref, commit SHA, tag, release, retrieval date, or URL used. For web-based external concepts, prefer official vendor/project documentation and cite it near the explanation.

## Writing Requirement

Do not make the reader leave the wiki or answer to learn the basic concept.

Each important concept should have:

- canonical name and useful aliases
- one concise definition in the local context
- a mental model, short example, ASCII diagram, or source-shaped pseudocode when helpful
- the project-specific role: what this concept explains in the target set
- a status boundary: `implemented`, `emerging`, `design-intended`, `stale`, `open question`, or `not-run`
- nearby citations to repository files, GitHub references, material paths, or official docs

Source paths and links are audit support. They are not a substitute for local explanation.

## Placement

- Put repeated reusable terms in `wiki/concepts/`.
- Put topic-specific concepts in the relevant `wiki/topics/` page.
- Put repository-specific concepts in `wiki/repositories/<repo>.md`.
- Put example-specific concepts in the relevant `wiki/examples/` page.
- Put material-bundle concepts in `wiki/materials/` when the material page itself is public reading material.
- Put reusable agent lookup rules in `.agents/`, not in rendered wiki pages.

## Conflict Handling

If sources disagree, preserve the conflict:

- state which source says what
- identify the inspected ref or retrieval date
- choose the most authoritative current source only when defensible
- mark unresolved differences as `open question`

Never silently flatten design-intended material into implemented behavior.
