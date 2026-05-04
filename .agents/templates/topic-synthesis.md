---
title: "<Topic Name>"
type: topic
status: draft
sources: []
last_updated: YYYY-MM-DD
---

# <Topic Name>

## Summary

用中文解释这个 topic 或 feature。说明它属于哪些 repository / target-set scope。保留 code identifiers、API names、file paths 和 source-native terms 的英文。

## Mental Model

Explain the concept directly, using concise Chinese prose and a small ASCII diagram when helpful. Do not make evidence links or tables carry the teaching burden.

## Foundation

For advanced or distributed topics, cite the basic terms, non-distributed execution flow, repository profiles, and examples that the reader should understand first. Do not let the topic appear detached from its non-distributed basis.

## Evidence Map

Evidence map 是审计支持，不是正文主体。只有在 prose 已经讲清楚后再放表。

| Evidence | Role | Notes |
| --- | --- | --- |
| <issue, PR, commit, branch, file, or material> | Primary / Supporting / Rejected | <why it matters or why it was excluded> |

For topics that rely on user materials, GitHub references, external documents, or cross-repository synthesis, create a paired `wiki/evidence/<topic>.md` ledger and cite it where status labels or synthesis claims need an audit trail.

## Verified Facts

- <Fact with nearby citation.>

## Examples

When examples are central to the topic, organize them from beginner to expert. Include the background concept, what each example demonstrates, comparable examples in other repositories, optimization techniques to notice, and missing examples marked `TODO`, `design-intended`, or `open question`.

## Inferred Architecture

- <Inference with the evidence that supports it.>

## Timeline

- <Date or commit>: <change or discussion, with citation.>

## Open Questions

- <Unknown or conflicting point, with evidence if available.>
