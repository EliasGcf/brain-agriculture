# User Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add seeded internal-user authentication with bcrypt password verification, a 24-hour JWT, and a global guard that protects every existing HTTP route except login.

**Architecture:** Add an `auth` module with a domain `User` entity and abstract repository/contracts, application authentication use case, and infrastructure adapters for Drizzle, bcryptjs, and Nest JWT. Compose the module into the HTTP layer, register a global JWT guard, and add an idempotent Drizzle seed for the admin account.

**Tech Stack:** NestJS 12, TypeScript, Zod, Drizzle ORM/PostgreSQL, `@nestjs/jwt`, `bcryptjs`, Jest, Supertest.

**Spec:** `docs/superpowers/specs/2026-09-14-authentication-design.md`

## Global Constraints

- Persist exactly `id`, `email`, and `password` in `users`; `password` stores only a bcrypt hash.
- Only `POST /auth/login` is public among application routes; Swagger's `/docs` and `/docs-json` routes remain public by explicit product decision. Every other application HTTP route requires `Authorization: Bearer <JWT>`.
- JWT payload is `{ sub: userId }` and lifetime is fixed at 24 hours.
- Only `JWT_SECRET` is added to environment configuration; token duration is not configurable.
- No user-creation route, refresh token, logout, roles, or permissions.
- Use abstract classes for repository and cryptography contracts, matching existing dependency-injection patterns and the referenced `nest-clean` project.
- Test descriptions use English and the repository's `should be able to ...` / `should not be able to ...` convention.

### Task 1: Add the user domain and authentication contracts

**Files:**
- Create: `apps/server/src/modules/auth/domain/entities/user.ts`
- Create: `apps/server/src/modules/auth/domain/repositories/users.repository.ts`
- Create: `apps/server/src/modules/auth/application/cryptography/hash-generator.ts`
- Create: `apps/server/src/modules/auth/application/cryptography/hash-comparer.ts`
- Create: `apps/server/src/modules/auth/application/cryptography/encrypter.ts`
- Create: `apps/server/src/modules/auth/domain/entities/user.spec.ts`

**Interfaces:**
- `User.create({ email: string; password: string }, id?: UniqueEntityID): User`
- `User.id`, `User.email`, and `User.password` getters.
- `UsersRepository.findByEmail(email: string): Promise<User | null>`.
- `HashGenerator.hash(plain: string): Promise<string>`.
- `HashComparer.compare(plain: string, hash: string): Promise<boolean>`.
- `Encrypter.encrypt(payload: Record<string, unknown>): Promise<string>`.

- [ ] **Step 1: Write failing entity tests**

  Cover creating a valid user, normalizing an email to lowercase/trimmed form, and rejecting an empty/invalid email. Use the existing `Entity` and Zod patterns.

- [ ] **Step 2: Run the entity test and verify the expected failure**

  Run `bun test apps/server/src/modules/auth/domain/entities/user.spec.ts` from the repository root. It must fail because the `User` entity does not exist yet.

- [ ] **Step 3: Implement the entity and abstract contracts**

  Keep `password` as the stored hash value and do not add timestamps or additional fields. Use `Entity` with a private Zod schema, a static `create` factory, and read-only getters.

- [ ] **Step 4: Run the focused test and verify it passes**

  Run `bun test apps/server/src/modules/auth/domain/entities/user.spec.ts` and confirm all cases pass.

- [ ] **Step 5: Commit the domain slice**

  Run `git add apps/server/src/modules/auth` and commit with `feat(auth): add user domain contracts`.

### Task 2: Add database schema, migration, mapper, repository, and in-memory test support

**Files:**
- Modify: `apps/server/src/infra/database/drizzle/schema.ts`
- Modify: `apps/server/src/infra/database/drizzle/drizzle.module.ts`
- Create: `apps/server/src/modules/auth/infra/database/drizzle-user.mapper.ts`
- Create: `apps/server/src/modules/auth/infra/database/drizzle-users.repository.ts`
- Create: `apps/server/src/modules/auth/infra/database/drizzle-users.repository.e2e-spec.ts`
- Create: `apps/server/test/repositories/in-memory-users.repository.ts`
- Create: `apps/server/test/repositories/in-memory-users.repository.spec.ts`
- Create: `apps/server/test/factories/make-user.factory.ts`
- Modify: `apps/server/test/e2e-global-setup.ts`
- Create: `apps/server/drizzle/0001_add_users.sql`

**Interfaces:**
- `DrizzleUsersRepository` implements `UsersRepository` and uses `DRIZZLE`.
- `makeUserFactory(overrides?: Partial<{ email: string; password: string }>): User`.
- In-memory repository implements `findByEmail` with normalized email lookup.

- [ ] **Step 1: Write failing repository tests**

  Test that an in-memory repository finds an inserted user by normalized email and returns `null` for an unknown email. Add the Drizzle E2E test for persistence and unique email behavior using the existing database test setup conventions.

- [ ] **Step 2: Run repository tests and verify the expected failure**

  Run `bun test apps/server/test/repositories/in-memory-users.repository.spec.ts` and run the focused E2E command only when PostgreSQL is available. The in-memory test must fail because the repository and factory are absent.

- [ ] **Step 3: Add the Drizzle `users` table and migration**

  Define UUID primary key, unique non-null email, and non-null text password. Add `users` to the exported `schema` object, and create the migration that creates the table with the unique email constraint.

- [ ] **Step 4: Implement mapper, repository, factory, and setup truncation**

  Map `password` without exposing any alternate `passwordHash` property. Register `UsersRepository` to `DrizzleUsersRepository` and export it from `DrizzleModule`. Ensure E2E setup truncates the new table through `Object.values(schema)`.

- [ ] **Step 5: Run focused tests and typecheck**

  Run `bun test apps/server/test/repositories/in-memory-users.repository.spec.ts`, the repository E2E test with PostgreSQL, and `bun run --cwd apps/server typecheck`.

- [ ] **Step 6: Commit the persistence slice**

  Run `git add apps/server/src apps/server/test apps/server/drizzle` and commit with `feat(auth): persist users with drizzle`.

### Task 3: Add bcrypt and JWT infrastructure adapters

**Files:**
- Modify: `apps/server/package.json`
- Modify: `apps/server/bun.lock`
- Modify: `apps/server/src/infra/env/schema.ts`
- Create: `apps/server/src/modules/auth/infra/cryptography/bcrypt-hasher.ts`
- Create: `apps/server/src/modules/auth/infra/cryptography/jwt-encrypter.ts`
- Create: `apps/server/src/modules/auth/infra/cryptography/cryptography.module.ts`
- Create: `apps/server/src/modules/auth/infra/cryptography/bcrypt-hasher.spec.ts`

**Interfaces:**
- `BcryptHasher implements HashGenerator, HashComparer`.
- `JwtEncrypter implements Encrypter` and delegates to `JwtService.signAsync`.
- `CryptographyModule` exports all three abstract contracts.

- [ ] **Step 1: Add failing bcrypt behavior tests**

  Test that hashing does not return the plaintext, that the generated hash compares successfully with the original password, and that comparison rejects a wrong password.

- [ ] **Step 2: Run the focused test and verify the expected failure**

  Run `bun test apps/server/src/modules/auth/infra/cryptography/bcrypt-hasher.spec.ts`; it must fail before the adapter and dependency exist.

- [ ] **Step 3: Add dependencies and environment secret validation**

  Add `@nestjs/jwt` and `bcryptjs`, update the Bun lockfile, and add required `JWT_SECRET: z.string().min(1)` to `EnvSchema`. Do not add a JWT expiration environment key.

- [ ] **Step 4: Implement adapters and module**

  Use bcryptjs with the referenced salt-length pattern. Configure `JwtModule.registerAsync` from `EnvService`, use `JWT_SECRET`, and set `signOptions.expiresIn` to `'24h'`. Export `JwtService` through the module-backed `JwtEncrypter` contract as needed by the guard.

- [ ] **Step 5: Run focused tests and typecheck**

  Run the bcrypt test and `bun run --cwd apps/server typecheck`.

- [ ] **Step 6: Commit the cryptography slice**

  Run `git add apps/server/package.json apps/server/bun.lock apps/server/src/infra/env apps/server/src/modules/auth/infra/cryptography` and commit with `feat(auth): add bcrypt and jwt adapters`.

### Task 4: Implement authentication use case and login route

**Files:**
- Create: `apps/server/src/modules/auth/application/errors/invalid-credentials.error.ts`
- Create: `apps/server/src/modules/auth/application/use-cases/authenticate-user.use-case.ts`
- Create: `apps/server/src/modules/auth/application/use-cases/authenticate-user.use-case.spec.ts`
- Create: `apps/server/src/infra/http/controllers/authenticate-user.controller.ts`
- Create: `apps/server/src/infra/http/controllers/authenticate-user.controller.e2e-spec.ts`

**Interfaces:**
- `AuthenticateUserUseCase.execute({ email: string; password: string }): Promise<{ accessToken: string }>`.
- Controller route: `POST /auth/login`, request body `{ email: string; password: string }`, response `{ access_token: string }`.

- [ ] **Step 1: Write failing use-case tests**

  Cover successful authentication, unknown email, and wrong password. Assert that invalid credentials use the same domain/application error and that success returns the encrypted token result.

- [ ] **Step 2: Run the focused test and verify the expected failure**

  Run `bun test apps/server/src/modules/auth/application/use-cases/authenticate-user.use-case.spec.ts`; it must fail because the use case does not exist.

- [ ] **Step 3: Implement the use case**

  Normalize the email, query `UsersRepository`, compare the supplied password with `user.password`, throw the same invalid-credentials error for both missing and mismatched credentials, then encrypt `{ sub: user.id.toString() }`.

- [ ] **Step 4: Add the controller and request validation**

  Use the repository's Standard Schema/Zod DTO convention. Map the use-case result from `accessToken` to the public `access_token` response field and do not return email or password.

- [ ] **Step 5: Run unit and controller tests**

  Run both focused Jest test files and confirm success and invalid-credential cases pass.

- [ ] **Step 6: Commit the login slice**

  Run `git add apps/server/src/modules/auth/application apps/server/src/infra/http/controllers` and commit with `feat(auth): add user login`.

### Task 5: Add the global JWT guard and compose the auth module

**Files:**
- Create: `apps/server/src/modules/auth/infra/http/jwt-auth.guard.ts`
- Create: `apps/server/src/modules/auth/infra/http/public.decorator.ts`
- Create: `apps/server/src/modules/auth/auth.module.ts`
- Modify: `apps/server/src/infra/http/http.module.ts`
- Modify: `apps/server/src/infra/http/global-error-handling.ts`
- Create: `apps/server/src/modules/auth/infra/http/jwt-auth.guard.spec.ts`
- Modify: existing controller E2E specs to send bearer tokens where required

**Interfaces:**
- `JwtAuthGuard implements CanActivate` and verifies bearer tokens with `JwtService.verifyAsync`.
- `AuthModule` exports/assembles the repository, cryptography module, use case, login controller, and global `APP_GUARD`.

- [ ] **Step 1: Write failing guard tests**

  Cover accepting a valid bearer token with UUID `sub`, rejecting missing authorization, malformed authorization, invalid signature, expired token, and invalid `sub`.

- [ ] **Step 2: Run the focused test and verify the expected failure**

  Run `bun test apps/server/src/modules/auth/infra/http/jwt-auth.guard.spec.ts`; it must fail because the guard does not exist.

- [ ] **Step 3: Implement the guard**

  Extract only `Bearer <token>`, call `verifyAsync`, validate the payload shape, attach the verified payload to `request.user`, and throw `UnauthorizedException` for every failure without exposing JWT library errors.

- [ ] **Step 4: Compose the module and make it global**

  Import `DatabaseModule` and `CryptographyModule`, register the login controller/use case, and provide the guard with `APP_GUARD`. Implement `@Public()` with a `PUBLIC_ROUTE` metadata key, annotate only the login handler, and have the guard use Nest's `Reflector` to bypass authentication for that handler. No existing controller receives the decorator.

- [ ] **Step 5: Update E2E authentication setup**

  Add a login helper to existing controller E2E tests, seed or insert the admin user for the test database, send the bearer token on every protected request, and assert that a request without a token returns 401 while login remains public.

- [ ] **Step 6: Run focused guard/controller tests and typecheck**

  Run the guard test, all affected controller E2E tests, and `bun run --cwd apps/server typecheck`.

- [ ] **Step 7: Commit the guard/composition slice**

  Run `git add apps/server/src apps/server/test` and commit with `feat(auth): protect http routes with jwt`.

### Task 6: Add the idempotent admin seed

**Files:**
- Create: `apps/server/src/infra/database/drizzle/seed.ts`
- Modify: `apps/server/package.json`
- Create: `apps/server/src/infra/database/drizzle/seed.e2e-spec.ts`
- Modify: `apps/server/.env.test` if the test environment needs the JWT secret

**Interfaces:**
- Script command: `bun run --cwd apps/server db:seed`.
- Seed behavior: creates or updates exactly `admin@admin.com` with a bcrypt hash of `12345678` and never persists plaintext.

- [ ] **Step 1: Write failing seed behavior tests**

  Test that the seed creates the admin account, stores a value that compares successfully with `12345678`, and is idempotent when run twice.

- [ ] **Step 2: Run the focused test and verify the expected failure**

  Run `bun test apps/server/src/infra/database/drizzle/seed.e2e-spec.ts`; it must fail because the seed does not exist.

- [ ] **Step 3: Implement the seed and command**

  Reuse `BcryptHasher`, connect using the existing `DATABASE_URL`, insert the normalized email and hash with Drizzle's `onConflictDoUpdate` keyed by the unique email constraint, and close the pool in a `finally` block. Add the package script without logging the plaintext password.

- [ ] **Step 4: Run the seed test against PostgreSQL**

  Run the focused seed test, then execute `bun run --cwd apps/server db:seed` twice against the configured database and verify one admin row exists.

- [ ] **Step 5: Commit the seed slice**

  Run `git add apps/server/src/infra/database/drizzle/seed.ts apps/server/package.json apps/server/.env.test` and commit with `feat(auth): seed admin user`.

### Task 7: Run full verification and independent security review

**Files:**
- No planned production-file ownership; fix only findings discovered during verification/review.

- [ ] **Step 1: Run the complete server unit suite**

  Run `bun test --cwd apps/server` and record the exact passing/failing counts.

- [ ] **Step 2: Run typecheck, lint, build, and E2E suite**

  Run `bun run --cwd apps/server typecheck`, `bun run --cwd apps/server lint`, `bun run --cwd apps/server build`, and `bun run --cwd apps/server test:e2e` with PostgreSQL available.

- [ ] **Step 3: Verify security invariants manually**

  Confirm no response or log exposes the stored password, invalid email and wrong password return indistinguishable unauthorized responses, JWT expiration is 24 hours, only application login plus the explicit Swagger routes are public, and the admin seed remains idempotent.

- [ ] **Step 4: Request an independent code review**

  Review the final diff for authentication bypasses, secret handling, token validation, database integrity, and missing tests. Fix any material findings and rerun the affected checks.

- [ ] **Step 5: Commit verification fixes when findings exist**

  Use a focused commit message such as `fix(auth): address authentication review findings`.
