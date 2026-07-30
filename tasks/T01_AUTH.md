# T01 — User model and cookie authentication

## Goal

Implement a complete real auth vertical slice: register, login, logout, and current user.

## Read first

- AUTH-001 through AUTH-003
- SYS-002
- Architecture section 6
- E2E-001 and E2E-002

## Required work

- Prisma `User` model and migration
- UserRole enum USER/ADMIN
- Email normalization and unique handling
- bcrypt hashing, cost 12+
- JWT in `tg_access` httpOnly cookie
- Register, login, logout, me API
- JWT guard, current-user decorator, admin guard foundation
- Global validation, Problem Details exception shape, requestId if not finished in T00
- Web register/login pages and authenticated shell
- API client with credentials included
- Route UX for expired or missing auth
- Real integration tests against PostgreSQL

## Constraints

- No localStorage/sessionStorage token.
- No refresh token in P0.
- No default admin credentials in source.
- Never expose passwordHash or token in JSON/logs.
- Do not begin profile, destination, or verification work.

## Acceptance

- E2E-001, E2E-002 behavior
- General user cannot access an AdminGuard test route
- Cookie settings differ safely between development and production
- Duplicate race returns stable 409 codes

## Commands

Run relevant commands plus:

```bash
yarn test:integration
yarn lint
yarn typecheck
yarn build
```

