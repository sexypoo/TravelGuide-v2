# T07A — room chat and topic backend

## Goal

Add the backend foundation for a live room whose primary surface is participant
chat and whose structured questions are promoted topics.

## Scope

- Add persistent, cursor-paginated room messages.
- Allow an authenticated, currently verified traveler or local to read and post
  messages.
- Broadcast committed messages through the existing authenticated Socket.IO room.
- Allow either participant type to create a topic directly or promote their own
  message once through the existing question endpoint.
- Preserve local-only structured answers until a later product decision changes
  that rule.
- Return the public participant badge for messages and topics without exposing
  verification evidence, dates, GPS, email, or private profile data.
- Add a Prisma migration and real PostgreSQL integration/socket tests.

## Out of scope

- Frontend chat UI.
- Message edit, delete, reactions, read receipts, typing indicators, or presence.
- Promoting another user's message.
- Topic resolution, reports, moderation, or rate limiting.

## Required verification

- Backend lint, format check, typecheck, unit tests, integration tests, and build.
- Real Socket.IO clients receive one committed message event.
- Unverified users and admins cannot post or promote.
- A message cannot be promoted twice and cannot be promoted across rooms.

