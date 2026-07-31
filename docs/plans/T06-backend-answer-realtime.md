# T06 backend answers and realtime plan

## Goal and scope

Implement only backend T06: persisted local answers, question detail answers, post-commit question/answer Socket.io events, authenticated room join/leave, and real PostgreSQL/socket integration tests. Do not modify `frontend/`, implement accept/resolve/reporting, or add Socket writes, presence, typing, receipts, or notifications.

## Previous-task verification

- Backend T05 is committed as `8e6d3d1` after its Node 20 `yarn verify` passed.
- T05 exports `QuestionsService`, uses `RoomAccessService` for REST authorization, and returns explicit public DTOs. T06 will extend those boundaries rather than duplicate question writes or expose Prisma records.

## Dependencies and transport contract

Add pinned NestJS 11 Socket.io integration packages and Socket.io 4.x. Add `socket.io-client` only as a development dependency for integration tests and a direct cookie parser dependency for handshake cookies. Use the default namespace and default `/socket.io` path, with credentialed CORS restricted to `WEB_ORIGIN`.

Socket connections authenticate the existing `tg_access` JWT from the handshake cookie. A shared auth service verifies the token and reloads the user from PostgreSQL. `room.join { roomSlug }` resolves the server-owned room id and checks `RoomAccessService`; the client never supplies or controls an internal room id. `room.leave` only removes that socket from the resolved internal room. No Socket handler mutates product data.

## Data model and REST API

Add `AnswerSourceType` (`ON_SITE_NOW`, `RECENT_EXPERIENCE`, `OFFICIAL_SOURCE`, `PERSONAL_OPINION`) and `Answer` with question/author/remover relations, content, optional source URL, removal audit fields, timestamps, and the required question/author indexes. Complete `Question.acceptedAnswerId` as a nullable unique foreign key without implementing acceptance until T08.

Add:

```text
POST /api/v1/questions/:questionId/answers
```

Content is trimmed plain text of 10–1000 characters. `OFFICIAL_SOURCE` requires a syntactically valid `https:` URL; missing and non-HTTPS/invalid URLs produce `SOURCE_URL_REQUIRED` and `INVALID_SOURCE_URL`. Other source types store no URL.

Creation resolves the question and destination, requires a currently valid approved local verification, rejects the question author, and rejects non-OPEN, removed, resolved, or `expiresAt <= now` questions. A transaction-scoped PostgreSQL advisory lock keyed by answer author/question serializes count/create and enforces at most three non-removed answers per local per question.

## Public DTOs and REST truth

Add an explicit answer DTO with author `{ id, nickname, badge: VERIFIED_LOCAL, verifiedAt }`, text-only content, source fields, and timestamps. The verified date comes from the approved local verification for that destination and no evidence, exact GPS, email, role, or raw record is exposed.

Question list responses gain a real non-removed `answerCount`. Question detail returns `{ ...question, answers }`, ordered by `createdAt ASC, id ASC`. REST remains authoritative after reconnect; the socket event is only an immediate cache hint.

## Realtime publication

Create one `RealtimePublisher` attached to one gateway/server. Internal rooms use `destination-room:{destinationRoomId}`. Events have `{ eventId, roomSlug, occurredAt, payload }`, where the payload is the same public question or answer DTO returned by REST.

`QuestionsService` and `AnswersService` publish only after their database transaction/create promise has committed. Publishing failures are logged and do not roll back a committed REST write. Failed validation, authorization, limit checks, or database writes never invoke the publisher. Entity ids allow clients to deduplicate repeated events.

Events implemented in T06:

```text
room.question.created
room.answer.created
```

`room.question.updated` and `room.content.removed` remain for T08/T09.

## Tests and verification

Unit tests cover source URL rules, answer public mapping, socket cookie/session rejection, room key/event envelope behavior, and post-commit publisher ordering/failure isolation where practical.

Real PostgreSQL and real Socket.io client integration tests cover E2E-014 through E2E-018:

- valid local answer persistence, badge, answer count, and detail ordering;
- missing/http/invalid official source rejection and successful HTTPS source;
- unverified/traveler-only/local-expired denial, own-question denial, expired/resolved question denial;
- three-answer limit including concurrent requests;
- unauthorized Socket connection/join rejection and server-side slug-to-room resolution;
- two subscribed clients receive each committed question/answer event once with public DTOs and stable entity ids;
- failed REST writes produce no event;
- disconnect/missed event/reconnect/rejoin followed by REST detail recovers the answer.

Run Node 20 with the real PostgreSQL test database:

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

- Authentication drift: token verification and user reload live in shared auth code; joins additionally use the shared room access service.
- Broadcast-before-commit: publisher calls occur after awaited persistence and are tested against failed writes.
- Listener duplication: the gateway registers its authentication middleware once during adapter initialization; tests count events rather than only checking presence.
- Namespace/path/CORS mismatch: keep one default namespace/path and configure the same `WEB_ORIGIN`/credentials contract as HTTP.
- Answer race: advisory locking protects the per-author/question count under concurrent REST calls.
- Private leakage: map selected fields into public DTOs and assert serialized responses/events exclude verification evidence, GPS, email, bio, and role.
- Reconnect gaps: no replay log is invented; clients rejoin and refetch REST, which integration tests exercise.
