# Wiki Content Boundary Policy

Keep agent operating rules separate from human-facing wiki knowledge.

## Ownership

Use these locations consistently:

- `AGENTS.md`: short repository-level rules that every agent must follow.
- `.agents/`: reusable workflows, policies, templates, skills, reviewer profiles, and command references.
- `config/target-set.yml`: target-set repository metadata and short roles.
- `wiki/`: standalone learning material and durable synthesized knowledge about the configured target set.
- `wiki/evidence/`: audit ledgers that support topic claims; not process policy and not raw document mirrors.
- `repositories/`: local checkout cache used for source inspection.
- `materials/`: optional local user-supplied evidence workspace.
- `wiki/materials/`: public raw material bundles that the user explicitly wants exposed for audit.

## What Belongs In Agent Rules

Put process requirements in `AGENTS.md` or `.agents/`, including:

- when to inspect repositories, materials, GitHub issues, pull requests, commits, branches, or releases
- how to decide whether a finding should update the wiki
- where pages should be placed
- what health checks to run
- citation, evidence-ledger, and material-ingestion rules
- requirements that wiki pages be standalone, prose-first, and not table-only
- reusable quality standards for examples, advanced topics, and repository profiles
- command patterns for human-agent interactions

## What Belongs In The Wiki

Put target-set knowledge in `wiki/`, including:

- concepts a reader needs to learn the target set
- repository roles, architecture, examples, and current status
- topic syntheses and diagrams
- verified facts, inferred architecture, open questions, and status labels when they explain the target set
- evidence ledgers that make target claims auditable

Do not make wiki pages carry agent instructions such as "agents should update this page" or "use this template". If readers need to know that evidence exists, explain what the evidence means and link to it.

## Boundary Tests

Before committing a wiki/rules change, ask:

- Would this sentence help a human learn the target set? If yes, it can live in `wiki/`.
- Would this sentence tell an agent how to work? If yes, it belongs in `AGENTS.md` or `.agents/`.
- Is this a target-specific fact? If yes, it must not live in `.agents/`.
- Is this a reusable quality rule? If yes, it should not be duplicated across many wiki pages.
- Is a source link replacing explanation? If yes, add the explanation to `wiki/` and keep the source as citation.
