# TravelGuide v2 (여쭈어)

여행이 틀어지는 순간 인증된 현지인에게 묻는 여행지 실시간 도움방. Next.js
웹(`frontend/`) + NestJS API(`backend/`) 모듈러 모놀리스. `main` 머지는 곧
프로덕션 배포다 (웹 Vercel https://www.travelguide.kr, API Railway).

## Docs: read what the task needs

| Read | When |
| --- | --- |
| `docs/PRODUCT.md` | Always. Current scope, what we don't build, priorities. Wins on scope. |
| `docs/MVP_FUNCTIONAL_SPEC.md` | The requirement IDs you touch (e.g. `VER-001`), via grep. Wins on detailed behavior. |
| `docs/ACCEPTANCE_TESTS.md` | The scenarios for the flow you change. |
| `docs/ARCHITECTURE.md` | Backend modules, auth, realtime, storage changes. |
| `docs/DECISIONS.md` | Before changing a past decision; add an ADR when you make one. |
| `docs/plans/31-redesign.md`, ADR-050 | UI work: tokens in `frontend/src/styles/tokens.css`, primitives in `frontend/src/components/ui/`, one CSS Module per component. No global CSS. |
| `docs/AUTOPILOT.md` | Only when running as the autopilot team. |

`docs/archive/` and `tasks/` are history. Don't follow them as instructions.

## How work flows

A GitHub issue is the task. Size the process to the change:

- **Small** — one concern, no schema/auth/contract change, roughly ≤ 200
  lines. Issue → branch → PR. The PR body holds the plan (goal, files,
  tests, risks) and `Closes #n`.
- **Large** — Prisma schema or migration, auth, `RoomAccessService`,
  realtime event contract, a new dependency, or several screens. Write
  `docs/plans/<issue#>-<slug>.md` (goal, files, migrations, tests, risks)
  before coding, and an ADR in `docs/DECISIONS.md` for any real decision.

Branches: `<type>/<issue#>-<slug>` (`feat`, `fix`, `design`, `refactor`,
`chore`, `docs`); autopilot uses `autopilot/<issue#>-<slug>`. Commits use the
conventional style already in `git log`. One issue per PR; no drive-by
refactors. Stop when the issue is done and report changed files, commands
run with results, and remaining risks.

## Fixed stack

Node.js 24.x · Yarn 4.2.2 (`nodeLinker: node-modules`, via Corepack) ·
Next.js 15.5.x · React 19.1 · TypeScript 5.8 · Tailwind 3.4 · NestJS 11 ·
Prisma 5.22 + PostgreSQL 16 · Socket.io 4 · Jest/Supertest · Playwright.

Don't upgrade pinned versions or add production dependencies without saying
why in the plan.

## Architecture rules

- All writes use REST. Socket.io broadcasts committed changes only.
- Authorization is enforced in the API and on Socket room join, never only
  in the UI. REST and Socket share one `RoomAccessService`.
- Thin controllers; business rules in services. No repository layer until it
  removes real duplication.
- Prisma migrations only. Never `prisma db push` against production.
- Evidence files live in private storage, never as Base64 in PostgreSQL.
- JWT lives in an httpOnly cookie, never localStorage.

## Code rules

- Strict TypeScript. No `any`, `@ts-ignore`, or unsafe double assertions.
- No hardcoded secrets, user IDs, passwords, API origins, or endpoints.
- No fake delays, placeholder success, or mock APIs in product flows.
- No `console.log` in production code; use the project logger.
- Never render user input as HTML. Validate all external input at runtime.
- Public responses use explicit DTOs, never raw Prisma objects.
- Keep API names and enum values consistent with the spec.
- Every async screen has loading, empty, success, and error states.
- UI copy is Korean, plain, and friendly. No raw enum values or decorative
  English labels in the UI.

## Commands

There is no root `package.json`. Run commands inside `frontend/` or
`backend/`.

```bash
yarn lint && yarn typecheck && yarn test && yarn build   # either app
yarn verify             # either app: what CI runs
yarn test:integration   # backend, needs PostgreSQL
yarn test:e2e           # frontend, needs PostgreSQL; starts API + web itself
```

Local PostgreSQL and E2E setup on this Mac: see the `local-stack` skill.
Format with `yarn format` before linting if `format:check` fails.

Never claim a command passed unless you ran it. Say which ones you didn't
run and why.

## Testing rules

- Backend integration tests use a real PostgreSQL test database.
- E2E uses the real web, API, database, and Socket.io. No fixed browser mocks
  for API calls.
- UI work: check 390x844 and 1440x900.
- Bug fixes get a regression test when practical.

## Review priorities

1. Authorization bypasses
2. Private evidence or GPS exposure
3. Invalid state transitions and races
4. Socket duplicate/reconnect bugs
5. Upload and orphan-file handling
6. Broken mobile flows
7. Scope creep and unnecessary dependencies

## Deployment facts

- Health: `/api/v1/health/live` and `/api/v1/health/ready` on the Railway API.
- Deploy status: `gh api repos/sexypoo/TravelGuide-v2/deployments`.
- Details: `docs/DEPLOYMENT.md`.
