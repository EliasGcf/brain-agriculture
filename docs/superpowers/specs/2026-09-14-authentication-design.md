# User Authentication Design

## Goal

Add simple internal-user authentication to the server. Users are created only by a database seed, authenticate with email and password, and receive a JWT access token valid for 24 hours.

## Scope and decisions

- The new domain concept is an internal `User`, distinct from an agricultural `Producer`.
- The user record has exactly three persisted values: `id`, `email`, and `password`.
- `password` is the bcrypt hash; plaintext passwords are accepted only at the authentication boundary and seed input, then discarded.
- Email is normalized to trimmed lowercase and is unique.
- There is no user-creation HTTP route, refresh token, logout, roles, or permissions in this iteration.
- `POST /auth/login` is the only public application route. Swagger documentation routes (`/docs` and `/docs-json`) remain public by explicit product decision.
- All existing HTTP routes are protected by a global JWT guard.
- JWT payload contains only `sub`, with the user's UUID.
- JWT lifetime is fixed at 24 hours in application configuration.
- Only `JWT_SECRET` is configurable through the environment. The 24-hour lifetime is not an environment setting.
- Invalid credentials, missing tokens, invalid tokens, and expired tokens return the existing API's unauthorized response without revealing whether an email exists.
- The seed is idempotent and creates `admin@admin.com` with the password `12345678` hashed using the same bcrypt abstraction used by the application.

## Architecture

The `auth` module follows the existing clean-architecture layout:

- Domain: `User` entity and abstract `UsersRepository`.
- Application: `AuthenticateUserUseCase`, invalid-credentials error, and abstract cryptography contracts for hash generation, hash comparison, and token encryption.
- Infrastructure: bcryptjs and Nest JWT adapters, Drizzle mapper/repository, HTTP login controller, DTO, and global JWT guard.
- Database: `users` Drizzle table and migration.
- Seed: a standalone Drizzle seed command that connects through the existing environment service/configuration and uses an idempotent insert/update strategy.

The cryptography contracts mirror the referenced `nest-clean` patterns: `HashGenerator.hash`, `HashComparer.compare`, and `Encrypter.encrypt`. `BcryptHasher` implements the two password contracts, while `JwtEncrypter` delegates signing to `JwtService.signAsync`.

## Request flows

### Login

1. The controller validates an `email` and `password` request body.
2. `AuthenticateUserUseCase` normalizes the email and queries `UsersRepository.findByEmail`.
3. The use case compares the supplied password with the persisted bcrypt hash.
4. Missing users and mismatched passwords follow the same invalid-credentials path.
5. On success, the use case encrypts `{ sub: user.id.toString() }` and returns `{ accessToken }` to the controller.
6. The controller serializes the response as `{ access_token }` to follow Nest's documented JWT response shape.

### Protected request

1. The global guard reads `Authorization: Bearer <token>`.
2. It verifies the signature and expiration with the configured `JWT_SECRET`.
3. It accepts only a payload with a UUID `sub` claim and attaches that payload to the request.
4. Missing, malformed, invalid, or expired tokens produce unauthorized responses.

## Database and seed

The `users` table has a UUID primary key, unique email, and password hash column named `password`. No timestamps or additional account fields are added because they are outside the requested schema. The seed runs after migrations, is safe to run repeatedly, and never stores the plaintext password.

## Testing

Tests cover:

- User creation with valid normalized email and hashed-password value.
- Login success, missing user, wrong password, and token payload.
- Bcrypt hashing and comparison behavior.
- JWT signing and guard behavior for valid, missing, malformed, invalid, and expired tokens.
- Drizzle user repository persistence and unique-email behavior.
- Seed idempotency and the seeded admin credentials.
- E2E login and authentication of every existing route.

All test descriptions follow the repository convention: positive behavior uses `should be able to ...`, and negative behavior uses `should not be able to ...`.

## Consequences

The existing application API becomes authenticated immediately after this change, while the Swagger documentation routes remain publicly accessible. Existing clients must obtain a token through `POST /auth/login` and send it as a bearer token. A future role/permission model, refresh-token flow, account lifecycle, or token revocation mechanism is intentionally deferred.
