## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues. Before working with tickets, read `docs/agents/issue-tracker.md`.

### Triage labels

Use the five canonical triage labels. Before triaging, read `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a multi-context layout for frontend and backend. Before exploring the codebase, read `docs/agents/domain.md`.

### Testing

When creating or modifying tests, read `docs/agents/testing.md` and follow its test naming convention.

# Codex project instructions

For complex coding tasks, use the `orchestrator` skill when its trigger conditions match.

The root agent owns architecture, decomposition, integration, and final verification.
Prefer specialized subagents for bounded exploration, implementation, testing, review, and technical research.

Do not delegate trivial work merely for parallelism.
Do not let multiple implementation agents edit the same files without explicit ownership boundaries.
User instructions always take precedence over this orchestration policy.
