# Wiki Update Policy

The wiki grows incrementally from real lookup and documentation work.

Use `.agents/policies/wiki-content-boundary-policy.md` to keep reusable agent requirements out of rendered wiki content.

## Allowed Updates

- Add sourced durable knowledge.
- Improve navigation for existing knowledge.
- Correct stale or inaccurate content with evidence.
- Add diagrams or tables when they make relationships easier to understand.
- Create repository profiles after a source-backed documentation pass.
- Update `wiki/index.md`, area indexes, `wiki/overview.md`, and `wiki/log.md` when the change affects navigation, broad synthesis, or durable maintenance history.
- Record raw QA histories under `wiki/evidence/qa/`.
- Promote future, ongoing, roadmap, task-division, blocker, missing-example, planned, or design-intended knowledge into `wiki/future/` when explicitly instructed and source-backed.

## Disallowed Updates

- Unsourced claims.
- Whole upstream document copies.
- Broad rewrites without a correctness or navigation reason.
- Target-specific facts in `.agents/`.
- Agent workflow instructions in `wiki/`.

## Human Readability

Every wiki update should help a reader understand the toolchain faster. Keep prose clear, cite sources near the claims they support, and separate verified facts from inference.

Do not skip the foundation layer. If a wiki update focuses on distributed or advanced behavior, make sure the related non-distributed concepts, execution flow, and examples are already explained or are added in the same change.

Examples require extra care because they are the main bridge from architecture to maintainer action. Example documentation should explain background concepts before implementation detail, order examples from beginner to expert, compare common examples across repositories, call out optimization techniques, and mark important missing examples as `TODO` or `design-intended`.

Future work requires the same self-contained learning bar as implemented pages. Do not use `wiki/future/` as a scratchpad. A future page should explain objective, constraints, status, roadmap or task division when available, and links back to implemented foundations.

Follow `.agents/policies/wiki-organization-policy.md` for page placement, metadata, indexes, and health checks.
