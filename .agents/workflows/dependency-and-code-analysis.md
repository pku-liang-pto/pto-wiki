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

Distinguish verified dependency relationships from inferred relationships. For local clone evidence, cite the inspected path and commit SHA.
