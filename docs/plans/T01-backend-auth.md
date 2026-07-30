# T01 backend authentication plan

## Goal and scope

Implement the backend half of T01 only in `backend/`: real user persistence, registration, login, logout, current-user lookup, cookie JWT authentication, an admin guard foundation, consistent Problem Details, and request IDs. Do not modify `frontend/` and do not begin profile, destination, verification, room, question, or admin product features.

## Previous-task verification

- Backend T00 commit: `e4b1903`.
- Frontend T00 commit: `5e8ac87`.
- The working tree is clean and `main` matches `origin/main` before T01 edits.
- Existing backend health tests, strict TypeScript configuration, Docker PostgreSQL, Prisma, and CI are retained.

## API contract

All routes remain under `/api/v1`.

```text
POST /auth/register  -> 201, public current-user DTO, Set-Cookie
POST /auth/login     -> 200, public current-user DTO, Set-Cookie
POST /auth/logout    -> 204, expired Set-Cookie
GET  /auth/me        -> 200 public current-user DTO or 401
```

Registration input:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "제주여행자",
  "termsAgreed": true
}
```

The response explicitly contains `id`, normalized `email`, `nickname`, `role`, `isAdmin`, `createdAt`, and a currently-empty verification summary. It never contains `passwordHash` or a JWT.

## Files and modules

- Extend `prisma/schema.prisma` with `UserRole` and `User`; add a new migration without editing T00 migration history.
- Add `src/prisma/` module/service for Prisma lifecycle management.
- Add `src/users/` module/service for user lookup and creation; no repository abstraction.
- Add `src/auth/` DTOs, public response mapper, service, controller, JWT strategy, guards, current-user decorator, and cookie options helper.
- Add `src/common/` request-ID middleware, Problem Details exception/filter, request typing helpers, and shared app configuration.
- Update environment validation, app module, bootstrap, package dependencies, README, Docker Compose test-database initialization, and backend CI.
- Replace the health-only integration test with an application harness plus health/auth integration coverage while retaining the health assertion.

## Data model and migration

```text
User
- id: cuid primary key
- email: normalized lowercase, unique, varchar(320)
- passwordHash: bcrypt result, never selected for public DTOs
- nickname: trimmed, unique, varchar(20)
- role: UserRole USER/ADMIN, default USER
- createdAt / updatedAt: UTC timestamps
```

The initial `SystemMetadata` model remains unchanged. PostgreSQL uniqueness is the final race-safe authority. The service performs a friendly pre-check and maps Prisma `P2002` targets to stable `EMAIL_ALREADY_EXISTS` or `NICKNAME_ALREADY_EXISTS` responses.

## Authentication and cookie security

- Normalize email using trim + lowercase before validation and storage.
- Validate password length 10–72 with at least one ASCII letter and one digit; bcrypt cost is fixed at 12.
- JWT payload contains only `sub` and `role`; the strategy loads the user from PostgreSQL on every request so role revocation takes effect without trusting stale profile data.
- Cookie name `tg_access`; `httpOnly`, `sameSite=lax`, `path=/`, max age aligned with JWT expiry; `secure` only in production.
- No refresh token and no token in response JSON, localStorage, sessionStorage, URL, or logs.
- `JWT_SECRET` and `JWT_EXPIRES_IN` become required. Production rejects `change-me`; expiry accepts bounded `s`, `m`, `h`, or `d` notation.

## Common API behavior

- A middleware creates an opaque request ID for every request and returns it in `X-Request-Id`.
- A global exception filter emits `{type,title,status,code,detail,requestId}` without leaking stack traces, secrets, request bodies, or Prisma data.
- DTO validation failures use `VALIDATION_FAILED`; auth and duplicate conditions use stable explicit codes.
- Controllers only bind transport and cookies; business logic remains in services.

## Dependencies

Add the fixed-stack authentication packages only:

- Runtime: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `cookie-parser`, `bcrypt`.
- Development types: `@types/bcrypt`, `@types/cookie-parser`, `@types/passport-jwt`.

These packages implement the architecture-mandated JWT/passport/cookie/bcrypt stack. No alternative auth framework or production dependency is introduced.

## Integration test database

- Add `TEST_DATABASE_URL` to `.env.example`.
- A PostgreSQL initialization SQL file creates `travelguide_test` for clean Docker volumes.
- The integration preparation script loads the test URL and runs `prisma migrate deploy` before Jest, then tests clean the `User` table before and after the suite.
- CI points both migration preparation and the application at the isolated `travelguide_test` service database.

## Tests

Real PostgreSQL integration coverage:

- health endpoint and request ID;
- registration normalizes email, sets safe development/test cookie, and exposes no private data;
- `/auth/me` succeeds with the cookie;
- logout clears the cookie and subsequent `/auth/me` returns 401 Problem Details;
- login recreates a valid cookie;
- duplicate email and nickname return distinct stable 409 codes;
- invalid input returns 400 Problem Details with matching response/body request IDs;
- a regular user is denied by an AdminGuard-protected test-only controller;
- an actual ADMIN DB role can pass the same guard;
- production cookie options include `Secure`, while development/test options do not.

Unit tests cover normalization/response helpers and cookie-option environment differences where useful. No production-only test bypass is added.

## Commands

Run from `backend/`:

```bash
corepack yarn install
yarn db:up
yarn db:generate
yarn db:migrate --name add_user_auth
yarn db:seed
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn test:integration
yarn build
yarn verify
docker build -t travelguide-backend:t01 .
```

Because the host Node is not the fixed Node 20 runtime, migration and production-image validation will also run in Node 20 Docker where required.

## Risks and validation

- Native bcrypt compatibility: pin a Node 20-compatible release and prove install, hashing, tests, and Docker build under Node 20.
- Duplicate races: do not rely only on pre-checks; integration-test the stable Prisma unique-error mapping.
- Cookie mismatch: construct set/clear options from one helper and assert flags in tests.
- JWT/user leakage: search public DTOs and serialized integration responses for `passwordHash`, token fields, and cookie values.
- Request-ID/filter ordering: assert both success headers and error body/header equality.
- Test isolation: use `travelguide_test`, migrate it before tests, and never truncate the development database.
- Admin staleness: JWT strategy reloads the current DB role; the guard never trusts client input.
- Frontend T01 remains intentionally unimplemented until separately requested.
