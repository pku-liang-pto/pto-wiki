# Pixi And Lookup Workflow Design

## Purpose

Extend the reusable toolchain wiki template with Pixi-managed website commands, a lazy repository workspace policy, mature submodule/dependency analysis rules, and human-facing usage documentation for agent lookup commands.

Lookup remains agent-driven and documented. The first implementation should not create a fake lookup CLI. Pixi manages environment setup and website lifecycle commands.

## Current State

The repository already has:

- a human-readable Markdown wiki under `wiki/`
- reusable agent governance under `.agents/`
- target data in `config/target-set.yml`
- VitePress website rendering through npm scripts

The repository does not yet have:

- a `projects/` workspace for cloned target repositories
- Pixi command management
- usage documentation for lookup and update commands
- an explicit policy for lazy cloning, repository syncing, or submodule dependency analysis

## Pixi Command Management

Pixi should become the user-facing command runner for the repository. The project may keep `package.json` and `package-lock.json` because VitePress is a Node package, but README and usage docs should prefer Pixi commands.

Initial Pixi tasks:

- `pixi run install`: install JavaScript dependencies with npm
- `pixi run docs-dev`: run the VitePress development server
- `pixi run docs-build`: build the static wiki site
- `pixi run docs-preview`: preview the built wiki site

Pixi should provide Node.js and npm so users do not need to manage those versions manually.

## Repository Workspace

Add `projects/` as the local workspace for target repository clones. It should be empty by default except for a tracked `projects/README.md`.

Target repositories should be cloned lazily when a lookup or documentation task requires source inspection. They should not be vendored into this repository by default.

Recommended clone layout:

```text
projects/<group>/<repository-name>/
```

Example for the current target set:

```text
projects/PTO/pypto/
projects/CANN/hccl/
```

The exact target set is read from `config/target-set.yml`; reusable workflows must not hard-code the PTO-CANN names.

## Git Hygiene

Cloned repositories under `projects/` must not be committed into this wiki repository.

The root `.gitignore` should ignore cloned project contents while allowing a tracked `projects/README.md` or equivalent workspace explanation.

Agents must treat `projects/` as a cache/workspace. They may clone, fetch, inspect, and update local clones during lookup, but wiki updates should cite the inspected repository path and commit SHA when local clone evidence is used.

## Agent Lookup Commands

Lookup commands are documented human-agent interaction patterns, not shell commands in the first implementation.

Document these commands in `wiki/usage.md`:

- `lookup: <topic>`
- `lookup and update wiki: <topic>`
- `document repository: <repo-name>`
- `sync repository: <repo-name>`
- `analyze dependencies: <repo-name>`
- `analyze submodules: <repo-name>`

Each command should explain:

- what the agent checks first
- when the agent clones or syncs repositories
- what evidence the agent inspects
- when the agent updates the wiki
- what citations are expected

## Lookup Behavior

For lookup requests, agents should:

1. Read `AGENTS.md` and relevant `.agents/` workflows.
2. Read `config/target-set.yml`.
3. Search `wiki/`.
4. If local wiki coverage is insufficient, locate relevant target repositories.
5. Clone missing repositories into `projects/<group>/<repo>/` only when needed.
6. Fetch or sync existing clones before relying on them when freshness matters.
7. Inspect repository docs, build files, dependency files, source layout, tests, examples, and CI as required by the question.
8. Answer in human-readable prose.
9. Update the wiki only when the finding is durable, sourced, and likely useful for future readers.

## Submodule And Dependency Analysis

Dependency analysis must include repository relationship evidence, not only package manifests.

Agents should inspect:

- `.gitmodules`
- nested git repositories
- vendored dependency directories
- package manifests and lockfiles
- build-system fetched dependencies
- CI setup that initializes submodules or external dependencies
- references to other repositories in the configured target set
- generated code configuration and external source fetch scripts

Agents should summarize submodule and dependency relationships in human-readable terms and distinguish verified relationships from inferred relationships.

## Usage Documentation

Add `wiki/usage.md` and link it from `wiki/index.md` and VitePress navigation.

The usage page should cover:

- installing Pixi or the expectation that Pixi is available
- running docs preview/build commands
- configuring `config/target-set.yml`
- how `projects/` is used
- documented agent lookup commands
- how lookup can trigger lazy clone, sync, deep repository inspection, and wiki updates
- what the agent will and will not commit

README should include a short usage section that points readers to `wiki/usage.md`.

## Agent Policy Updates

Add `.agents/policies/repository-workspace-policy.md`.

Update `AGENTS.md` required reading to include the repository workspace policy.

Update `.agents/workflows/wiki-lookup-and-update.md` to mention lazy cloning and syncing.

Update `.agents/workflows/dependency-and-code-analysis.md` to require submodule and repository relationship analysis.

Update `.agents/skills/repo-documenter.md` or `.agents/skills/wiki-maintainer.md` where needed so agents know to use `projects/` as the clone workspace and cite local clone commits.

## Non-Goals

The first implementation should not create a lookup CLI, agent runner, background sync daemon, or automatic scheduled updater. It should document lookup commands as human-agent interaction patterns and make the repository ready for scripted lookup later.

## Success Criteria

The implementation is successful when:

- Pixi can run install, docs dev, docs build, and docs preview tasks.
- README and `wiki/usage.md` document Pixi-first usage.
- `projects/` exists as a documented lazy clone workspace without tracking cloned repositories.
- Agent policies require lazy cloning, syncing, and local clone citation practices.
- Dependency analysis rules explicitly include submodules and repository relationship evidence.
- Lookup commands are documented as agent commands, not shell commands.
- The VitePress build still passes.
