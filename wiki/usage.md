# Usage

This repository is a reusable technical wiki template. The current target set is configured in `config/target-set.yml`, while the rendered wiki lives under `wiki/`.

## Pixi Commands

Pixi is the preferred command runner for this repository. The tasks are defined in `pixi.toml` and delegate the website work to the npm scripts in `package.json`.

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

Edit `config/target-set.yml` to change the target set documented by this wiki. Keep repository groups, names, URLs, and short roles there instead of hard-coding a specific project collection into reusable agent workflows.

The wiki should contain human knowledge about the configured target set. Reusable instructions for agents belong under `.agents/`.

## Repository Workspace

`repositories/` is the local workspace for cloned target repositories. It is empty by default except for `repositories/README.md`.

Agents clone repositories there only when lookup, documentation, or dependency analysis needs source inspection. The default layout is:

```text
repositories/<repository-name>/
```

Cloned repositories are local cache data. They should not be committed into this wiki repository.

## Agent Lookup Commands

The following are human-agent commands, not shell commands. Ask an agent with one of these patterns when you want source-backed lookup or wiki maintenance.

### `lookup: <topic>`

The agent checks `AGENTS.md`, the relevant `.agents/` workflows, `config/target-set.yml`, and existing wiki pages first. If the wiki is missing, stale, or too shallow, the agent locates the smallest relevant repository set and inspects upstream sources as needed.

The answer should be clear prose with citations to source files, upstream documentation, commits, tags, releases, GitHub issues or PRs, or local checkout paths with refs and commit SHAs.

### `lookup and update wiki: <topic>`

The agent performs the lookup flow, then updates the smallest relevant wiki page when the finding is durable, source-backed, and likely to help future readers.

The agent should not update the wiki for one-off debugging state, unsupported guesses, or facts that are too transient to document usefully.

### `document repository: <repo-name>`

The agent finds the repository in `config/target-set.yml`, clones or syncs it under `repositories/<repository-name>/` when source inspection is required, records the inspected ref and commit SHA, and performs a documentation pass.

The resulting profile should explain what the repository does, where it fits in the target set, what the dependencies and build files imply, which entry points matter, what tests or examples show, and what remains unknown.

### `sync repository: <repo-name>`

The agent checks whether the repository already exists under `repositories/`. If it exists, the agent fetches or syncs it before relying on it. If it is missing and source inspection is needed, the agent clones it from the configured upstream URL.

If syncing fails or local checkout state is uncertain, the agent should say so instead of treating the checkout as fresh.

### `document branch: <repo-name> <branch>`

The agent fetches the named branch, inspects the branch tip and relevant source context, and records the branch name and commit SHA used as evidence.

When useful, the agent compares the branch against the repository default branch or another explicit base. Wiki updates should explain durable behavior or design facts, not transient branch bookkeeping.

### `document issue: <repo-name> <issue-number>`

The agent inspects the GitHub issue body, state, labels, comments when relevant, linked PRs or commits, and any referenced files. Source inspection happens through `repositories/<repository-name>/` when the issue needs code evidence.

Wiki updates should cite the issue URL and any checked-out refs or source files that support durable findings.

### `document pull request: <repo-name> <pr-number>`

The agent inspects PR title, body, state, base branch, head branch, commits, changed files, and relevant discussion. It fetches the PR head or branch before relying on source claims.

Wiki updates should cite the PR URL, inspected base and head refs, commit SHAs, and relevant source files.

### `research topic from materials: <repo-name> <topic>`

Use this when you provide notes, logs, file names, symbols, issue links, PR links, branch names, commits, or design fragments about a topic or feature.

The agent extracts search anchors from the materials, searches the wiki, local repository checkout, git history, and related GitHub issues and PRs, then expands from strong matches through cross-links, commits, branches, changed files, labels, milestones, and comments when relevant.

The wiki update should be a systematic synthesis. It should explain the topic, the related issues and PRs, the involved branches, commits, and files, verified facts, inferred architecture, and open questions. It should not claim exhaustive coverage unless the search scope makes that defensible.

### `analyze dependencies: <repo-name>`

The agent inspects dependency and toolchain evidence before summarizing relationships. This includes package manifests, lockfiles, build files, compiler or runtime configuration, vendored dependencies, generated-code configuration, external source-fetch scripts, and CI setup.

The summary should distinguish verified relationships from inferred ones and explain why the dependencies matter to the target set.

### `analyze submodules: <repo-name>`

The agent inspects `.gitmodules`, nested git repositories, vendored dependency directories, CI submodule setup, build-system source fetches, and references to other repositories in `config/target-set.yml`.

The output should summarize repository relationships in human-readable terms and cite the exact evidence inspected.

## What Agents Commit

Agents may update this wiki repository with durable documentation, reusable workflow changes, target configuration changes, and website configuration changes when asked.

Agents should not commit cloned target repositories from `repositories/`, raw upstream documents copied wholesale, unsupported guesses, or transient command output.
