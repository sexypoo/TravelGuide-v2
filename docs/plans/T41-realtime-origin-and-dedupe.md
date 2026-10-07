# T41 realtime origin config and bounded event dedupe

## Goal

Fix two realtime defects found in code review and remove the duplicated
handler scaffolding they live in:

1. The Socket.io gateway reads `process.env.WEB_ORIGIN ?? FRONTEND_URL ??
   'http://localhost:3000'` directly in its decorator. REST uses the validated
   `WEB_ORIGIN` from `ConfigService`. If the variable is missing or malformed,
   REST fails at boot while Socket.io silently trusts localhost.
2. `RealtimeProvider` stores every received `eventId` and answer id in
   `Set`s that are never pruned, so a long-lived room tab grows memory without
   bound.
3. Five `socket.on(...)` handlers repeat the same parse → dedupe → apply →
   fallback-invalidate scaffolding.

## Files

- `backend/src/realtime/configured-io.adapter.ts` (new): `IoAdapter` subclass
  that applies the same origin predicate and `credentials: true` as REST.
- `backend/src/configure-app.ts`: share the origin predicate and register the
  adapter.
- `backend/src/realtime/realtime.gateway.ts`: drop the `cors` block and the
  hardcoded localhost fallback.
- `backend/test/health.e2e-spec.ts`: next to the existing REST CORS case,
  assert the Socket.io polling handshake returns `Access-Control-Allow-Origin`
  only for `WEB_ORIGIN`.
- `frontend/src/lib/realtime/recent-ids.ts` (+ test, new): bounded
  insertion-ordered id set.
- `frontend/src/components/providers/realtime-provider.tsx`: use the bounded
  set and an `onRoomEvent` helper for the shared scaffolding.
- `frontend/src/components/providers/realtime-provider.test.tsx`: no
  behavior change expected; existing tests are the refactor guard.

## Migrations

None.

## Tests

- `yarn lint`, `yarn typecheck`, `yarn test` (frontend unit tests cover
  realtime dedupe, reconnect refetch, fallback invalidation).
- `yarn test:integration` (t06 socket e2e + Socket.io CORS case).

## Risks

- Origin predicate allows a missing `Origin` header, same as REST. Native
  WebSocket transport is not covered by CORS at all; authentication still
  relies on the httpOnly cookie and `RoomAccessService` on `room.join`. No
  change in that posture.
- Bounded dedupe (500 ids) could in theory admit a replay of an event older
  than the last 500. Cache merges are idempotent by id; the feed answer-count
  increment is not, so such a replay could over-count once until the next
  refetch. Socket.io does not replay events that old in practice.
- No new dependencies.
