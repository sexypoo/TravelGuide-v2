# T30 Mobile room viewport and scroll containment

## Goal

Keep the authenticated room fully usable inside a 390x844 mobile viewport and
the Capacitor iOS/Android WebView. The room header and composer must remain
visible while only the message timeline or topic rail scrolls.

## Design direction

- Preserve the existing 여쭈어 magenta, plum, and iris palette, Wanted/Pretendard
  typography, message bubbles, and gradient composer action.
- Treat the room as four intentional rows: compact room header, mobile mode
  switcher, one shrinkable scroll viewport, and a safe-area-aware composer.
- Keep the composer as the room's visual anchor; no new decoration or product
  controls are introduced.

## Files

- `frontend/src/app/layout.tsx`, its test, and `globals.css`: request a
  keyboard-resizing viewport and correct mobile dynamic viewport sizing,
  shrinkable grid/flex tracks, safe-area padding, scroll containment, and
  keyboard-friendly room layout.
- `frontend/src/components/app/app-frame.tsx` and its test: bind room focus mode
  to the current visual viewport height so WebView/browser chrome and the
  software keyboard cannot leave a stale full-screen height.
- `frontend/src/components/messages/message-timeline.tsx`: keep latest-message
  following stable when the timeline viewport changes size.
- `frontend/src/components/messages/message-timeline.test.tsx`: regression
  coverage for viewport resize while following or reading older messages.
- `frontend/e2e/critical-room.spec.ts`: assert fixed document scroll, visible
  composer, an internally scrollable timeline, and no clipping at 390x844.
- `tasks/T30_MOBILE_ROOM_VIEWPORT_SCROLL.md`: task acceptance record.
- `docs/DECISIONS.md` and `docs/RELEASE_NOTES.md`: record the layout boundary and
  regression fix.

## Migrations and dependencies

- No database migration.
- No API or shared-contract changes.
- No new dependency.

## Verification

1. Run focused message-timeline and room component tests.
2. Run the real Playwright mobile room scenario at 390x844.
3. Verify the chat and topic modes at 390x844 and 1440x900.
4. Run frontend lint, typecheck, tests, and production build.
5. Rebuild and launch the Capacitor iOS simulator package if the web checks pass.

## Risks

- Mobile Safari and WKWebView change the visual viewport when the software
  keyboard opens; `dvh` and safe-area behavior must not double-count insets.
- Auto-scroll must follow new messages only when the reader was already near the
  bottom; a resize must not pull a reader away from older messages.
- Topic mode must retain its own scroll container after the chat-only fix.

## Results

- The fixed room shell now follows `visualViewport.height` and requests
  `interactive-widget=resizes-content`.
- Message and topic content have explicit shrinkable, momentum-scrolling owners;
  the document remains fixed in room focus mode.
- Resize observation keeps latest-message following stable without moving a
  reader who intentionally scrolled into history.
- Focused unit tests, frontend static checks, and the real-stack 390x844 /
  390x640 / 1440x900 Playwright room scenarios pass.
