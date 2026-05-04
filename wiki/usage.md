# Usage

This repository renders a Markdown wiki for the configured target set. The current target set is configured in `config/target-set.yml`; the human-facing wiki lives under `wiki/`.

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

The rendered wiki uses a small Markdown structure:

- `wiki/index.md`: entry point and catalog.
- `wiki/overview.md`: living synthesis across the target set.
- `wiki/log.md`: append-only record of durable wiki maintenance operations.
- `wiki/repositories/`: repository profiles.
- `wiki/evidence/`: topic-scoped evidence ledgers for material, GitHub, external-document, and cross-repository claims.
- `wiki/topics/`: feature, behavior, workflow, and issue-family syntheses.
- `wiki/concepts/`: reusable target-set concepts and acronyms.

Agent operating rules are intentionally outside the rendered wiki, under `AGENTS.md` and `.agents/`.

## Repository Workspace

`repositories/` is the local workspace for cloned target repositories. It is empty by default except for `repositories/README.md`.

The default checkout layout is:

```text
repositories/<repository-name>/
```

Cloned repositories are local cache data. They should not be committed into this wiki repository.
