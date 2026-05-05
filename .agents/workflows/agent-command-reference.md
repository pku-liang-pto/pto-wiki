# Agent Command Reference

These are human-agent command patterns, not shell commands. Use them to map a user's short request to the right reusable workflow.

## Lookup

`lookup: <topic>`

Use `.agents/workflows/wiki-lookup-and-update.md`. Search `wiki/` first, then inspect the smallest needed source set when the wiki is missing, stale, or too shallow. Answer in clear prose with citations.

`lookup and update wiki: <topic>`

Use the lookup workflow, then update the smallest durable wiki page when the finding is source-backed and likely to help future readers. Keep indexes, overview, and log current when navigation or synthesis changes.

## Materials

`ingest document material: <path>`

Use `.agents/workflows/document-material-ingestion.md`. Treat files, folders, and archives as evidence inputs. Record path/member/checksum/date/conversion method, create or update topic evidence ledgers, and synthesize durable knowledge in `wiki/`.

`ingest folder: <path>`

Scan document materials in the folder, skip generated caches and unreadable files, route durable evidence to topic ledgers, and update topic/concept pages only when synthesis is warranted.

`ingest zip: <path>`

List archive members first, reject unsafe paths, extract only to a temporary or materials workspace, and cite both archive and member paths used as evidence.

## Repositories

`document repository: <repo-name>`

Use `.agents/workflows/repo-documentation.md`. Resolve the repository from `config/target-set.yml`, clone or sync under `repositories/<repository-name>/` only when source inspection is needed, record the inspected ref and commit SHA, then write or update a repository profile.

`sync repository: <repo-name>`

Check for an existing checkout under `repositories/`; fetch or sync before relying on it when freshness matters. If missing and needed, clone from configured upstream. Preserve local checkout changes.

`analyze dependencies: <repo-name>`

Use `.agents/workflows/dependency-and-code-analysis.md`. Inspect manifests, lockfiles, build files, compiler/runtime config, vendored deps, generated-code config, external fetch scripts, and CI before summarizing relationships.

`analyze submodules: <repo-name>`

Inspect `.gitmodules`, nested git repositories, vendored dependency directories, CI submodule setup, build-system source fetches, and target-set references. Distinguish verified relationships from inference.

## GitHub References

`document branch: <repo-name> <branch>`

Use `.agents/workflows/github-reference-documentation.md`. Fetch the branch, inspect the tip and relevant source context, compare against a base when useful, and cite branch and commit SHA.

`document issue: <repo-name> <issue-number>`

Inspect issue body, state, labels, comments, linked PRs/commits, and referenced files. Use source inspection when durable claims need code evidence.

`document pull request: <repo-name> <pr-number>`

Inspect PR title, body, state, base/head refs, commits, changed files, and relevant discussion. Fetch the PR head or branch before relying on source claims.

## Topic Research

`research topic from materials: <repo-name> <topic>`

Use `.agents/workflows/topic-evidence-discovery.md`. Extract anchors from supplied materials, search wiki/source/history/GitHub, expand from strong matches, classify evidence, then write a standalone topic synthesis. Topic pages that depend on user-supplied materials, GitHub issues or PRs, external documents, or cross-repository synthesis must have and cite a paired `wiki/evidence/<topic>.md` ledger near the claims it supports.

## Health

`check wiki health`

Use `.agents/workflows/wiki-health-and-lint.md`. Check required core files, index reachability, local links, non-empty pages, standalone learning quality, nearby citations, and log coverage. Do not build graph data.
