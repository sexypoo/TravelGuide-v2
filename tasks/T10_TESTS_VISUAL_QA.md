# T10 — Full integration, Playwright E2E, and visual QA

## Goal

Turn the implemented product into a repeatably verified MVP.

## Read first

- Entire `docs/ACCEPTANCE_TESTS.md`
- Testing section 15
- Final presentation checklist

## Required work

- Complete PostgreSQL integration tests
- Playwright setup against real web/API/test DB
- Seed/reset helpers for tests
- Multi-browser-context traveler/localA/localB scenario
- Socket disconnect/reconnect scenario
- Admin approval and moderation scenario
- Mobile 390x844 and desktop 1440x900 checks
- Long text, empty state, API failure, locked state checks
- Coverage report and gates
- Remove flakiness and fixed sleeps; wait on observable conditions
- Self-review all P0 acceptance IDs

## Constraints

- No network route mocking for P0.
- Do not weaken assertions to make tests pass.
- Do not skip failing tests without a documented blocker and owner.
- Do not add new product functionality.

## Acceptance

- Critical E2E passes three consecutive runs.
- `yarn verify` and `yarn test:e2e` pass.
- Visual review records routes and viewports checked.
- Remaining manual-only checks are explicit and small.

