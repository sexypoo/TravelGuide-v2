# T30 — Mobile room viewport and scroll containment

## Goal

Fix clipped room content and unstable scrolling on mobile browsers and native
WebViews without changing the room's product scope or visual identity.

## Required work

- Keep the room within the current visual viewport.
- Keep the compact room header, mobile switcher, and message composer visible.
- Give message and topic content one explicit internal scroll owner.
- Respect bottom safe-area insets without creating document overflow.
- Preserve deliberate reader position while continuing to follow new messages
  for readers already at the bottom.
- Add regression coverage at 390x844.

## Acceptance

- The document does not scroll horizontally or vertically in room focus mode.
- The message timeline scrolls independently and has a positive usable height.
- The composer is fully inside the 390x844 viewport and remains visible after
  scrolling the message history.
- Switching to topics leaves the topic rail internally scrollable.
- Resize handling keeps a bottom-following reader at the latest message and does
  not jump a reader who moved into older history.
- Frontend lint, typecheck, focused tests, Playwright mobile room test, and build
  pass.
