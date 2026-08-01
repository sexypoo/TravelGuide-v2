# T16 topic expiry

## Goal

Persist topic expiry instead of deriving it only at response time, and propagate
the committed state through the existing realtime update contract.

## Data and service

- Add `EXPIRED` to the PostgreSQL/Prisma `QuestionStatus` enum.
- Add `QuestionsService.expireDue(now)` that selects at most 100 due ids,
  conditionally updates each `OPEN` row in a transaction, reads its public
  payload, and publishes only after commit.
- Add a small lifecycle-managed `QuestionExpiryService`: run once at startup and
  every 60 seconds, skip automatic timers in tests, clear the timer on shutdown.

## Frontend

- Treat `room.question.updated` according to the payload status rather than
  assuming every update is a resolution.
- `RESOLVED` moves to the resolved cache; `EXPIRED` is removed from both list
  caches while detail remains updated.
- Use explicit screen-reader copy for expiration.

## Tests

- Backend: exact boundary, conditional race result, post-commit publish, no
  publish when another worker already changed the row.
- Frontend: cache removal for expired updates and status-specific handling where
  practical.
- Run Prisma generation, backend/frontend format, typecheck, tests, lint, build,
  migration deploy, and health checks.

## Risks

- An in-process timer is single-instance MVP infrastructure. Conditional DB
  updates make multiple instances safe but do not provide distributed job
  observability.
- At most 100 records expire per minute; this is well above pilot volume and
  bounds transaction work.
- Socket delivery stays best-effort; reconnect invalidation restores DB state.

