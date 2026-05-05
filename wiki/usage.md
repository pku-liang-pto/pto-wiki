---
title: "Usage"
type: usage
status: draft
sources:
  - package.json
  - pixi.toml
  - wiki/.vitepress/config.mts
last_updated: 2026-05-05
---

# Usage

本页说明如何运行和维护这个 Markdown/VitePress wiki。当前 target set 配置在 `config/target-set.yml`；公开学习内容位于 `wiki/`；本地 repository checkouts 位于 `repositories/`，用于 source inspection，不应作为 wiki 内容直接发布。

## Pixi Commands

Pixi is the preferred command runner for this repository. The tasks are defined in `pixi.toml` and delegate website work to the npm scripts in `package.json`.

Install JavaScript dependencies:

```bash
pixi run install
```

Start the local documentation server:

```bash
pixi run docs-dev
```

Build the static site:

```bash
pixi run docs-build
```

Preview the built site:

```bash
pixi run docs-preview
```

Pixi provides the Node.js environment used by these commands. The project still keeps `package.json` and `package-lock.json` because VitePress is installed as a Node package.

## Target Configuration

Edit `config/target-set.yml` to change the repository collection documented by this wiki. Repository groups, names, URLs, and short roles live there so the reusable agent rules do not hard-code one target set.

## Wiki Areas

Rendered wiki 的公开 navigation/sidebar 保持小而稳定：Home、Repositories、Examples、Topics、Concepts、Materials。Evidence、Projects、Toolchain Map、Usage、Log 仍可通过链接访问，但不作为主要 public learning sidebar 项。

- `wiki/index.md`: entry point and catalog.
- `wiki/overview.md`: living synthesis across the target set.
- `wiki/log.md`: append-only record of durable wiki maintenance operations.
- `wiki/repositories/`: repository profiles.
- `wiki/examples/`: public example chapters; current PTO examples live under `wiki/examples/pto/`.
- `wiki/topics/`: feature, behavior, workflow, and issue-family syntheses.
- `wiki/concepts/`: reusable target-set concepts and acronyms.
- `wiki/materials/`: public source-material library when the user explicitly wants materials rendered.
- `wiki/evidence/`: topic-scoped evidence ledgers for material, GitHub, external-document, and cross-repository claims.

Agent operating rules are intentionally outside the rendered wiki, under `AGENTS.md` and `.agents/`.

## Repository Workspace

`repositories/` is the local workspace for cloned target repositories. It is empty by default except for `repositories/README.md`.

The default checkout layout is:

```text
repositories/<repository-name>/
```

Cloned repositories are local cache data. They should not be committed into this wiki repository.
