# Dependency And Code Analysis Workflow

Use this workflow when a lookup or documentation task requires source-level detail.

## Dependency Pass

Inspect dependency and repository relationship sources before summarizing behavior:

- `.gitmodules`
- nested git repositories
- package manifests and lockfiles
- build system files
- compiler, runtime, or toolchain configuration
- vendored dependencies or submodules
- generated code configuration
- CI setup that reveals supported environments
- scripts or build rules that fetch external source
- references to other repositories in `config/target-set.yml`
- branch, issue, or PR-specific dependency changes when the task is scoped to a non-default ref

## Code Pass

Inspect code structure before making architectural claims:

- top-level directories
- executable entry points
- library public APIs
- core modules and data flow
- extension points
- tests and examples that show intended usage

When code analysis introduces important concepts, APIs, runtime layers, protocols, platform terms, or repository-specific identifiers, run `.agents/workflows/concept-evidence-lookup.md`. Explain the concept locally, then cite the source files, docs, commits, or official external references that prove the definition.

## Explanation Standard

Summaries must connect code facts to human meaning. Avoid dumping file lists. Explain why a dependency, module, or entry point matters to the target set.

Distinguish verified dependency relationships from inferred relationships. For local checkout evidence, cite the inspected path, ref, and commit SHA.
