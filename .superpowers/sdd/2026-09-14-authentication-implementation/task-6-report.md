# Task 6 Report: Add the idempotent admin seed

## Status

Implemented and committed as `feat(auth): seed admin user`.

## Changes

- Added `apps/server/src/infra/database/drizzle/seed.ts`.
  - Connects to PostgreSQL using `DATABASE_URL`.
  - Hashes plaintext input `12345678` with the existing `BcryptHasher` (cost 8).
  - Inserts normalized `admin@admin.com` with the persisted field name `password`.
  - Uses `onConflictDoUpdate` on the unique email constraint so repeated runs remain idempotent.
  - Closes the pool in a `finally` block.
  - Does not log or persist the plaintext password.
- Added `db:seed` to `apps/server/package.json`.
- Added PostgreSQL-backed behavior tests in `seed.spec.ts` covering password verification and repeated execution without duplicate rows.

## Validation

- Confirmed the red test failed because `seed.ts` did not exist.
- `DATABASE_URL=... bun test apps/server/src/infra/database/drizzle/seed.spec.ts` — 2 passed.
- `bun run typecheck` from `apps/server` — passed.
- Focused oxlint for the seed files — passed.
- `bun run --cwd apps/server db:seed` — passed twice against the configured test database.
- `git diff --check` — passed.

## Concerns

- `psql` is not installed in the environment, so direct CLI row-count verification was unavailable; the integration test verifies exactly one admin row after repeated seeding.

## Review Fixes

- Refactored `seed` to accept optional connection string, pool max, and PostgreSQL schema/search-path options while preserving `DATABASE_URL` and the default schema for `db:seed`.
- Reworked `seed.spec.ts` to create a process-specific schema, execute the users migration table setup within it, use pool max 1, and drop the schema during teardown. The test no longer deletes from an ambient database.
- The test prepopulates the admin email with a different bcrypt hash, captures its ID, runs the seed twice, and verifies one row, unchanged ID, and successful `HashComparer.compare('12345678', password)`.

## Review-Fix Validation

- Seed Jest suite: 1 suite and 1 test passed.
- Standard unit suite: 37 suites and 116 tests passed.
- Server typecheck passed.
- Server lint passed.
- `db:seed` default command executed twice successfully against the configured database.
