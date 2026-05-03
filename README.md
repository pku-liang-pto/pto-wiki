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

See `wiki/index.md` for the human-facing wiki entry point.

## Repository Layout

```text
wiki/                 Human-readable Markdown wiki and website source
.agents/              Reusable agent workflows, policies, templates, and skills
config/target-set.yml Current target set configuration
materials/            Ignored workspace for user-supplied document materials
repositories/         Local workspace for lazily cloned target repositories
resources/            Images and other static resources
```

## Usage

Pixi is the preferred command runner for this repository. It provides the Node.js environment and runs the VitePress website tasks defined in `pixi.toml`.

```bash
pixi run install
pixi run docs-dev
pixi run docs-build
pixi run docs-preview
```

See `wiki/usage.md` for target configuration, wiki organization, document material ingestion, lazy repository workspace behavior, branch/issue/PR inspection, and documented agent lookup commands.

## Agent Guidance

Agents must start with `AGENTS.md` before performing wiki lookup, wiki updates, or repository documentation. Agent rules are intentionally target-set agnostic so this repository can be reused as a GitHub template for another project collection.

## Website Preview

After dependencies are installed, run:

```bash
pixi run docs-dev
```

The rendered site uses `wiki/` as its source.
