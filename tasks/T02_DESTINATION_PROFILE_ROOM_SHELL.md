# T02 — Destination, basic profile, and locked room shell

## Goal

Create the new product information architecture before implementing verification.

## Read first

- PROF-001
- DEST-001
- ROOM-001 and ROOM-003 access principles
- Data model User, Destination, DestinationRoom
- E2E-003

## Required work

- Extend User with bio if needed
- Destination and DestinationRoom models and migration
- Idempotent 제주 seed
- Profile me/public DTO and nickname/bio update
- Rooms list and room metadata APIs
- Temporary `RoomAccessService` interface that returns locked until verification exists
- User home with 제주 room card and verification CTAs
- Locked room page that never fetches private feed for unauthorized users
- Initial responsive navigation for app routes
- Integration tests for room metadata vs content access

## Constraints

- Do not implement Verification model yet.
- Do not fake verification state in production code.
- No external city API.
- No question feed placeholder pretending to be real data.

## Acceptance

- Logged-in unverified user sees 제주 card and `인증 필요`.
- Attempted room content API returns 403 ROOM_ACCESS_DENIED.
- Public user card excludes email and private fields.
- Seed is safe to rerun.

