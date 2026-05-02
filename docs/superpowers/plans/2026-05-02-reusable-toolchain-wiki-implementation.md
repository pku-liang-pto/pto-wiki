# Reusable Toolchain Wiki Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first reusable Markdown-first technical wiki template, with PTO-CANN configured as the current target set, reusable agent workflows under `.agents/`, and local website rendering for `wiki/`.

**Architecture:** `wiki/` remains the human-readable source of truth. `.agents/` and `AGENTS.md` define reusable agent governance that is decoupled from PTO-CANN. `config/target-set.yml` carries current target data, and VitePress renders `wiki/` as a static website without owning the content model.

**Tech Stack:** Markdown, YAML, VitePress, npm scripts, Git.

---

## Scope Check

The approved spec includes README positioning, wiki content, reusable agent governance, target configuration, and website rendering. These pieces are tightly coupled for the first usable version because the website renders the wiki and the agent rules govern wiki updates. Keep them in one implementation plan.

## File Structure

- Modify `README.md`: reposition the repository as a reusable toolchain wiki template with PTO-CANN as the current target.
- Create `AGENTS.md`: index all agent rules and define mandatory behavior.
- Create `config/target-set.yml`: define the PTO-CANN target set without hard-coding it into reusable workflows.
- Create `wiki/README.md`: human-readable wiki home.
- Create `wiki/projects.md`: PTO and CANN project index.
- Create `wiki/toolchain-map.md`: high-level relationship map.
- Create `wiki/glossary.md`: seed glossary for incremental growth.
- Create `wiki/repositories/README.md`: repository profile index.
- Create `.agents/workflows/repo-documentation.md`: mature repository documentation workflow.
- Create `.agents/workflows/wiki-lookup-and-update.md`: lookup and update workflow.
- Create `.agents/workflows/dependency-and-code-analysis.md`: dependency and code detail analysis workflow.
- Create `.agents/policies/wiki-update-policy.md`: update rules.
- Create `.agents/policies/source-and-citation-policy.md`: evidence and citation requirements.
- Create `.agents/policies/template-reuse-policy.md`: target-agnostic reuse rules.
- Create `.agents/templates/wiki-page.md`: generic wiki page template.
- Create `.agents/templates/repo-profile.md`: repository profile template.
- Create `.agents/templates/dependency-note.md`: dependency note template.
- Create `.agents/templates/lookup-note.md`: lookup note template.
- Create `.agents/skills/wiki-maintainer.md`: reusable wiki maintenance skill.
- Create `.agents/skills/repo-documenter.md`: reusable repo documentation skill.
- Create `package.json`: VitePress scripts.
- Create `wiki/.vitepress/config.mts`: docs site title, nav, sidebar, search.
- Modify `.gitignore`: ignore dependency and build artifacts.
- Preserve `resources/pto.jpeg`: existing target-specific visual asset.

### Task 1: Target Configuration And Project Positioning

**Files:**
- Modify: `README.md`
- Create: `config/target-set.yml`
- Verify: `sed -n '1,220p' README.md`
- Verify: `sed -n '1,220p' config/target-set.yml`

- [ ] **Step 1: Replace `README.md` with the new project positioning**

Use this complete content:

```markdown
# PTO-CANN Toolchain Wiki

This repository is a reusable technical wiki template for documenting a collection of related repositories, toolchains, and concepts. The current target set is the PTO-CANN toolchain.

The repository is not intended to mirror every upstream project or import every upstream wiki at the beginning. Instead, the wiki grows through use: when humans or agents look up a concrete topic, they verify the relevant sources and add durable knowledge back to the wiki.

## What This Repository Provides

- A human-readable wiki under `wiki/`.
- Static website rendering for the wiki.
- Reusable agent workflows, policies, templates, and skills under `.agents/`.
- A target configuration under `config/target-set.yml` that keeps PTO-CANN-specific data separate from reusable wiki mechanics.

## Current Target: PTO-CANN

PTO-CANN is treated as the first target set for this template. The initial wiki maps PTO projects, CANN projects, runtime and communication components, serving projects, recipes, and related concepts.

See `wiki/README.md` for the human-facing wiki entry point.

## Repository Layout

```text
wiki/                 Human-readable Markdown wiki and website source
.agents/              Reusable agent workflows, policies, templates, and skills
config/target-set.yml Current target set configuration
resources/            Images and other static resources
```

## Agent Guidance

Agents must start with `AGENTS.md` before performing wiki lookup, wiki updates, or repository documentation. Agent rules are intentionally target-set agnostic so this repository can be reused as a GitHub template for another project collection.

## Website Preview

After dependencies are installed, run:

```bash
npm run docs:dev
```

The rendered site uses `wiki/` as its source.
```

- [ ] **Step 2: Create `config/target-set.yml`**

Use this complete content:

```yaml
name: PTO-CANN Toolchain
description: >
  A technical wiki target set for PTO, CANN, runtime, communication,
  serving, recipe, and related toolchain repositories.
wiki_scope:
  posture: incremental
  source_of_truth: wiki/
  notes:
    - The wiki grows from concrete lookup and repository documentation work.
    - Upstream repositories and documentation remain the source for project-specific facts.
groups:
  - name: PTO
    description: PTO language, runtime, serving, ISA, and supporting projects.
  - name: CANN
    description: CANN communication, collective, shared memory, transfer, and recipe projects.
repositories:
  - name: pypto_top_level_documents
    group: PTO
    url: https://github.com/hengliao1972/pypto_top_level_design_documents
    role: Top-level PTO design documents.
  - name: serving-lib
    group: PTO
    url: https://github.com/hengliao1972/pypto-serving
    role: PTO serving library.
  - name: pto-li
    group: PTO
    url: https://github.com/hw-native-sys/pypto-lib
    role: PTO library project.
  - name: pypto
    group: PTO
    url: https://github.com/hw-native-sys/pypto/
    role: PTO implementation project.
  - name: ptoas
    group: PTO
    url: https://github.com/zhangstevenunity/PTOAS
    role: PTOAS project.
  - name: pto-isa
    group: PTO
    url: https://github.com/PTO-ISA/pto-isa
    role: PTO ISA project.
  - name: simpler
    group: PTO
    url: https://github.com/hw-native-sys/simpler
    role: Supporting project in the PTO target set.
  - name: distributed-runtime
    group: PTO
    url: https://github.com/hengliao1972/pypto_runtime_distributed
    role: Distributed PTO runtime.
  - name: hcomm
    group: CANN
    url: https://gitcode.com/cann/hcomm
    role: CANN communication project.
  - name: hccl
    group: CANN
    url: https://gitcode.com/cann/hccl
    role: CANN collective communication project.
  - name: shmem
    group: CANN
    url: https://gitcode.com/cann/shmem
    role: CANN shared memory project.
  - name: hixl
    group: CANN
    url: https://gitcode.com/cann/hixl
    role: CANN transfer or interconnect project.
  - name: cann-recipes-infer
    group: CANN
    url: https://gitcode.com/cann/cann-recipes-infer
    role: CANN inference recipe project.
```

- [ ] **Step 3: Verify the files render as plain text**

Run:

```bash
sed -n '1,220p' README.md
sed -n '1,240p' config/target-set.yml
```

Expected: both commands print the new content without shell errors.

- [ ] **Step 4: Commit Task 1**

Run:

```bash
git add README.md config/target-set.yml resources/pto.jpeg
git commit -m "docs: position reusable PTO-CANN wiki"
```

Expected: commit succeeds and includes `README.md`, `config/target-set.yml`, and the existing `resources/pto.jpeg` asset.

### Task 2: Human-Readable Wiki Seed

**Files:**
- Create: `wiki/README.md`
- Create: `wiki/projects.md`
- Create: `wiki/toolchain-map.md`
- Create: `wiki/glossary.md`
- Create: `wiki/repositories/README.md`
- Verify: `rg -n "TODO|TBD|FIXME" wiki`

- [ ] **Step 1: Create `wiki/README.md`**

Use this complete content:

```markdown
# PTO-CANN Toolchain Wiki

This wiki is the human-readable knowledge base for the PTO-CANN target set.

It starts as a map, not as a complete mirror of every upstream project. Pages are expanded when a concrete lookup, repository documentation pass, or toolchain investigation discovers durable knowledge that future readers are likely to need.

## Start Here

- [Projects](./projects.md): current PTO and CANN repository index.
- [Toolchain Map](./toolchain-map.md): how the current projects are expected to relate.
- [Repository Profiles](./repositories/): per-repository documentation as it is created.
- [Glossary](./glossary.md): terms and acronyms collected during wiki growth.

## How This Wiki Grows

When a topic is looked up, agents first check this wiki. If the answer is missing or stale, they inspect the configured target repositories and upstream documentation. Durable, sourced findings are added back here in clear prose.

The wiki should explain what is known, cite where it came from, and preserve uncertainty when evidence is incomplete.
```

- [ ] **Step 2: Create `wiki/projects.md`**

Use this complete content:

```markdown
# Projects

This page lists the current PTO-CANN target repositories. Roles are intentionally brief until each repository receives a documentation pass.

## PTO

| Repository | Role |
| --- | --- |
| [pypto_top_level_documents](https://github.com/hengliao1972/pypto_top_level_design_documents) | Top-level PTO design documents. |
| [serving-lib](https://github.com/hengliao1972/pypto-serving) | PTO serving library. |
| [pto-li](https://github.com/hw-native-sys/pypto-lib) | PTO library project. |
| [pypto](https://github.com/hw-native-sys/pypto/) | PTO implementation project. |
| [ptoas](https://github.com/zhangstevenunity/PTOAS) | PTOAS project. |
| [pto-isa](https://github.com/PTO-ISA/pto-isa) | PTO ISA project. |
| [simpler](https://github.com/hw-native-sys/simpler) | Supporting project in the PTO target set. |
| [distributed-runtime](https://github.com/hengliao1972/pypto_runtime_distributed) | Distributed PTO runtime. |

## CANN

| Repository | Role |
| --- | --- |
| [hcomm](https://gitcode.com/cann/hcomm) | CANN communication project. |
| [hccl](https://gitcode.com/cann/hccl) | CANN collective communication project. |
| [shmem](https://gitcode.com/cann/shmem) | CANN shared memory project. |
| [hixl](https://gitcode.com/cann/hixl) | CANN transfer or interconnect project. |
| [cann-recipes-infer](https://gitcode.com/cann/cann-recipes-infer) | CANN inference recipe project. |

## Documentation Status

Repository profile pages should be created under [repositories](./repositories/) when a documentation pass inspects source layout, dependencies, build files, tests, examples, and upstream documentation.
```

- [ ] **Step 3: Create `wiki/toolchain-map.md`**

Use this complete content:

```markdown
# Toolchain Map

The PTO-CANN target set combines PTO projects, CANN projects, runtime components, communication libraries, serving components, and recipes.

## Current View

| Area | Current Repositories | Notes |
| --- | --- | --- |
| PTO design and ISA | `pypto_top_level_documents`, `pto-isa` | Design and instruction-set knowledge should be documented with direct source references. |
| PTO implementation and libraries | `pypto`, `pto-li`, `simpler` | Implementation relationships require repository documentation passes before this wiki states firm architecture. |
| Runtime and serving | `distributed-runtime`, `serving-lib`, `ptoas` | Runtime and serving roles should be expanded from source, examples, and design docs. |
| CANN communication and memory | `hcomm`, `hccl`, `shmem`, `hixl` | Dependency and interface relationships should be verified from upstream repos. |
| CANN recipes | `cann-recipes-infer` | Recipe pages should link concrete examples to the libraries and runtime behavior they exercise. |

## Documentation Rule

This map is a starting orientation. Do not treat it as a complete architecture description until the relevant repositories have been inspected and cited.
```

- [ ] **Step 4: Create `wiki/glossary.md`**

Use this complete content:

```markdown
# Glossary

This glossary grows as terms are encountered during lookup and repository documentation.

| Term | Meaning | Source |
| --- | --- | --- |
| PTO | Current target-set term for PTO projects in this repository. Expand after source-backed documentation. | Local target configuration. |
| CANN | Current target-set term for CANN projects in this repository. Expand after source-backed documentation. | Local target configuration. |
| Target set | The configured group of repositories and concepts documented by this reusable wiki template. | `config/target-set.yml` |
| Repository profile | A wiki page that explains one repository's role, structure, dependencies, entry points, and open questions. | `.agents/templates/repo-profile.md` |
```

- [ ] **Step 5: Create `wiki/repositories/README.md`**

Use this complete content:

```markdown
# Repository Profiles

Repository profiles are created after an agent performs a documentation pass on a target repository.

Each profile should explain:

- what the repository does
- where it fits in the target set
- important dependencies and build files
- source layout and major modules
- public entry points or APIs
- tests, examples, and scripts
- verified facts, inferred architecture, and open questions

Use `.agents/templates/repo-profile.md` when creating a new profile.
```

- [ ] **Step 6: Verify no placeholders leaked into the wiki**

Run:

```bash
rg -n "TODO|TBD|FIXME|fill in|placeholder" wiki
```

Expected: no matches.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git add wiki
git commit -m "docs: seed human-readable wiki"
```

Expected: commit succeeds and includes only `wiki/`.

### Task 3: Reusable Agent Rules And Workflows

**Files:**
- Create: `AGENTS.md`
- Create: `.agents/workflows/repo-documentation.md`
- Create: `.agents/workflows/wiki-lookup-and-update.md`
- Create: `.agents/workflows/dependency-and-code-analysis.md`
- Create: `.agents/policies/wiki-update-policy.md`
- Create: `.agents/policies/source-and-citation-policy.md`
- Create: `.agents/policies/template-reuse-policy.md`
- Verify: `rg -n "PTO-CANN" .agents AGENTS.md`

- [ ] **Step 1: Create `AGENTS.md`**

Use this complete content:

```markdown
# Agent Instructions

This repository is a reusable technical wiki template. Agents must keep reusable behavior separate from target-specific facts.

## Required Reading

Before answering lookup requests, updating the wiki, or documenting repositories, read the relevant files:

- `.agents/workflows/wiki-lookup-and-update.md`
- `.agents/workflows/repo-documentation.md`
- `.agents/workflows/dependency-and-code-analysis.md`
- `.agents/policies/wiki-update-policy.md`
- `.agents/policies/source-and-citation-policy.md`
- `.agents/policies/template-reuse-policy.md`

## Core Rules

- Keep `wiki/` human-readable.
- Keep `.agents/` target-set agnostic and reusable.
- Put target-specific repository data in `config/target-set.yml`.
- Put target-specific human knowledge in `wiki/`.
- Cite source files, upstream documentation, repository URLs, commits, tags, or releases for factual claims.
- Distinguish verified facts from inferred architecture.
- Do not copy whole upstream documents into this repository.
- Prefer incremental wiki updates over broad rewrites unless restructuring clearly improves correctness or navigation.
- Preserve uncertainty when sources are incomplete, stale, or conflicting.
```

- [ ] **Step 2: Create `.agents/workflows/wiki-lookup-and-update.md`**

Use this complete content:

```markdown
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
```

- [ ] **Step 3: Create `.agents/workflows/repo-documentation.md`**

Use this complete content:

```markdown
# Repository Documentation Workflow

Use this workflow when documenting one repository in the target set.

## Required Analysis

Go deeper than README summarization. Inspect available evidence in this order:

1. Repository metadata and README files.
2. Dependency manifests, lockfiles, build files, package metadata, and toolchain files.
3. Source tree structure, entry points, public APIs, major modules, and extension points.
4. Tests, examples, scripts, CI, deployment files, and generated artifacts.
5. Cross-repository references, shared concepts, and version or release context.

## Output Requirements

Write for humans. Explain:

- what the repository does
- where it fits in the target set
- what dependencies and build files imply
- which modules and entry points matter
- how tests and examples demonstrate expected use
- what is verified, what is inferred, and what is still unknown

Use `.agents/templates/repo-profile.md` for new repository profile pages.
```

- [ ] **Step 4: Create `.agents/workflows/dependency-and-code-analysis.md`**

Use this complete content:

```markdown
# Dependency And Code Analysis Workflow

Use this workflow when a lookup or documentation task requires source-level detail.

## Dependency Pass

Inspect dependency sources before summarizing behavior:

- package manifests and lockfiles
- build system files
- compiler, runtime, or toolchain configuration
- vendored dependencies or submodules
- generated code configuration
- CI setup that reveals supported environments

## Code Pass

Inspect code structure before making architectural claims:

- top-level directories
- executable entry points
- library public APIs
- core modules and data flow
- extension points
- tests and examples that show intended usage

## Explanation Standard

Summaries must connect code facts to human meaning. Avoid dumping file lists. Explain why a dependency, module, or entry point matters to the target set.
```

- [ ] **Step 5: Create `.agents/policies/wiki-update-policy.md`**

Use this complete content:

```markdown
# Wiki Update Policy

The wiki grows incrementally from real lookup and documentation work.

## Allowed Updates

- Add sourced durable knowledge.
- Improve navigation for existing knowledge.
- Correct stale or inaccurate content with evidence.
- Add diagrams or tables when they make relationships easier to understand.
- Create repository profiles after a source-backed documentation pass.

## Disallowed Updates

- Unsourced claims.
- Whole upstream document copies.
- Broad rewrites without a correctness or navigation reason.
- Target-specific facts in `.agents/`.
- Agent workflow instructions in `wiki/`.

## Human Readability

Every wiki update should help a reader understand the toolchain faster. Keep prose clear, cite sources near the claims they support, and separate verified facts from inference.
```

- [ ] **Step 6: Create `.agents/policies/source-and-citation-policy.md`**

Use this complete content:

```markdown
# Source And Citation Policy

Factual wiki claims need evidence.

## Preferred Sources

1. Source files in the target repository.
2. Build, dependency, CI, test, and example files.
3. Upstream documentation.
4. Releases, tags, commits, and maintainer-authored issue or PR comments.
5. Official project pages.

## Citation Rules

- Cite URLs for external sources.
- Cite local paths when documenting files checked out in the workspace.
- Include commit, tag, or retrieval date when freshness matters.
- Mark claims as inference when they come from reading code structure rather than explicit docs.
- Preserve conflicting evidence instead of forcing a false conclusion.
```

- [ ] **Step 7: Create `.agents/policies/template-reuse-policy.md`**

Use this complete content:

```markdown
# Template Reuse Policy

This repository should be usable as a GitHub template for other project collections.

## Reusable Areas

- `AGENTS.md`
- `.agents/`
- website rendering configuration
- generic documentation templates
- target configuration schema

## Target-Specific Areas

- `config/target-set.yml`
- `wiki/`
- repository profile pages
- target-specific images and assets

Reusable files must not assume the current target set except in clearly marked examples.
```

- [ ] **Step 8: Verify reusable files avoid target-specific assumptions**

Run:

```bash
rg -n "PTO-CANN|PTO|CANN|pypto|hccl" .agents AGENTS.md
```

Expected: no matches.

- [ ] **Step 9: Commit Task 3**

Run:

```bash
git add AGENTS.md .agents
git commit -m "docs: add reusable agent governance"
```

Expected: commit succeeds and includes `AGENTS.md` and `.agents/`.

### Task 4: Agent Templates And Skills

**Files:**
- Create: `.agents/templates/wiki-page.md`
- Create: `.agents/templates/repo-profile.md`
- Create: `.agents/templates/dependency-note.md`
- Create: `.agents/templates/lookup-note.md`
- Create: `.agents/skills/wiki-maintainer.md`
- Create: `.agents/skills/repo-documenter.md`
- Verify: `rg -n "TBD|TODO|FIXME|placeholder" .agents/templates .agents/skills`

- [ ] **Step 1: Create `.agents/templates/wiki-page.md`**

Use this complete content:

```markdown
# Page Title

Write a short human-readable summary of the topic.

## What It Covers

Explain the scope of the page and what readers should learn here.

## Key Concepts

| Concept | Explanation | Source |
| --- | --- | --- |
| Example concept | Replace this row when creating a real page. | Source link or local path. |

## Details

Add sourced explanation in clear prose. Separate verified facts from inferred relationships.

## Sources

- Source link or local path.
```

- [ ] **Step 2: Create `.agents/templates/repo-profile.md`**

Use this complete content:

```markdown
# Repository Name

Short summary of what the repository does and where it fits in the target set.

## Role In The Target Set

Explain the repository's role using source-backed facts.

## Source Snapshot

| Item | Value |
| --- | --- |
| Repository | URL |
| Version, tag, or commit | Value used for this profile |
| Documentation date | Date |

## Dependency And Build Surface

Summarize manifests, lockfiles, build files, package metadata, toolchain files, and CI evidence.

## Code Structure

Explain important directories, entry points, public APIs, modules, and extension points.

## Tests, Examples, And Scripts

Summarize evidence that shows intended usage or supported workflows.

## Verified Facts

- Fact with citation.

## Inferred Architecture

- Inference with explanation and supporting evidence.

## Open Questions

- Question that remains unresolved after this documentation pass.

## Sources

- Source link or local path.
```

- [ ] **Step 3: Create `.agents/templates/dependency-note.md`**

Use this complete content:

```markdown
# Dependency Note

## Context

Explain why this dependency relationship was investigated.

## Evidence

| Evidence | Source |
| --- | --- |
| Dependency, build, or code fact | Source link or local path |

## Interpretation

Explain what the evidence means for humans reading the wiki.

## Wiki Update Decision

State whether this should update the wiki and why.
```

- [ ] **Step 4: Create `.agents/templates/lookup-note.md`**

Use this complete content:

```markdown
# Lookup Note

## Question

Record the question that triggered the lookup.

## Sources Checked

- Source link or local path.

## Findings

- Finding with citation.

## Answer Summary

Write the human-readable answer.

## Wiki Update Decision

State whether the finding should update the wiki and name the target page.
```

- [ ] **Step 5: Create `.agents/skills/wiki-maintainer.md`**

Use this complete content:

```markdown
# Wiki Maintainer Skill

Use this skill when maintaining a Markdown-first technical wiki for a configured target set.

## Steps

1. Read `AGENTS.md`.
2. Read `.agents/workflows/wiki-lookup-and-update.md`.
3. Read `.agents/policies/wiki-update-policy.md`.
4. Read `.agents/policies/source-and-citation-policy.md`.
5. Check `config/target-set.yml`.
6. Search `wiki/` before researching external sources.
7. Update the smallest relevant wiki page when durable sourced knowledge should be preserved.
8. Verify the wiki remains human-readable.
```

- [ ] **Step 6: Create `.agents/skills/repo-documenter.md`**

Use this complete content:

```markdown
# Repository Documenter Skill

Use this skill when documenting a repository in a configured target set.

## Steps

1. Read `AGENTS.md`.
2. Read `.agents/workflows/repo-documentation.md`.
3. Read `.agents/workflows/dependency-and-code-analysis.md`.
4. Read `.agents/policies/source-and-citation-policy.md`.
5. Identify the repository in `config/target-set.yml`.
6. Inspect README, dependency files, build files, source layout, tests, examples, scripts, and CI.
7. Create or update a repository profile using `.agents/templates/repo-profile.md`.
8. Mark verified facts, inferred architecture, and open questions separately.
```

- [ ] **Step 7: Verify templates and skills have no unfinished markers**

Run:

```bash
rg -n "TBD|TODO|FIXME|fill in|placeholder" .agents/templates .agents/skills
```

Expected: no matches.

- [ ] **Step 8: Commit Task 4**

Run:

```bash
git add .agents/templates .agents/skills
git commit -m "docs: add reusable agent templates and skills"
```

Expected: commit succeeds and includes templates and skills.

### Task 5: VitePress Website Rendering

**Files:**
- Create: `package.json`
- Create: `wiki/.vitepress/config.mts`
- Create: `.gitignore`
- Verify: `npm install`
- Verify: `npm run docs:build`

- [ ] **Step 1: Create `package.json`**

Use this complete content:

```json
{
  "name": "pto-cann-collections",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "docs:dev": "vitepress dev wiki",
    "docs:build": "vitepress build wiki",
    "docs:preview": "vitepress preview wiki"
  },
  "devDependencies": {
    "vitepress": "^1.6.3"
  }
}
```

- [ ] **Step 2: Create `wiki/.vitepress/config.mts`**

Use this complete content:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'PTO-CANN Toolchain Wiki',
  description: 'Reusable technical wiki template with PTO-CANN as the current target set.',
  cleanUrls: true,
  ignoreDeadLinks: [
    /^https:\/\/github\.com\//,
    /^https:\/\/gitcode\.com\//
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/projects' },
      { text: 'Toolchain Map', link: '/toolchain-map' },
      { text: 'Glossary', link: '/glossary' }
    ],
    sidebar: [
      {
        text: 'Wiki',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Projects', link: '/projects' },
          { text: 'Toolchain Map', link: '/toolchain-map' },
          { text: 'Glossary', link: '/glossary' }
        ]
      },
      {
        text: 'Repositories',
        items: [
          { text: 'Repository Profiles', link: '/repositories/' }
        ]
      }
    ],
    search: {
      provider: 'local'
    }
  }
})
```

- [ ] **Step 3: Create `.gitignore`**

Use this complete content:

```gitignore
node_modules/
wiki/.vitepress/cache/
wiki/.vitepress/dist/
.DS_Store
```

- [ ] **Step 4: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and npm exits successfully.

- [ ] **Step 5: Build the wiki website**

Run:

```bash
npm run docs:build
```

Expected: VitePress builds the site successfully into `wiki/.vitepress/dist/`.

- [ ] **Step 6: Commit Task 5**

Run:

```bash
git add package.json package-lock.json wiki/.vitepress/config.mts .gitignore
git commit -m "build: render wiki with vitepress"
```

Expected: commit succeeds and does not include `node_modules/` or `wiki/.vitepress/dist/`.

### Task 6: Final Verification

**Files:**
- Verify: all repository files
- Verify: git history and status

- [ ] **Step 1: Check for unfinished markers**

Run:

```bash
rg -n "TBD|TODO|FIXME|fill in|placeholder" README.md AGENTS.md wiki .agents config
```

Expected: no matches.

- [ ] **Step 2: Check target-specific content is separated**

Run:

```bash
rg -n "PTO-CANN|PTO|CANN|pypto|hccl" .agents AGENTS.md
```

Expected: no matches.

- [ ] **Step 3: Build the website again**

Run:

```bash
npm run docs:build
```

Expected: build succeeds.

- [ ] **Step 4: Inspect git status**

Run:

```bash
git status --short
```

Expected: no uncommitted files except this plan file if it has not been committed yet.

- [ ] **Step 5: Commit this plan if still uncommitted**

Run:

```bash
git add docs/superpowers/plans/2026-05-02-reusable-toolchain-wiki-implementation.md
git commit -m "docs: add reusable wiki implementation plan"
```

Expected: commit succeeds if the plan file was uncommitted. If it was already committed, Git reports nothing to commit.
