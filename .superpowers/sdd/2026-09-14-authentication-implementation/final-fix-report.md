# Final Fix Report

Date: 2026-09-14

## Applied fixes

- Regenerated the root `bun.lock` with Bun 1.4.2 so the root workspace resolves `@nestjs/jwt` and `bcryptjs`, matching `apps/server/package.json` and `apps/server/bun.lock`.
- Added a private fixed bcrypt dummy hash comparison for unknown-email authentication attempts. Unknown-email and wrong-password attempts still return the same `InvalidCredentialsError`.
- Moved the database-backed seed test from `seed.spec.ts` to `seed.e2e-spec.ts`, so the regular unit-test command does not require PostgreSQL while `test:e2e` still discovers it.

## Explicit review decision

Swagger HTTP routes remain public by explicit user decision. No `main.ts` Swagger middleware or Swagger access test was retained.

## Validation

- Isolated root `bun install --frozen-lockfile`: passed (`FROZEN_LOCKFILE_OK`), using a temporary copy of the root and workspace package manifests; the temporary directory was removed.
- `apps/server`: `bun test`: passed, 115 tests across 36 files.
- `apps/server`: `bun run test:e2e`: passed, 38 tests across 23 suites.
- `apps/server`: `bun run typecheck`: passed.
- `apps/server`: `bun run lint`: passed.
- `apps/server`: `bun run build`: passed.
