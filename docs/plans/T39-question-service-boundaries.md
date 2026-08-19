# T39 question service boundaries

## Goal

Replace the 600-line `QuestionsService` with responsibility-based application
services while preserving its observable behavior and transaction boundaries.

## Files

- `backend/src/questions/question-record.ts`: shared Prisma include and record
  types used by read, command, and expiry paths.
- `backend/src/questions/question-errors.ts`: common question-not-found Problem
  Details construction.
- `backend/src/questions/question-live-summary.ts` and existing tests: pure
  waiting/crowd observation aggregation.
- `backend/src/questions/question-query.service.ts`: list, detail, image access,
  response composition, and cursor parsing.
- `backend/src/questions/question-command.service.ts`: create/promote and
  accept/resolve mutations, advisory locks, compensation boundary, and
  post-commit realtime publication.
- `backend/src/questions/question-expiry.service.ts`: scheduling plus atomic due
  question transition and post-commit publication.
- Question controllers/module/tests: inject and test the narrower services.
- `backend/src/questions/questions.service.ts`: remove after all callers migrate.

## Migrations and dependencies

- No Prisma schema or migration change.
- No dependency or lockfile change.
- No REST, Socket, DTO, storage-key, cookie, or authorization contract change.

## Tests

1. Keep live-summary pure unit coverage against the extracted module.
2. Adapt image cleanup/access and expiry concurrency tests to the owning
   services.
3. Add focused command/query assertions only where the split could alter
   delegation or response composition.
4. Run backend `verify` with real PostgreSQL integration coverage.
5. Run the frontend critical-room Playwright suite against the real web, API,
   database, and Socket.io stack.

## Risks

- Moving `completeQuestion` must retain owner, open, expiry, and answer
  membership checks under the same advisory lock.
- The command service must publish only after Prisma transactions resolve.
- The query service must continue filtering private images and removed content
  before storage access.
- The expiry timer must remain disabled in tests and unref its interval in
  runtime.
- Unrelated presentation mockups remain untracked and must not be modified or
  staged.
