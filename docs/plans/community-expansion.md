# Open travel community and multi-destination brand plan

## Goal

Expand TravelGuide's brand from a Jeju-only product to a destination-based
travel network while keeping Jeju as the only currently active verified live
room. Add a general travel community that requires an account but not traveler
or local evidence verification.

## Product boundary

- Landing, authentication, app home, metadata, and navigation use destination-
  neutral language. Jeju-specific room and verification screens stay specific.
- Any signed-in `USER` or `ADMIN` can read community posts. Signed-in regular
  users can create posts and comments without an approved verification.
- Community posts contain category, optional area text, title, and plain-text
  body. Comments contain plain text. No likes, follows, images, anonymous
  posting, realtime delivery, or search are included.
- Posts and comments connect to the existing report/admin soft-removal flow.

## Backend

- Add `CommunityPostCategory`, `CommunityPost`, and `CommunityComment` Prisma
  models plus report target enum values and a committed migration.
- Add `/api/v1/community/posts` list/create, post detail, and comment creation.
- Use opaque `(createdAt,id)` pagination, explicit public DTOs, JWT guards, input
  validation, and per-user post/comment rate limits.
- Extend reporting and admin review to validate, inspect, and soft-remove
  community targets without emitting room Socket events.

## Frontend

- Add `/app/community` feed/composer and `/app/community/[id]` detail/comments.
- Add a community navigation item and a two-lane home: open community versus
  verified live rooms.
- Preserve the berry/iris/plum palette. The community's signature is a compact
  destination stamp on each bulletin card; live rooms retain the signal motif.
- Provide loading, empty, form validation, error, removed-content, mobile, and
  keyboard-focus states.

## Validation

- Backend unit/integration coverage for unverified access, validation,
  pagination, ownership/reporting, and admin removal.
- Frontend API parser/component coverage for feed, create, detail, and comments.
- Run both projects' lint, format, typecheck, test, integration tests where
  applicable, and production builds.

## Risks

- “No verification” must not become anonymous posting: JWT remains mandatory.
- Public DTOs never expose email, evidence, GPS, or raw Prisma records.
- Moderation needs target-specific removal without assuming every report belongs
  to a destination room.
- The existing uncommitted palette update is preserved and reviewed as part of
  the frontend diff.
