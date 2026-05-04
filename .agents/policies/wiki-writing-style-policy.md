# Wiki Writing Style Policy

Public wiki pages are learning material, not research notes or agent instructions.

## Language

- Use Chinese for most public-facing narrative.
- Preserve English for source-native technical terms: repository names, package names, APIs, classes, functions, enum values, code identifiers, file paths, commands, PR titles, issue titles, and quoted source labels.
- Do not translate identifiers such as `Worker(level=3)`, `TaskArgs`, `TensorMap`, `InCore`, `Orchestration`, `CommContext`, `RunConfig`, `TLOAD`, or `TSTORE`.
- It is acceptable to use short English phrases when the upstream term is the concept readers will search for.

## Page Shape

Start public learning pages with the mental model, not the evidence table.

Preferred order:

1. One short paragraph explaining what the page teaches.
2. A compact ASCII diagram when relationships, execution flow, or hierarchy matter.
3. Concrete examples or a simple walkthrough.
4. Tables only after the prose has introduced the idea.
5. Nearby citations or evidence links for claims that need audit support.

## Prose Quality

Write concise but information-rich prose.

- Prefer short paragraphs with one main point each.
- Explain what a component does, why it exists, and what it does not prove.
- Use concrete nouns: `PyPTO parser`, `PTO-ISA GEMM demo`, `simpler L2 ChipWorker`, not vague phrases like "the system".
- Make status boundaries explicit: `implemented`, `emerging`, `design-intended`, `TODO`, `open question`, `not-run`.
- Do not make readers leave the wiki to understand the main concept. Source links are for audit.

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
- English-only summaries when writing a public learning page
- long raw source excerpts
- sentences that only say "see this source"
- agent instructions in `wiki/`
- broad claims without nearby source/evidence
- mixing implemented behavior and design target in one unlabelled paragraph
