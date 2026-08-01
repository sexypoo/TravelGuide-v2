# T10 full integration and browser QA

## Goal

Add a repeatable real-stack browser gate around the already implemented MVP,
without product changes or network response mocking.

## Environment

- Dedicated PostgreSQL database from `TEST_DATABASE_URL`.
- NestJS on `127.0.0.1:3101`, Next.js on `127.0.0.1:3100`.
- Backend-owned deterministic E2E fixture creates traveler, local A, local B,
  admin, and valid Jeju verifications with test-only credentials.
- Playwright launches isolated browser contexts; all writes hit the real API and
  Socket.io server.

## Automated coverage

- UI login and protected room navigation.
- Traveler REST topic creation observed live by a local context.
- Local answer observed on the traveler's detail page.
- Offline/online reconnect followed by REST refetch of a missed answer.
- Mobile 390x844 horizontal-overflow and composer visibility assertions.
- Desktop 1440x900 room workspace assertion.

## Commands

- `TEST_DATABASE_URL=... yarn test:e2e`
- backend `TEST_DATABASE_URL=... yarn verify`
- frontend `yarn verify`

Both `verify` commands enforce their coverage thresholds. Backend coverage merges
unit and PostgreSQL integration instrumentation before evaluating the global gate.

## Risks and manual checks

- Browser binaries are environment-owned and may be unavailable; do not mark
  browser scenarios passed without an actual run.
- HTTPS cookie, GPS permission on physical devices, production WebSocket upgrade,
  and Safari remain T11/manual deployment checks.
- Existing PostgreSQL integration suites remain the authority for administrator
  approval/moderation races and private evidence access.
