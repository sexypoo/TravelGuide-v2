# T05 backend room feed and question plan

## Goal and scope

Implement only backend T05 in `backend/`: Question persistence, authenticated room feed, traveler-only creation, question detail, deterministic cursor pagination, expiry derivation, and concurrency-safe open-question limits. Do not modify `frontend/`, create Answer/Socket code, or add edit/delete behavior.

## Previous-task verification

- Backend T03 is committed as `768c317`; Frontend T02/T04 is committed as `efa39cc`.
- The worktree is clean before T05.
- T03's exported `RoomAccessService` is database-backed and remains the single authorization source for metadata, REST content reads, question creation, and future Socket joins.

## Data model and migration

Add `QuestionCategory` (`WEATHER`, `TRANSPORT`, `FOOD`, `PLACE`, `SAFETY`, `OTHER`), `QuestionUrgency` (`NORMAL`, `URGENT`), and `QuestionStatus` (`OPEN`, `RESOLVED`, `REMOVED`).

Add `Question` with room/author relations; validated plain-text content and optional area; status; nullable future `acceptedAnswerId`; expiry/resolution/removal audit fields; timestamps; and the specified indexes. `acceptedAnswerId` remains a nullable unique scalar until T06 adds the Answer relation, avoiding an out-of-scope model.

## APIs

All endpoints require `JwtAuthGuard`:

```text
GET  /api/v1/rooms/:slug/questions?status=OPEN&cursor=&limit=20
POST /api/v1/rooms/:slug/questions
GET  /api/v1/questions/:questionId
```

List responses use `{ items, nextCursor }`. The opaque Base64URL cursor encodes the last `createdAt` and `id`; queries order both fields descending and apply the matching lexicographic boundary. Limits default to 20 and allow 1–50.

The list/detail public DTO contains explicit author `{ id, nickname, badge: VERIFIED_TRAVELER }`, content, category, urgency, optional area, derived status, fixed safety notice for `SAFETY`, `answerCount: 0`, expiry, and timestamps. It never serializes Prisma records, verification/GPS/evidence data, email, bio, or role. There is no `answers` array until the real Answer model exists in T06.

## Authorization and domain rules

- Room feed/detail require `RoomAccessService.assertCanViewContent` for the question's destination.
- Creation requires a new shared `assertCanAskQuestion`; local-only, unverified, expired traveler, and admin-without-traveler capability receive 403 `TRAVELER_VERIFICATION_REQUIRED`.
- Trim content/area; content is 20–1000 characters and area is optional/0–60. Preserve it as plain text and never interpret/sanitize it into HTML.
- Set one service `now` explicitly as both `createdAt` and the basis for `expiresAt = now + 24h`.
- Public status derives `EXPIRED` when the stored status is `OPEN` and `expiresAt <= now`; storage remains `OPEN` so T06 can reject expired answers with a precise rule.
- Before counting/creating, a PostgreSQL transaction obtains `pg_advisory_xact_lock(hashtext(userId || ':' || roomId))`. This serializes same-author/same-room submissions and guarantees at most three non-expired OPEN questions under concurrent requests.

## Service boundary

Export `QuestionsService` from `QuestionsModule`. It owns committed question creation and public DTO mapping. T06 can inject its realtime publisher after the successful create without duplicating writes. T05 intentionally publishes no no-op/fake Socket event.

## Tests

Unit tests cover cursor encode/decode, derived expiry at the exact boundary, removed-content hiding, and Safety notice mapping.

Real PostgreSQL integration tests cover:

- E2E-011 valid traveler create, exact 24-hour expiry, feed/detail author badge;
- E2E-012 local-only and expired-traveler create denial;
- E2E-013 fourth active question conflict, including concurrent creation safety;
- E2E-022 expired OPEN status in list/detail;
- read access denial, status filtering, deterministic same-timestamp pagination, invalid cursor/limit;
- plain-text `<script>` input remains JSON text and no private author/verification fields leak.

## Files and commands

- Update Prisma schema and add one T05 migration.
- Extend `RoomAccessService`; add `questions/` DTOs, cursor utility, service/controller/module, app composition, README, tests, and a focused decision record.
- Update T03/T02 tests only where the expanded shared service requires truthful expectations.

Run from `backend/` under Node 20 for Prisma/PostgreSQL:

```bash
yarn db:generate
yarn format
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn test:integration
yarn db:validate
yarn build
yarn verify
```

## Risks and review

- Cursor gaps/duplicates: compound descending comparison and an index including `createdAt,id`; test identical timestamps.
- Limit races: transaction-scoped advisory lock and real concurrent integration test.
- Time boundaries: inject one `now`; use `expiresAt <= now` as expired.
- Authorization drift: all reads/creates resolve the room destination and call the same RoomAccessService.
- Private leakage: explicit nested selects/mappers plus serialized-response assertions.
- Scope creep: no Answer, Socket, edit, delete, accept, or resolve endpoint in T05.
