# Wiki Writing Style Policy

Public wiki pages are learning material, not research notes or agent instructions.

## Language

- Use Chinese for most public-facing narrative.
- Preserve English for source-native technical terms: repository names, package names, APIs, classes, functions, enum values, code identifiers, file paths, commands, PR titles, issue titles, and quoted source labels.
- Do not translate identifiers such as `Worker(level=3)`, `TaskArgs`, `TensorMap`, `InCore`, `Orchestration`, `CommContext`, `RunConfig`, `TLOAD`, or `TSTORE`.
- It is acceptable to use short English phrases when the upstream term is the concept readers will search for.

## Page Shape

Start public learning pages with the mental model, not the evidence table. Long chapter-style pages are allowed and often preferred when they teach a substantial concept, repository, or example family.

Preferred order:

1. One short paragraph explaining what the page teaches.
2. `How To Read This Page` for long repository, topic, and example chapters.
3. A compact ASCII diagram when relationships, execution flow, or hierarchy matter.
4. Concrete examples or a simple walkthrough.
5. Short embedded source excerpts or source-shaped pseudocode when the page is about implemented code.
6. Tables only after the prose and source walkthrough have introduced the idea.
7. Nearby citations or evidence links for claims that need audit support.

## Prose Quality

Write concise but information-rich prose.

- Prefer short paragraphs with one main point each.
- Explain what a component does, why it exists, and what it does not prove.
- Use concrete nouns: `PyPTO parser`, `PTO-ISA GEMM demo`, `simpler L2 ChipWorker`, not vague phrases like "the system".
- Make status boundaries explicit: `implemented`, `emerging`, `design-intended`, `TODO`, `open question`, `not-run`.
- Do not make readers leave the wiki to understand the main concept. Source links are for audit.
- Repository, topic, and example pages that discuss implemented behavior must show what the code looks like: short excerpts, identifier-level sketches, or source-shaped pseudocode plus explanation of what that code proves and does not prove.
- A table of source paths is not a substitute for a code walkthrough. Use tables for lookup after the code shape has been explained.
- Tables must not be the first or only place where a reader learns a concept. If a table lists modules, examples, run commands, sources, statuses, or terms, the surrounding prose must explain the system shape that makes the rows meaningful.
- Module/source-path tables are especially risky. Prefer prose groups and source-shaped flows such as `language -> IR -> codegen -> runner` or `Worker -> ChipWorker -> AICPU scheduler -> AICore kernel`, then keep paths as citations or compact anchors.
- For long pages, optimize for chapter-style learning first and quick lookup second. Use strong headings and opening reading guidance instead of shrinking the page into a map.
- Repository pages are repository-centered learning chapters: teach purpose, architecture, important examples, source-verified implementation state, and material-derived design context while preserving status boundaries.
- Materials under `wiki/materials/` are public learning pages when exposed in the sidebar. They must define important terms where introduced, explain source paths locally instead of saying only "see source", and include diagrams or source-shaped pseudocode when the material depends on execution flow or code behavior.
- Materials may be used as writing-quality references for structure and depth, but Examples/Topics/Repositories should synthesize, compress, cross-link, and update the material shape when the wiki page has a different job.
- Future pages under `wiki/future/` are public learning pages, not task trackers. They must explain background, target/objective, constraints, current status, roadmap or task division when available, and evidence boundaries. They must not blur planned or design-intended behavior into implemented behavior.

## Visual Intuition

Use ASCII diagrams when they reduce cognitive load:

- compiler/runtime pipelines
- hierarchy and worker ownership
- data-plane versus control-plane boundaries
- example progression
- producer/consumer dependency flow

Keep diagrams small enough to read on the rendered page.

## Anti-Patterns

Avoid:

- table-only pages for core concepts
- architecture sections where a table of files/modules is carrying the explanation
- English-only summaries when writing a public learning page
- long raw source excerpts
- code-free repository/topic/example pages for implemented features
- source-path tables without embedded code explanation
- sentences that only say "see this source"
- sidebar labels that hide the actual page subject, such as `Stack` when the page is really about Hardware, CANN, HCCL, and RoCE
- public material pages that introduce acronyms such as `RoCE`, `RDMA`, `URMA`, `HCCL`, `HCOMM`, `HCCS`, `GM`, `CQ`, or `QP` without local explanation
- agent instructions in `wiki/`
- broad claims without nearby source/evidence
- mixing implemented behavior and design target in one unlabelled paragraph
