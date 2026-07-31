# T07A plan — room chat and topic backend

## Outcome

The Jeju room becomes a persistent live conversation for verified travelers and
locals. Existing questions remain the structured topic record, while a topic may
optionally originate from the author's own chat message.

## Contract and authorization

- `GET /api/v1/rooms/:slug/messages?cursor=&limit=` returns the latest page in
  chronological display order and a cursor for older messages.
- `POST /api/v1/rooms/:slug/messages` accepts plain text from 1 to 500
  characters and returns a public message DTO.
- `POST /api/v1/rooms/:slug/questions` accepts optional `sourceMessageId`. When
  supplied, the message must belong to the same room and current user and must
  not already have a topic. Its content becomes the authoritative topic content.
- Both currently verified travelers and locals may post messages and create
  topics. Admins retain read-only room access. Structured answers remain
  local-only in this slice.
- REST and Socket room joins continue to share `RoomAccessService`.

## Data and migration

- Add `RoomParticipantKind` (`TRAVELER`, `LOCAL`).
- Add `ChatMessage` with room, author, participant kind, plain-text content, and
  timestamps.
- Add `Question.authorKind` and optional unique `sourceMessageId`. Existing
  questions migrate as `TRAVELER`.
- Add indexes for stable room message pagination and author history.

## Backend files

- Prisma schema and a forward migration.
- New `messages` module with DTOs, cursor codec, controller, and service.
- Extend room access with a participant capability used by messages/topics.
- Extend question creation/response for topic origin and author badge.
- Extend realtime types/publisher for `room.message.created`.
- Register the module in `AppModule` and add focused integration/socket tests.

## Tests

- Authentication and current room verification gates.
- Traveler and local message creation, plain-text preservation, public DTO
  privacy, stable cursor pagination, and empty state.
- Direct topics from both participant types.
- Own-message promotion, cross-room/foreign-message rejection, and one-time
  promotion under concurrent requests.
- Socket event delivery after persistence and no delivery for rejected writes.
- Existing T05/T06 tests adjusted only where the newly approved topic permission
  intentionally changes prior behavior.

## Risks

- Existing frontend parsers only know traveler-authored questions; T07B must
  update them before exposing local-created topics through the UI.
- Topic promotion must serialize on the message ID to prevent duplicate topics.
- Current verification may expire after content creation, so participant kind is
  stored with the content instead of being inferred during later reads.
- Message history is bounded to 50 items per request and uses an opaque composite
  cursor to avoid duplicates at identical timestamps.

