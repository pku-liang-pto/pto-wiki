# Repository Documentation Workflow

Use this workflow when documenting one repository in the target set.

## Required Analysis

Go deeper than README summarization. Inspect available evidence in this order:

1. Repository metadata and README files.
2. Dependency manifests, lockfiles, build files, package metadata, toolchain files, `.gitmodules`, nested repositories, vendored dependency directories, and source-fetch scripts.
3. Source tree structure, entry points, public APIs, major modules, and extension points.
4. Tests, examples, scripts, CI, deployment files, and generated artifacts.
5. Cross-repository references, shared concepts, and version or release context.

## Output Requirements

Write for humans. Explain:

- what the repository does
- where it fits in the target set
- what dependencies and build files imply
- which submodules, vendored code, nested repositories, or external source fetches are verified
- which modules and entry points matter
- how tests and examples demonstrate expected use
- what is verified, what is inferred, and what is still unknown

Use `.agents/templates/repo-profile.md` for new repository profile pages.
