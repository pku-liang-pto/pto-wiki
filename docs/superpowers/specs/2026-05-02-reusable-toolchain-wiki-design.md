# Reusable Toolchain Wiki Design

## Purpose

This repository will become a reusable technical wiki template for documenting a set of related repositories, toolchains, and concepts. PTO-CANN is the first target set, but the agent workflows and governance must be reusable for other project collections.

The system has three responsibilities:

- Provide a human-readable wiki that grows from real lookup and documentation needs.
- Render that wiki as a website.
- Give agents mature, repeatable rules for researching repositories, understanding dependencies and code structure, and updating the wiki with sourced knowledge.

## Source Of Truth

Markdown files under `wiki/` are the source of truth for human knowledge. Website tooling may render those files, add navigation, and improve browsing, but it must not replace the Markdown wiki as the canonical content.

Agent operating material belongs under `.agents/` and is indexed by `AGENTS.md`. Agent rules must stay target-set agnostic. PTO-CANN-specific facts belong in `wiki/` or target configuration, not in reusable workflows.

## Initial Structure

```text
README.md
AGENTS.md
wiki/
  README.md
  projects.md
  toolchain-map.md
  glossary.md
  repositories/
    README.md
.agents/
  workflows/
    repo-documentation.md
    wiki-lookup-and-update.md
    dependency-and-code-analysis.md
  policies/
    wiki-update-policy.md
    source-and-citation-policy.md
    template-reuse-policy.md
  templates/
    wiki-page.md
    repo-profile.md
    dependency-note.md
    lookup-note.md
  skills/
    wiki-maintainer.md
    repo-documenter.md
config/
  target-set.yml
```

## Target Configuration

`config/target-set.yml` defines the current project collection. For this repository, the target set is the PTO-CANN toolchain. A future user should be able to generate a GitHub template repo from this project, replace the target configuration and initial wiki pages, and keep the same `.agents/` workflows.

The configuration should include:

- target set name and description
- repository groups
- repository names, URLs, and roles when known
- optional documentation scope notes
- optional freshness expectations for frequently changing repositories

## Wiki Requirements

The wiki is human-readable first. Pages should explain systems, relationships, and code behavior in clear prose, with tables or diagrams where they improve understanding.

The initial wiki should not pretend to contain complete documentation for every repository. It should provide a useful starting map and then grow incrementally as users and agents look up concrete topics.

Durable knowledge discovered during lookup should be added back when it is likely to help future readers. Temporary facts, unresolved guesses, or one-off debugging observations should not be promoted unless they clarify a stable concept or workflow.

## Website Rendering

The repository should include static documentation tooling that renders `wiki/` as a website. A static docs system such as VitePress, MkDocs, or Docusaurus is appropriate for the initial implementation.

The website should provide:

- navigation from the wiki home page
- project and repository indexes
- readable code/repository profile pages
- search if supported by the chosen renderer
- simple local preview commands

The rendering stack should be replaceable. Agent policies and wiki content should not depend on one specific website framework unless the repository later standardizes on it.

## Agent Governance

`AGENTS.md` is the entry point for agent behavior. It must index the `.agents/` files and require agents to read the relevant workflow before performing wiki lookup, wiki updates, or repository documentation.

Agents must:

- keep `wiki/` human-readable
- keep `.agents/` reusable and target-set agnostic
- cite source files, upstream docs, repository URLs, commits, releases, or other evidence for factual claims
- distinguish verified facts from inferred architecture
- avoid copying whole upstream docs into this repository
- prefer incremental updates over broad rewrites unless restructuring clearly improves correctness or navigation
- preserve uncertainty when source evidence is incomplete or conflicting

## Repository Documentation Workflow

Repository documentation work must go deeper than README summarization. Agents should inspect, when available:

- dependency manifests, lockfiles, build files, package metadata, and toolchain files
- source tree structure, entry points, public APIs, major modules, and extension points
- tests, examples, scripts, deployment files, and CI configuration
- generated artifacts or code generation configuration
- cross-repository dependencies and shared concepts
- version, tag, release, or commit context when relevant

The output must remain human-readable. Agents should explain what the repository does, where it fits in the target set, which modules matter, how dependencies shape behavior, and what remains uncertain.

## Lookup And Update Workflow

Lookup starts by checking the local wiki and target configuration. If the answer is missing, stale, or insufficient, the agent researches source repositories or upstream documentation.

After answering, the agent decides whether the discovered knowledge should update the wiki. Updates are expected when the knowledge is durable, sourced, and likely to be useful for future lookups.

Wiki updates should include enough context for readers to understand the concept without replaying the full research process. Detailed raw notes can use `.agents/templates/lookup-note.md` if the implementation chooses to store research notes.

## Template Reuse

This repository should be easy to turn into a GitHub template repository. Reusable mechanics belong in:

- `AGENTS.md`
- `.agents/`
- website rendering configuration
- generic documentation templates
- target configuration schema

Target-specific material belongs in:

- `config/target-set.yml`
- `wiki/`
- repository profile pages
- target-specific images or assets

The reusable files should avoid PTO-CANN-specific assumptions except as examples clearly marked as examples.

## Non-Goals

The initial version does not need to import every upstream project wiki or fully document every target repository. It does not need to build a custom RAG application. It does not need to integrate DeepWiki-Open directly, though DeepWiki-Open is a useful reference for repository analysis and wiki generation workflows.

## Success Criteria

The first implementation is successful when:

- `README.md` positions the repository as a reusable toolchain wiki system with PTO-CANN as the current target.
- `wiki/` contains a useful human-readable starting point.
- `AGENTS.md` indexes reusable agent rules.
- `.agents/` contains mature workflows, policies, templates, and skills for lookup, updates, and repository documentation.
- `config/target-set.yml` separates PTO-CANN target data from reusable rules.
- The wiki can be rendered locally as a website.
