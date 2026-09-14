# Task 5 report: global JWT guard and auth module composition

## Status

Implemented and validated.

## Changes

- Added `JwtAuthGuard` as a global `APP_GUARD`.
- Added strict `Bearer <token>` extraction and `JwtService.verifyAsync` validation.
- Validated that verified JWT payloads contain a UUID `sub`, attached the payload to `request.user`, and normalized every authentication failure to `UnauthorizedException`.
- Added `@Public()` metadata and applied it only to `POST /auth/login`.
- Added `AuthModule` composing the database, cryptography, login controller/use case, and global guard.
- Mapped invalid login credentials to HTTP 401 in global error handling.
- Updated controller E2E tests to insert isolated test admin users through the existing database connection, obtain tokens through the public login route, and send bearer tokens on protected requests.
- Added an integration assertion that a protected route returns 401 without a token while login remains public.
- No application seed was added.

## TDD evidence

The guard spec was written before the guard existed. The first focused run failed with `Cannot find module './jwt-auth.guard'`. After implementation, the focused guard suite passed. A follow-up malformed-bearer test was intentionally run red before tightening token extraction, then passed.

## Validation

- `bun test apps/server/src/modules/auth/infra/http/jwt-auth.guard.spec.ts` — 9 passed.
- `JWT_SECRET=test-secret bun run --cwd apps/server test:e2e --runInBand` — 22 suites / 36 tests passed.
- `bun run --cwd apps/server test` — 36 suites / 115 tests passed.
- `bun run --cwd apps/server typecheck` — passed.
- `bun run --cwd apps/server lint` — passed.
- `git diff --check` — passed.

## Scope and risks

- E2E execution requires `JWT_SECRET`; the repository's `.env.test` currently provides the database URL but not that variable, so validation supplied `JWT_SECRET=test-secret` at runtime.
- The test helper inserts a unique admin user per E2E application and does not change production seed behavior.

## Review fix

- Added `JWT_SECRET="test-secret"` to `apps/server/.env.test`, allowing the standard E2E command to run without a manually exported secret.
- Validation after the fix: `env -u JWT_SECRET bun run --cwd apps/server test:e2e --runInBand`, `bun run --cwd apps/server typecheck`, and `bun run --cwd apps/server lint` all passed.
