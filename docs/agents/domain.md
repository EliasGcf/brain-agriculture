# Domain Docs

## Layout

This monorepo uses a multi-context layout for frontend and backend:

- CONTEXT-MAP.md at the root maps contexts to their documentation.
- Each context has a CONTEXT.md in its directory.
- docs/adr/ at the root holds system-wide decisions.
- Each context's docs/adr/ holds decisions scoped to that context.

Record actual paths in CONTEXT-MAP.md when package directories are defined.

## Before exploring

Read the root CONTEXT-MAP.md and each CONTEXT.md relevant to the task.
Read root and context-scoped ADRs that touch the area being explored.

If these documents do not exist, proceed silently.
The domain-modeling skill creates them lazily as terminology and
decisions are resolved.

## Vocabulary

Use domain terms as defined in the relevant CONTEXT.md.
If a needed concept is missing, reconsider the term or note the gap
for domain-modeling.

## ADR conflicts

Explicitly identify any proposal that contradicts an existing ADR,
and explain why the decision should be reconsidered.
