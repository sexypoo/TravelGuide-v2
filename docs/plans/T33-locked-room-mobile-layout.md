# T33 locked-room mobile layout fix

## Goal

Keep the locked room introduction readable at 390px instead of inheriting the
full-bleed dimensions intended for the interactive chat experience.

## Files

- `frontend/src/app/chat-room.css`: add a contained mobile layout for a focused
  room route when it renders `.lockedRoomPage`, including safe horizontal
  gutters and responsive heading sizing.
- `frontend/e2e/locked-room-layout.spec.ts`: verify the locked page stays
  inside the viewport and preserves visible side gutters at 390x844.

## Migrations

None.

## Tests

- Frontend formatting, lint, typecheck, and production build.
- Focused Playwright layout test when `TEST_DATABASE_URL` is available.

## Risks

The unlocked chat must remain full-bleed on mobile. Selectors are therefore
scoped to an app content container that specifically contains
`.lockedRoomPage`.
