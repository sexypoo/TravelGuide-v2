# T00 — Greenfield repository scaffold

## Goal

Create the reproducible monorepo foundation only. Do not implement product features.

## Read first

- `AGENTS.md`
- `docs/ARCHITECTURE.md` sections 2, 3, 11, 12
- `docs/MVP_FUNCTIONAL_SPEC.md` SYS-001, SYS-002

## Required work

- Root Yarn 4.2.2 workspace with `nodeLinker: node-modules`
- `apps/web`: Next.js 15.5.2, React 19.1.1, TypeScript strict, Tailwind 3.4.1
- `apps/api`: NestJS 11, TypeScript strict
- `packages/contracts`, `packages/config`
- PostgreSQL 16 Docker Compose
- Prisma setup and connection, but only the minimum scaffold schema
- Root scripts from architecture document
- `.env.example` and startup environment validation
- ESLint, formatting, typecheck, Jest baseline
- GitHub Actions baseline
- README with exact setup and troubleshooting
- Health live endpoint sufficient to prove API is running
- Web page that proves API connectivity without product logic

## Constraints

- Do not copy legacy source.
- Do not add auth, verification, room, question, or admin models.
- Do not install a component library.
- Do not use Turborepo unless a clear, documented need exists.
- Keep the lockfile committed.

## Done when

- A clean clone can run with documented commands.
- `yarn install`, `yarn db:up`, `yarn dev`, `yarn lint`, `yarn typecheck`, `yarn test`, and `yarn build` succeed.
- CI uses the same commands.
- The plan and final report list every command actually run.

