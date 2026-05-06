# Agent Command Reference

These are human-agent command patterns, not shell commands. Use them to map a user's short request to the right reusable skill and workflow.

## Wiki QA

`lookup: <topic>`

Use `wiki-qa-maintainer`. Search `wiki/` first, answer with citations, and use `wiki-researcher` only when the wiki is missing, stale, or too shallow.

`lookup and update wiki: <topic>`

Use `wiki-qa-maintainer`. Record QA history, then update the smallest curated wiki page only when the user explicitly asks for promotion or durable update.

`qa session`

Use `wiki-qa-maintainer`. Answer from wiki memory first, record raw QA history under `wiki/evidence/qa/`, and defer curated page updates until the user asks.

## Wiki Research

`research concept: <term>`

Use `wiki-researcher` in concept mode. Define the term locally, stabilize aliases and status boundaries, and cite wiki, repository, GitHub, or official documentation evidence.

`ingest document material: <path>`

Use `wiki-researcher` in material mode. Treat files, folders, and archives as evidence inputs. Record path/member/checksum/date/conversion method, create or update topic evidence ledgers, and synthesize durable knowledge only when requested.

`ingest folder: <path>`

Use `wiki-researcher` in material mode. Scan candidate materials, skip generated caches and unreadable files, route durable evidence to topic ledgers, and update topic/concept pages only when synthesis is warranted.

`ingest zip: <path>`

Use `wiki-researcher` in material mode. List archive members first, reject unsafe paths, extract only to a temporary or materials workspace, and cite both archive and member paths used as evidence.

`document repository: <repo-name>`

Use `wiki-researcher` in repository mode. Resolve the repository from `config/target-set.yml`, clone or sync under `repositories/<repository-name>/` only when source inspection is needed, record the inspected ref and commit SHA, then write or update a repository profile.

`sync repository: <repo-name>`

Use `wiki-researcher` in repository mode. Check for an existing checkout under `repositories/`; fetch or sync before relying on it when freshness matters. If missing and needed, clone from configured upstream. Preserve local checkout changes.

`analyze dependencies: <repo-name>`

Use `wiki-researcher` in dependency and code mode. Inspect manifests, lockfiles, build files, compiler/runtime config, vendored deps, generated-code config, external fetch scripts, and CI before summarizing relationships.

`analyze submodules: <repo-name>`

Use `wiki-researcher` in dependency and code mode. Inspect `.gitmodules`, nested git repositories, vendored dependency directories, CI submodule setup, build-system source fetches, and target-set references. Distinguish verified relationships from inference.

`document branch: <repo-name> <branch>`

Use `wiki-researcher` in GitHub mode. Fetch the branch, inspect the tip and relevant source context, compare against a base when useful, and cite branch and commit SHA.

`document issue: <repo-name> <issue-number>`

Use `wiki-researcher` in GitHub mode. Inspect issue body, state, labels, comments, linked PRs/commits, and referenced files. Use source inspection when durable claims need code evidence.

`document pull request: <repo-name> <pr-number>`

Use `wiki-researcher` in GitHub mode for durable wiki evidence. Inspect PR title, body, state, base/head refs, commits, changed files, and relevant discussion. Fetch the PR head or branch before relying on source claims.

`research topic from materials: <repo-name> <topic>`

Use `wiki-researcher` with the smallest needed source modes. Extract anchors from supplied materials, search wiki/source/history/GitHub, expand from strong matches, classify evidence, then write standalone topic synthesis only when requested.

## Wiki Review

`review wiki: <path-or-topic>`

Use `wiki-review-maintainer`. Check standalone learning quality, definitions, citations, table/prose balance, Future placement, navigation, and log coverage.

`integrate wiki feedback: <issue-or-pr>`

Use `wiki-review-maintainer`. Fetch feedback, classify it, route PR mechanics through `github-pr-operator`, and update wiki or harness files according to explicit scope.

`check wiki health`

Use `wiki-review-maintainer`. Check core files, index reachability, local links, sparse pages, standalone learning quality, citation proximity, Future placement, and log coverage.

## Agent Harness

`update agent workflow: <topic>`

Use `agent-harness-maintainer`. Change reusable `.agents` behavior through the active spec when routing, skills, workflows, policies, validators, or CI gates are affected.

`escalate review rule: <failure>`

Use `agent-harness-maintainer`. Convert repeated failures into the smallest useful durable rule: policy, workflow, skill, template, or validator.

## GitHub Operations

`checkout pr: <number>`

Use `github-pr-operator`. Fetch PR metadata, add the head remote when needed, and create a local PR work branch with the correct writable push target.

`review pr: <number>`

Use `github-pr-operator`. Fetch the actual base branch, compute the merge-base, inspect the PR-only diff, and lead with findings.

`publish pr` / `create pr`

Use `github-pr-operator` with `git-change-manager`. Verify committed scope, run relevant checks, push the current branch, and create or update the PR with summary and testing.

`resolve pr comments` / `fix pr checks`

Use `github-pr-operator`. Fetch unresolved review threads or failing checks, classify issues, implement fixes, verify, commit, and push.

`clean branches`

Use `github-pr-operator`. Detect regular and squash-merged branches, present safe deletions, and wait for explicit approval before deleting anything.

## Issues And Commits

`create issue` / `triage issue` / `fix issue`

Use `github-issue-operator`. Keep issue lifecycle work separate from PR mechanics and durable wiki synthesis unless the issue becomes source evidence.

`commit changes` / `prepare commit`

Use `git-change-manager`. Review diff scope, stage related files only, write a concise message, and do not commit unrelated changes.
