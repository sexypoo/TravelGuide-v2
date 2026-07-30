# T00 backend scaffold plan

## Goal and scope

Create only the reproducible NestJS backend foundation in `backend/`. The frontend is a separate Next.js project and is intentionally not created or modified in this backend-first pass. No auth, verification, destination, room, question, report, or admin product logic is included.

## Repository tree to create

```text
.github/workflows/backend-ci.yml
backend/
├── .dockerignore
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── .yarnrc.yml
├── Dockerfile
├── README.md
├── docker-compose.yml
├── eslint.config.mjs
├── jest.config.cjs
├── nest-cli.json
├── package.json
├── prisma/
│   ├── migrations/
│   │   └── <timestamp>_init_system_metadata/migration.sql
│   └── schema.prisma
├── src/
│   ├── app.module.ts
│   ├── config/environment.ts
│   ├── health/health.controller.spec.ts
│   ├── health/health.controller.ts
│   ├── health/health.module.ts
│   └── main.ts
├── test/
│   ├── health.e2e-spec.ts
│   ├── jest-e2e.json
│   └── setup-env.ts
├── tsconfig.build.json
├── tsconfig.json
├── yarn.lock
```

The root `docs/plans/T00-scaffold.md` and `docs/DECISIONS.md` are documentation required by repository policy. The root backend CI workflow is required for GitHub Actions discovery; all application code and runtime infrastructure remain inside `backend/`.

## Versions and package configuration

- Node.js `20.x`; package manager `yarn@4.2.2`; Yarn `nodeLinker: node-modules`.
- NestJS `11.x`, TypeScript `5.8.3`, Prisma and Prisma Client `5.22.0`.
- Runtime support: `@nestjs/config`, `class-transformer`, `class-validator`, `reflect-metadata`, and `rxjs`.
- Jest/Supertest baseline for unit and API integration tests; ESLint flat config and Prettier for quality checks.
- `backend/` is an independent private package. This preserves the requested frontend/backend separation instead of introducing the documented `apps/*` workspace layout.

## Commands

Run from `backend/`:

```bash
corepack enable
yarn install
yarn db:up
yarn db:migrate
yarn db:seed
yarn dev
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn test:integration
yarn build
yarn verify
yarn db:down
```

`verify` runs lint, formatting validation, typecheck, unit tests, integration tests, Prisma schema validation, and build. `db:seed` is a successful no-op during T00 because product seed data starts in a later task.

## Environment variables

- `NODE_ENV`: `development`, `test`, or `production`.
- `DATABASE_URL`: PostgreSQL connection URL; required and protocol-validated.
- `API_PORT`: integer TCP port, default `3001`.
- `WEB_ORIGIN`: absolute HTTP(S) URL reserved for the separated frontend, default `http://localhost:3000`.
- `JWT_SECRET`, `JWT_EXPIRES_IN`, storage and S3 variables remain documented for later tasks but are not required by the T00 runtime because auth and storage are out of scope.

Startup validation rejects invalid required values without printing secrets. Production-only JWT rules will be added when JWT is introduced in T01.

## Docker and PostgreSQL

- Docker Compose uses `postgres:16-alpine`, a named volume, a database health check, and port `5432`.
- Prisma uses PostgreSQL and contains one infrastructure-only `SystemMetadata` model so generation, connection, and migration can be proven without introducing a product model.
- `db:migrate` runs `prisma migrate dev`; `db:validate` proves that configuration and schema parse correctly.

## Tests and CI

- Unit test: health controller returns the live response DTO.
- Integration test: a real Nest HTTP server returns `200` from `/api/v1/health/live`.
- CI runs on changes to `backend/**`, installs with the immutable lockfile, starts PostgreSQL 16, validates Prisma, then runs `yarn verify`.
- Local validation will run install, lint, formatting, typecheck, tests, integration tests, Prisma validation, and build. Docker/database commands will be run when Docker is available.

## Files modified outside `backend/`

- `.github/workflows/backend-ci.yml`: repository-level discovery point that runs only backend commands.
- `docs/plans/T00-scaffold.md`: required pre-implementation plan.
- `docs/DECISIONS.md`: records the user-directed separated repository layout.

## Risks and validation

- The backend-first layout deviates from the original `apps/api` monorepo diagram. Record the explicit decision and keep frontend code absent.
- Docker may be unavailable in the execution environment. Check availability and report database commands exactly; do not claim success if unavailable.
- Dependency resolution may expose peer incompatibilities. Use pinned fixed-stack versions and an immutable lockfile, then validate through clean install and all quality commands.
- The initial Prisma migration contains only `SystemMetadata`; inspect the generated SQL to ensure no product table appears prematurely.
- The connectivity page belongs to frontend T00 and is deferred because this pass is backend-only. API connectivity is proven through the live health integration test.
