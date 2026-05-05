# Wiki Standalone Learning Content Upgrade Spec

Status: draft for PR review
Date: 2026-05-05
Scope: specification only; no wiki page rewrites in this PR

## Goal

Upgrade the wiki content system so every rendered wiki page can serve its intended public role as standalone learning material: self-contained, concise but information-rich, intuitive and visual, code-rich where relevant, well explained, logically complete, and source-auditable.

This spec is intentionally a preparation PR. It defines the rewrite standard, page-class acceptance rules, and per-page inventory for the next rewrite PRs. It must not rewrite the wiki content itself except through this spec document.

## Source Writing Requirements Extracted From Materials

The strongest writing model in the current wiki is the public material design document:

- `wiki/materials/pto-runtime-distributed/PTO-Runtime分布式拓展文档系统设计.md`

That document was used to generate the readable material bundle under `wiki/materials/pto-runtime-distributed/`, and the generated material pages are accepted as qualified learning-material references for depth, structure, visual explanation, and developer-facing concreteness.

The following requirements are extracted from that design document and apply to the future rewrite pass:

| Source section | Extracted requirement | Rewrite meaning |
| --- | --- | --- |
| Section 1, background and goal | Materials must become a directly usable knowledge system, not copied notes. | Each page must explain the subject itself before pointing to evidence. |
| Section 1, ordered learning goals | Start from background model, then explain why the feature exists, then split design/status/risk. | Repository/topic/example pages must have a learning path, not only a status map. |
| Section 4, target reader | The reader may know the non-distributed runtime but not hardware, supernode, HCCL, PTO-ISA, or distributed progress. | Advanced pages must restate required background locally and link to foundation pages. |
| Section 4, reading path | Learning should progress from hardware/software context to ISA/runtime to blueprint/features/status/tasks. | The wiki should preserve a foundation-to-advanced route across Home, Repositories, Examples, Topics, Concepts, and Materials. |
| Section 5, chapter breakdown | Each chapter has a purpose and core sections. | Each wiki page class needs an explicit job, required sections, and acceptance criteria. |
| Section 5.7, feature deep dives | Feature sections should cover background problem, design goal, interfaces, data structures, flow, code, status, tests, risk, next tasks, evidence. | Topic/example/repository pages must include code paths, runtime surfaces, status boundaries, and verification expectations where applicable. |
| Section 5.10, source notes | Use in-place source explanation instead of a separate numbering system. | Evidence ledgers support audit, but public pages must cite nearby evidence in readable prose. |
| Section 7, visualization | Use ASCII diagrams for runtime layering, worker scheduling, local versus remote model, bootstrap, callable registration, completion state, run loops, ABI split, and roadmap. | Visuals are mandatory when they reduce cognitive load for execution flow, hierarchy, state, or data/control-plane boundaries. |
| Section 8, writing principles | Self-contained, evidence-backed, fact/inference separated, Chinese-first, structured, developer-oriented, implementation-facing. | These become the universal wiki page-quality gates. |
| Section 10, grill decisions | Fast developer takeover is the first goal; blueprint first, then current progress; system layers and feature deep dives both needed; external public sources are background, not proof of project state. | Pages should teach intended architecture first, then map implementation status and evidence strength. |

## Non-Goals

- Do not rewrite source-material pages merely to impose a template. They already function as public learning materials and can be preserved when they pass the checks.
- Do not turn evidence pages into tutorials. They must be readable and self-contained as audit ledgers, but their purpose is claim support.
- Do not add new target-system claims without source inspection and nearby citations.
- Do not collapse uncertainty. `implemented`, `emerging`, `design-intended`, `TODO`, `open question`, `not-run`, and `inferred` remain required status boundaries.
- Do not make this a distributed-only wiki. Non-distributed foundations and examples are the base layer for every advanced rewrite.

## Universal Page Quality Gates

Every `wiki/**/*.md` page must satisfy the gates for its page class.

### Standalone Learning

- The page states what it teaches in the first screen.
- A reader can understand the main idea without opening source files, PRs, issues, or materials.
- Links and citations support audit and deeper reading; they do not replace explanation.
- Any advanced page repeats the minimum background needed to read it, then links to foundation pages.

### Concise But Rich

- Paragraphs are short and information-dense.
- Tables summarize already-explained ideas; no important concept is table-only.
- Repetition is local and intentional: repeat core terms when it helps a reader avoid context switching.
- Remove thin redirect/map pages unless they have a real learning job.

### Intuitive And Visual

- Use ASCII diagrams for pipelines, hierarchy, control/data-plane boundaries, state machines, and example progression.
- Keep diagrams small enough to read in rendered docs and terminal Markdown.
- Every diagram must be followed by prose that explains what the arrows mean and what the diagram does not prove.

### Code-Rich And Implementation-Facing

For repository, topic, concept, and example pages where implementation matters:

- Include concrete repository paths.
- Name important APIs, functions, classes, enum values, commands, tests, and build/run surfaces.
- Explain what a command or code path proves and what it does not prove.
- Include `not-run` when the wiki pass did not execute the command.
- Keep code excerpts short; prefer path + identifier + explanation over long copied source.

### Evidence And Status

- Key factual claims need nearby source or evidence links.
- Claims based on material, GitHub, external documents, or cross-repository synthesis must cite paired `wiki/evidence/<topic>.md` pages.
- Separate implemented behavior from design targets, PR/issue discussion, inferred architecture, stale evidence, and open questions.
- Evidence pages must say what the evidence proves, what it does not prove, and what would change the status.

### Language

- Public narrative is mostly Chinese.
- Preserve English identifiers: repository names, APIs, classes, functions, file paths, commands, enum values, PR titles, issue titles, and source-native terms.
- Avoid English-only summaries except in source-native labels or compact tables where identifiers dominate.

## Page-Class Standards

### Home / Overview / Area Index Pages

Files include `wiki/index.md`, `wiki/overview.md`, and area indexes.

Required shape:

1. One-screen orientation: what this wiki is and who should read it.
2. Public reading path: foundations -> repositories -> examples -> topics -> concepts -> materials.
3. Short explanation of how to choose the next page.
4. Links to major pages only; avoid long evidence/process lists.
5. If an index is only a catalog, every catalog item needs a one-sentence learning promise.

Acceptance:

- Navigation pages are concise but not empty.
- They do not carry agent workflow instructions.
- They do not hide important public learning pages.

### Repository Pages

Files include `wiki/repositories/simpler.md`, `wiki/repositories/pto-isa.md`, and `wiki/repositories/pypto.md`.

Required shape:

1. What the repository owns in the system.
2. How to read this page.
3. Architecture diagram or pipeline.
4. Main components with code paths.
5. Representative examples and tests.
6. Important APIs/classes/functions/data structures.
7. Current source-verified implementation state.
8. What the repository does not prove.
9. Developer takeover notes: safe first read, safe first change, verification surface.
10. Nearby source/evidence links.

Acceptance:

- A reader can explain the repo purpose, architecture, main examples, and status after reading only the page.
- The page includes enough code-path detail to start source inspection.
- Distributed claims are grounded in non-distributed foundations.

### Example Pages

Files include `wiki/examples/pto/*.md`.

Required shape:

1. What concept the example teaches.
2. Beginner-to-expert position in the examples ladder.
3. Minimal background concepts.
4. Cross-repository source comparison when PyPTO, PTO-ISA, and `simpler` touch the same idea.
5. Data/control flow diagram when relevant.
6. Exact run surface: cwd, command, hardware/software assumptions, expected signal, run status, caveat.
7. Code anchors: source paths, important functions/classes/APIs/tests.
8. What the example proves.
9. What it does not prove.
10. Next example to read.

Acceptance:

- No row such as “README build path” may remain without exact cwd/command or an explicit “no stable command found” note.
- Hardware examples must distinguish documented command from locally run validation.
- Missing examples must be framed as learning gaps and implementation gaps, not vague TODOs.

### Topic Pages

Files include `wiki/topics/*.md`.

Required shape:

1. Problem or behavior being explained.
2. Mental model and required foundation links.
3. System-level diagram or flow.
4. Implementation surface: repositories, code paths, APIs, tests, examples.
5. Status map with evidence labels.
6. Failure modes or risks where relevant.
7. What to remember.
8. What to read next.

Acceptance:

- A topic page cannot be a compatibility redirect or table-only map. It must either become a real learning page or be removed/merged.
- Topics relying on material/GitHub/external/cross-repo synthesis cite paired evidence pages.
- Advanced/distributed topics explain non-distributed prerequisites locally.

### Concept Pages And Glossary

Files include `wiki/concepts/*.md` and `wiki/glossary.md`.

Required shape:

1. Plain-language definition.
2. Why the concept exists in this target set.
3. Where it appears in repositories/examples/topics.
4. Minimal diagram or code snippet when useful.
5. Common misreadings or boundary warnings.
6. Related terms.

Acceptance:

- Definitions are Chinese-first and source-native identifiers remain English.
- Concepts repeated across pages have stable wording here.
- Glossary entries are not a replacement for concept pages when a term needs a model or diagram.

### Evidence Pages

Files include `wiki/evidence/*.md`.

Required shape:

1. Which public page or topic the ledger supports.
2. Source set with ref/checksum/date where relevant.
3. Claim map written as audit context, not writing policy.
4. Negative findings.
5. Open questions.
6. Status-change criteria when the topic has `emerging`, `design-intended`, `TODO`, or `open question` claims.

Acceptance:

- Evidence pages are self-contained enough for an auditor to understand why the public page says what it says.
- They do not contain reusable agent instructions.
- They do not substitute for public explanation.

### Materials Pages

Files include `wiki/materials/**/*.md`.

Required shape:

1. Public material indexes explain what each material teaches and how it relates to synthesized wiki pages.
2. Source-material pages may preserve their original learning-material structure.
3. The generated PTO Runtime distributed material pages are treated as qualified learning material references, not as raw dump pages.
4. If a material page has concrete quality gaps, fix them conservatively without changing its source-material role.

Acceptance:

- Material pages remain readable from the sidebar.
- Index pages make it clear when material is source material versus synthesized wiki content.
- Synthesized pages may learn from material structure, but should not duplicate whole material sections.

### Log / Usage / Projects / Toolchain Pages

Files include `wiki/log.md`, `wiki/usage.md`, `wiki/projects.md`, and `wiki/toolchain-map.md`.

Required shape:

1. `wiki/log.md` remains an audit log, not a tutorial.
2. `wiki/usage.md` stays human-facing and public; reusable agent process belongs in `.agents/`.
3. `wiki/projects.md` explains target-set coverage and profile status without becoming an internal tracker.
4. `wiki/toolchain-map.md` teaches how projects relate, with a diagram and clear status boundaries.

Acceptance:

- These pages may be concise, but must still explain their public role.
- They must not become primary sidebar learning categories unless explicitly promoted.

## Page Inventory And Rewrite Obligation

The future rewrite pass must touch or explicitly audit every rendered wiki page.

| Page | Class | Required action |
| --- | --- | --- |
| `wiki/index.md` | home | rewrite as concise public entry and learning path |
| `wiki/overview.md` | overview | upgrade as target-set synthesis with foundation-to-advanced story |
| `wiki/repositories/index.md` | index | add learning promises for repo pages |
| `wiki/repositories/simpler.md` | repository | full standalone repository chapter rewrite |
| `wiki/repositories/pto-isa.md` | repository | full standalone repository chapter rewrite |
| `wiki/repositories/pypto.md` | repository | full standalone repository chapter rewrite |
| `wiki/examples/index.md` | index | concise examples area orientation |
| `wiki/examples/pto/index.md` | index | rewrite as example ladder with prerequisites and outcomes |
| `wiki/examples/pto/hello-elementwise.md` | example | full example chapter rewrite |
| `wiki/examples/pto/gemm-ffn.md` | example | full example chapter rewrite |
| `wiki/examples/pto/softmax-attention.md` | example | full example chapter rewrite |
| `wiki/examples/pto/complete-models.md` | example | full example chapter rewrite |
| `wiki/examples/pto/distributed-runtime.md` | example | full example chapter rewrite |
| `wiki/examples/pto/missing-roadmap.md` | example/topic hybrid | rewrite as concrete missing-example roadmap with status criteria |
| `wiki/topics/index.md` | index | add topic learning order and prerequisites |
| `wiki/topics/non-distributed-execution.md` | topic | full topic rewrite as foundation page |
| `wiki/topics/simpler-runtime-architecture.md` | topic | full topic rewrite with diagrams and code anchors |
| `wiki/topics/distributed-execution.md` | topic | full topic rewrite with blueprint/status split |
| `wiki/topics/lingqu-level-map.md` | topic | rewrite from map into explanatory level model |
| `wiki/topics/developer-takeover-guide.md` | topic | rewrite as developer takeover learning chapter |
| `wiki/topics/examples-feature-map.md` | topic | either remove/merge or rewrite into a real examples-system topic; no thin redirect |
| `wiki/concepts/index.md` | index | add concept reading order |
| `wiki/concepts/basic-terms.md` | concept | rewrite definitions as layered mental model |
| `wiki/concepts/cann-foundation.md` | concept | rewrite with CANN/HCCL/HCOMM/URMA/RoCE boundaries and diagram |
| `wiki/concepts/distributed-execution-terms.md` | concept | rewrite as distributed vocabulary model |
| `wiki/glossary.md` | glossary | normalize concise Chinese-first definitions and links |
| `wiki/evidence/index.md` | evidence index | keep concise, clarify status labels and audit role |
| `wiki/evidence/non-distributed-execution.md` | evidence | audit for claim context/status-change criteria |
| `wiki/evidence/distributed-execution.md` | evidence | audit for claim context/status-change criteria |
| `wiki/evidence/lingqu-level-map.md` | evidence | audit L1/L4-L6 status support |
| `wiki/evidence/examples-feature-map.md` | evidence | align with rewritten examples pages and missing roadmap |
| `wiki/evidence/developer-takeover-guide.md` | evidence | align with takeover chapter claims |
| `wiki/materials/index.md` | materials index | improve relationship to synthesized pages |
| `wiki/materials/pto-runtime-distributed/index.md` | materials index | improve bundle reading route and source-material framing |
| `wiki/materials/pto-runtime-distributed/00_README.md` | material | audit as qualified learning material; preserve unless concrete gap found |
| `wiki/materials/pto-runtime-distributed/01_hardware_and_software_stack.md` | material | audit as qualified learning material; preserve unless concrete gap found |
| `wiki/materials/pto-runtime-distributed/02_pto_isa_and_runtime_basics.md` | material | audit as qualified learning material; preserve unless concrete gap found |
| `wiki/materials/pto-runtime-distributed/03_distributed_blueprint.md` | material | audit as qualified learning material; preserve unless concrete gap found |
| `wiki/materials/pto-runtime-distributed/04_feature_deep_dives.md` | material | audit as qualified learning material; preserve unless concrete gap found |
| `wiki/materials/pto-runtime-distributed/05_progress_and_timeline.md` | material | audit as qualified learning material; preserve unless concrete gap found |
| `wiki/materials/pto-runtime-distributed/06_development_tasks.md` | material | audit as qualified learning material; preserve unless concrete gap found |
| `wiki/materials/pto-runtime-distributed/07_source_notes.md` | material | audit as qualified learning material; preserve unless concrete gap found |
| `wiki/materials/pto-runtime-distributed/08_top_level_design_alignment.md` | material | audit as qualified learning material; preserve unless concrete gap found |
| `wiki/materials/pto-runtime-distributed/PTO-Runtime分布式拓展文档系统设计.md` | material/spec source | preserve as source writing-requirement document and cite in this upgrade |
| `wiki/projects.md` | project map | rewrite as reader-facing target-set coverage map |
| `wiki/toolchain-map.md` | toolchain topic | rewrite as visual cross-repository relationship page |
| `wiki/usage.md` | usage | trim to public reader usage; move agent instructions to `.agents/` if any remain |
| `wiki/log.md` | log | keep append-only; audit chronological order and public clarity |

## Rewrite Execution Strategy For Later PRs

The rewrite should be split into small PRs after this spec is approved.

### PR A: Navigation, Overview, And Page Skeleton Quality

Files:

- `wiki/index.md`
- `wiki/overview.md`
- area indexes
- `wiki/projects.md`
- `wiki/toolchain-map.md`
- `wiki/usage.md`

Goal:

- Make the public entry path self-contained.
- Remove map-only wording from public learning surfaces.
- Ensure readers know where to start and why.

### PR B: Repository Chapters

Files:

- `wiki/repositories/simpler.md`
- `wiki/repositories/pto-isa.md`
- `wiki/repositories/pypto.md`
- relevant evidence pages only if claims change

Goal:

- Turn each repository page into a full learning chapter with purpose, architecture, code paths, examples, status, and safe takeover guidance.

### PR C: Examples Area

Files:

- `wiki/examples/pto/*.md`
- `wiki/topics/examples-feature-map.md`
- `wiki/evidence/examples-feature-map.md`

Goal:

- Make examples the primary learning route from beginner to expert.
- Remove or replace the thin `examples-feature-map` compatibility page.
- Ensure every example has exact run surface and source comparison.

### PR D: Topics And Concepts

Files:

- `wiki/topics/*.md`
- `wiki/concepts/*.md`
- `wiki/glossary.md`
- paired evidence pages when needed

Goal:

- Make foundational and advanced topics logically complete.
- Add diagrams for runtime architecture, distributed execution, level mapping, and CANN boundaries.

### PR E: Evidence And Materials Framing

Files:

- `wiki/evidence/*.md`
- `wiki/materials/index.md`
- `wiki/materials/pto-runtime-distributed/index.md`
- source-material pages only if audit finds concrete quality problems

Goal:

- Keep evidence pages readable as audit ledgers.
- Keep material pages public and learnable.
- Preserve the generated material bundle as a writing-quality reference.

## Required Review Method For Rewrite PRs

Every future rewrite PR must include:

1. Page-class checklist in the PR description.
2. List of pages rewritten and pages only audited.
3. For every rewritten public learning page, a short note on:
   - self-contained explanation
   - visual/diagram coverage
   - code/run-surface coverage
   - status/evidence boundaries
4. Local verification:
   - `git diff --check`
   - Markdown local link check
   - `npm run docs:build`
   - `VITEPRESS_BASE=/pto-wiki/ npm run docs:build`
5. Rendered-page review before merge.

## Acceptance Criteria For This Spec PR

- Adds this spec file only.
- Leaves wiki content unchanged.
- Identifies every current `wiki/**/*.md` page and its future obligation.
- Extracts concrete writing requirements from `PTO-Runtime分布式拓展文档系统设计.md`.
- Defines page-class standards that can drive future rewrite PRs.
- Keeps material pages in scope while recognizing the generated material bundle as qualified learning material.
- Provides a phased rewrite strategy without starting the rewrite.
