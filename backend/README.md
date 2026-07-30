# TravelGuide backend

NestJS API scaffold for TravelGuide v2. Product features start in later tasks.

## Prerequisites

- Node.js 20.x
- Corepack
- Docker Desktop with Docker Compose

## First setup

Run all commands from this `backend/` directory.

```bash
corepack enable
cp .env.example .env
yarn install
yarn db:up
yarn db:migrate
yarn db:seed
yarn dev
```

The API listens on `http://localhost:3001`. Confirm it with:

```bash
curl http://localhost:3001/api/v1/health/live
```

The response includes `status: "ok"` and an ISO 8601 UTC timestamp. Stop the
database with `yarn db:down`.

## Quality commands

```bash
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn test:integration
yarn build
yarn verify
```

`yarn verify` runs all backend quality checks, Prisma schema validation, and the
production build. Integration tests boot a real Nest HTTP server. Product-level
database integration tests will use PostgreSQL once models are introduced.

## Database commands

```bash
yarn db:up
yarn db:validate
yarn db:generate
yarn db:migrate
yarn db:seed
yarn db:deploy
yarn db:down
```

T00 contains only an infrastructure `SystemMetadata` model so Prisma generation,
connection, and migrations can be proven end to end. Product models begin in
later tasks.

## Environment

Copy `.env.example` to `.env`. Startup fails immediately when `DATABASE_URL`,
`API_PORT`, or `WEB_ORIGIN` is invalid. Do not commit `.env` or real secrets.
JWT and storage variables are documented now but become runtime requirements only
when those features are implemented.

## Troubleshooting

- If Yarn reports version 1.x, use `corepack yarn --version` and confirm it prints
  `4.2.2`. Node 20 installations normally include Corepack.
- If port 5432 is occupied, change `POSTGRES_PORT` and update the port in
  `DATABASE_URL` to match.
- If the database is unhealthy, inspect it with `docker compose ps` and
  `docker compose logs postgres`.
- If Prisma cannot connect, confirm the container is healthy and `.env` uses
  `localhost` when commands run on the host.
- Delete `node_modules` only as a last resort; first rerun `yarn install --immutable`
  so the committed lockfile remains the source of truth.
