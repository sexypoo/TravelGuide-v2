# Frontend chat follow and new-message shortcut plan

## Goal

Make the verified group chat behave like a familiar mobile messenger when live
messages arrive. Users already reading the latest message keep following the
conversation; users reading older messages keep their position and receive a
compact shortcut to the newest message.

## Interaction contract

- Treat the timeline as being at the bottom when it is within 80px of the end.
- On the first successful load, position the timeline at the newest message.
- When the newest message changes while at the bottom, scroll the new message
  into the bottom edge. Respect reduced-motion preferences.
- When the newest message changes while above the threshold, do not alter
  `scrollTop`; show an unread-count shortcut.
- Clear the shortcut when the user reaches the bottom manually or activates it.
- Loading older pages must not be mistaken for a new live message because the
  newest message ID is unchanged.

## Design direction

- Subject: a compact Korean group chat for verified travelers and locals.
- Single job: reveal a new live message without interrupting someone reading
  chat history.
- Palette: Canvas `#fff9fb`, Ink `#494653`, Berry `#cf426f`, Plum `#914ba5`,
  Iris `#7068d8`, Surface `#ffffff`.
- Type: existing body type for the action label and utility face for the unread
  count.
- Layout:

```text
┌ chat timeline ─────────────────────┐
│ older messages                    │
│                         ┌────────┐ │
│                         │ ↓ 새 2 │ │
└─────────────────────────┴────────┘
┌ message composer ──────────────────┐
```

- Signature: one floating berry-to-iris “new message” pill anchored just above
  the composer. It borrows the familiar messenger placement and behavior while
  staying in TravelGuide's palette rather than imitating Kakao yellow.
- Self-critique: avatars, bubbles, and the composer already carry enough visual
  structure. Add no toast, badge in the header, or decorative animation; use a
  single subtle entrance and remove it under reduced motion.

## Files and tests

- Update only the frontend timeline component, its focused test, and scoped
  global chat styles.
- Test initial positioning, bottom-follow behavior, history-reading behavior,
  unread accumulation, manual clearing, and shortcut activation.
- Run frontend format, lint, typecheck, tests, and production build.

## Risks

- DOM scroll dimensions are unavailable in JSDOM by default; tests define them
  explicitly and verify calls without mocking realtime transport.
- Reconnect refetch may deliver multiple messages together; count all messages
  after the previously known newest ID.
- Avoid listening on the window: the actual timeline is the scroll container on
  both desktop and mobile.
