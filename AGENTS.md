# TravelGuide v2 — Codex repository instructions

## Source of truth

Read these before work, in order:

1. `docs/MVP_FUNCTIONAL_SPEC.md`
2. `docs/ACCEPTANCE_TESTS.md`
3. `docs/ARCHITECTURE.md`
4. `docs/EXECUTION_PLAN.md`
5. the active file in `tasks/`

If documents conflict, `MVP_FUNCTIONAL_SPEC.md` wins. Do not invent features outside P0/P1 scope.

## Working agreement

- This is a greenfield repository. Do not copy the legacy MVP wholesale.
- Work on one Task ID at a time.
- Before editing, inspect the repository and write `docs/plans/Txx-*.md` with goal, files, migrations, tests, and risks.
- Keep changes reviewable. Do not combine unrelated refactors.
- Stop after the active Task is complete and report changed files, commands, tests, and remaining risks.
- Record meaningful assumptions or deviations in `docs/DECISIONS.md`.
- Use subagents only for independent directories or reviews. Never let parallel agents edit Prisma schema, migrations, shared contracts, auth, or `RoomAccessService` at the same time.

## Fixed stack

- Node.js 20.x
- Yarn 4.2.2 with `nodeLinker: node-modules`
- Next.js 15.5.2, React 19.1.1, TypeScript 5.8.3
- Tailwind CSS 3.4.1
- NestJS 11.x
- Prisma 5.22.0 and PostgreSQL 16
- Socket.io 4.x
- Jest/Supertest and Playwright

Do not upgrade pinned versions or add production dependencies without explaining why in the plan.

## Architecture rules

- Modular monolith: one Next.js web app and one NestJS API.
- All writes use REST. Socket.io broadcasts committed changes only.
- Authorization is enforced on the API and Socket room join, never only in the UI.
- Reuse the same `RoomAccessService` for REST and Socket authorization.
- Keep controllers thin and business rules in services.
- Do not add repository abstractions until they remove real duplication.
- Use Prisma migrations. Never use `prisma db push` in production.
- Store evidence files privately; never as Base64 in PostgreSQL.
- JWT goes in an httpOnly cookie, never localStorage.

## Code rules

- TypeScript strict mode. Do not use `any`, `@ts-ignore`, or unsafe double assertions.
- No hardcoded secrets, user IDs, admin passwords, API origins, or production endpoints.
- No fake delays, placeholder success responses, or mock APIs in P0 flows.
- No `console.log` in production code. Use the project logger.
- Do not render user input as HTML.
- Validate all external input at runtime.
- Use explicit DTOs for public responses; never return raw Prisma objects containing private fields.
- Prefer small named functions and components. Split files when responsibilities diverge, not by arbitrary line count.
- Keep public API names and enum values consistent with the spec.

## Testing rules

- P0 backend integration tests use a real PostgreSQL test database.
- P0 E2E uses the real web, API, database, and Socket.io.
- Do not intercept P0 API calls with fixed browser mocks.
- For UI work, verify 390x844 and 1440x900 with Playwright.
- Every bug fix needs a regression test when practical.

## Required commands

Use the commands available for the current Task. Before final completion of a Task, run the relevant subset and report exact results:

```bash
yarn lint
yarn typecheck
yarn test
yarn test:integration
yarn test:e2e
yarn build
yarn verify
```

Do not claim a command passed unless it was actually run.

## Definition of done

A feature is not done until:

- real UI, API, database, validation, and authorization are connected;
- loading, empty, success, and error states exist;
- relevant tests pass;
- lint, typecheck, and build pass for affected apps;
- no secret or private verification/GPS data is exposed;
- docs and migrations are updated;
- no TODO or stub remains in the P0 path.

## Review rules

During review, prioritize:

1. authorization bypasses;
2. private evidence or GPS exposure;
3. invalid state transitions and race conditions;
4. Socket duplicate/reconnect bugs;
5. upload and orphan-file handling;
6. broken mobile flows;
7. scope creep and unnecessary dependencies.

