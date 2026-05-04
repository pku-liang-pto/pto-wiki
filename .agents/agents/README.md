# Agent Role Profiles

This directory stores reusable role profiles for focused wiki review and maintenance.

Profiles are not workflows or skills. They define a reader perspective, review goal, focus areas, and expected output shape. Use them when a wiki change needs content feedback from multiple audiences.

Current profiles:

- `project-newbie.md`: checks whether a technically capable newcomer can learn the system.
- `next-maintainer.md`: checks maintainer onboarding actionability.
- `examples-first-developer.md`: checks whether examples support practical learning.
- `evidence-auditor.md`: checks citation precision and status-label trust.

When using these profiles with subagents, ask each subagent to read one profile, review the relevant wiki pages, avoid editing files, and return findings with concrete page or section references.
