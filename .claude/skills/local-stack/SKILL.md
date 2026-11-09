---
name: local-stack
description: Run TravelGuide's PostgreSQL, backend integration tests, Playwright E2E, or the full web+API stack locally. Use before `yarn test:integration`, `yarn test:e2e`, or checking a UI change in a real browser.
---

# Local stack

## PostgreSQL

The project database runs in Docker from `backend/docker-compose.yml`
(PostgreSQL 16, user/password/db `travelguide` by default).

On the owner's Mac Homebrew PostgreSQL holds port 5432 and, since 2026-11,
also 5433; neither has the `travelguide` role, so those URLs fail with Prisma
`P1010`. Check with `lsof -nP -iTCP:5434 -sTCP:LISTEN` and run the project
database on a free port (5434 below) without editing any file:

```bash
docker info >/dev/null 2>&1 || open -a Docker   # then wait for the daemon
cd backend && POSTGRES_PORT=5434 docker compose up -d --wait
```

Then load `backend/.env` and point both URLs at 5434 in the same shell:

```bash
set -a && . ../backend/.env && set +a
export TEST_DATABASE_URL=${TEST_DATABASE_URL/localhost:5432/localhost:5434}
export DATABASE_URL=${DATABASE_URL/localhost:5432/localhost:5434}
```

Never print the contents of `.env` files.

## Backend integration tests

From `backend/` with the variables above:

```bash
yarn test:integration
```

It prepares the test database itself (`test/prepare-integration.ts`).

## Playwright E2E

From `frontend/` with the variables above:

```bash
corepack yarn playwright test            # all specs
corepack yarn playwright test e2e/x.spec.ts
```

Playwright starts the API on 3101 and the web app on 3100 itself
(`frontend/playwright.config.ts`); don't start them yourself.

Don't build the frontend in a shell that loaded `backend/.env`: its
`NODE_ENV=test` breaks `next build`. Use `env -u NODE_ENV corepack yarn verify`.

The dev server rewrites `frontend/next-env.d.ts`. Restore it afterwards:

```bash
git checkout frontend/next-env.d.ts
```

## Checking UI by hand

Check every UI change at 390x844 and 1440x900. Playwright specs can set the
viewport; for manual checks use the in-app browser against a running dev
stack, and stop any server you started when you're done.

## Clean up

```bash
cd backend && docker compose down
```
