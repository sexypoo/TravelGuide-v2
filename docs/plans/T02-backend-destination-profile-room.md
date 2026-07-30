# T02 backend destination, profile, and room-shell plan

## Goal and scope

Implement only the backend half of T02 in `backend/`: destination/room persistence and Jeju seed, own/basic public profiles, authenticated room metadata, and a temporary room-content authorization boundary. Do not modify `frontend/`, create verification records, or create question/feed data.

## Previous-task verification

- Backend T01 is committed as `8e63536`; the working tree is clean.
- Authentication, explicit public DTOs, request IDs, Problem Details, PostgreSQL integration preparation, and guards are reused.
- T02 starts from the real `User` table and does not change T01 migration history.

## Data model and migration

Extend `User`:

- `bio String? @db.VarChar(300)` for the short introduction, matching the fixed logical data model.

Add `Destination`:

- cuid `id`, unique `slug`, Korean name, two-letter country code, IANA timezone;
- decimal center latitude/longitude and radius in kilometers;
- timestamps and one optional room relation.

Add `DestinationRoom`:

- cuid `id`, unique `slug`, unique `destinationId`, title, timestamps;
- required relation to `Destination` with cascade delete.

Create a new `add_destination_profile_room` migration. Existing migrations remain immutable.

## Seed

`prisma/seed.ts` uses upserts for exactly one pilot destination and room:

```text
destination slug: jeju
nameKo: 제주
countryCode: KR
timezone: Asia/Seoul
center: 33.3617, 126.5292
radiusKm: 80
room slug: jeju
room title: 제주 실시간 여행 도움방
```

No users, credentials, verification state, or questions are seeded. Integration preparation runs the seed twice and tests that only one destination/room exists.

## APIs

All endpoints require `JwtAuthGuard`.

```text
GET   /api/v1/users/me
PATCH /api/v1/users/me
GET   /api/v1/users/:userId/public
GET   /api/v1/rooms
GET   /api/v1/rooms/:slug
GET   /api/v1/rooms/:slug/content-access
```

Own profile includes id, email, nickname, bio, role/admin flag, and created/updated UTC strings. Update accepts optional nickname and bio; nickname keeps the existing uniqueness contract, and empty/null bio clears it.

The public card contains only id, nickname, `isVerifiedLocal: false`, and null verified destination/date fields. Email, bio, role, password hash, and future private verification data are excluded. The false/null values are truthful while no Verification model exists; no fake approved state is introduced.

Room list/detail DTOs include destination metadata and an explicit access summary. Regular users receive `VERIFICATION_REQUIRED` and `canViewContent: false`; admins receive `AVAILABLE` and `canViewContent: true`.

`content-access` is an authorization probe, not a fake question feed. It returns 403 `ROOM_ACCESS_DENIED` for an unverified user and 204 for an administrator. No `/questions` success payload is introduced before T05.

## RoomAccessService

- `getAccess(user)` returns an explicit public access summary.
- `assertCanViewContent(user)` throws the canonical 403 Problem Details for regular users until T03 adds real Verification lookups.
- Admin access follows the fixed permission matrix.
- The service is exported from `RoomsModule` for reuse by future REST and Socket paths; it is not duplicated in controllers.

## Validation and errors

- Nickname is trimmed, 2–20 characters, and nonblank.
- Bio is trimmed and limited to 300 characters; null/empty clears it.
- Duplicate nickname updates map both pre-check and Prisma `P2002` races to `NICKNAME_ALREADY_EXISTS`.
- Missing users/rooms return stable `USER_NOT_FOUND`/`ROOM_NOT_FOUND` Problem Details.
- Public responses are manually mapped and never serialize raw Prisma objects.

## Files

- Update schema, add migration, and replace no-op seed.
- Extend `UsersService`; add profile DTO/mapper/controller and export it from `UsersModule`.
- Keep T02 destination reads inside the room query and explicit nested DTO mapper; no unused standalone destination endpoint/module is introduced.
- Add `rooms/` access types/service/controller/module.
- Update `AppModule`, README, integration preparation, and integration tests.
- Add ADR-012 for the authorization-probe boundary.

## Tests

Real PostgreSQL integration tests cover:

- seed rerun yields exactly one Jeju destination and room with exact fixed data;
- anonymous room metadata is 401;
- logged-in unverified user lists/views Jeju metadata with `인증 필요` equivalent access code;
- the same user receives 403 `ROOM_ACCESS_DENIED` from content access;
- admin receives 204 from the same access service;
- own profile update trims nickname/bio and returns UTC timestamps;
- public profile excludes email, bio, role, password hash, and private fields;
- duplicate nickname update returns stable 409;
- unknown public user and room return stable 404 codes.

Unit tests cover access summaries and DTO mappers where they add value.

## Commands

Run from `backend/`:

```bash
corepack yarn install --immutable
yarn db:up
yarn db:generate
yarn db:migrate --name add_destination_profile_room
yarn db:seed
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn test:integration
yarn build
yarn verify
docker build -t travelguide-backend:t02 .
```

Migration and full verification run under the fixed Node 20 Docker environment because the host Node 24 is unsupported by Prisma 5.22.

## Risks and validation

- Decimal serialization can leak strings or precision differences: map all destination numeric fields explicitly to finite JavaScript numbers and assert exact seed values.
- Temporary access logic must not become a fake verification flag: regular users remain locked until T03 replaces the temporary branch with real qualification checks.
- A fake empty feed would violate scope: expose only the explicit content-access probe and defer question APIs.
- Profile update races must preserve stable error codes via DB constraints.
- Seed must never overwrite future operational content: upsert only fixed destination/room metadata by stable slugs.
- Frontend T02 remains unimplemented until separately requested.
