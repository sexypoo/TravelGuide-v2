# T20 room focus navigation

## Goal

Treat an individual live room as a focused conversation workspace. Hide the
global app header and navigation only on `/app/rooms/[slug]`, while preserving
them on home, community, verification, profile, and any future room-list page.

## Files

- `frontend/src/components/app/app-frame.tsx`: choose standard or focused app
  chrome from the current pathname.
- `frontend/src/components/app/app-frame.test.tsx`: cover normal pages, room
  detail pages, and the room-list boundary.
- `frontend/src/app/app/layout.tsx`: route authenticated content through the
  frame without moving authentication or providers into the client.
- `frontend/src/app/globals.css`: let focused room content use the available
  viewport and remove mobile bottom-navigation clearance.

## Validation

- Run frontend formatting, lint, typecheck, unit tests, coverage, and build.
- Check that room detail keeps its own back link and room header.
- Inspect 390x844 and 1440x900 when browser control is available.

## Risks

- A broad `/app/rooms` prefix check would also hide navigation on a future room
  list. The route matcher therefore requires a slug segment.
- App providers and server-side session checks must remain mounted exactly once.
- Locked rooms use the same focused frame, but retain their home and
  verification links so users cannot become trapped.
