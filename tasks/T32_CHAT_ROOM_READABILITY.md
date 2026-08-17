# T32 — Chat room readability

## Goal

Make the focused room easier to read and operate in the mobile app without
changing its realtime behavior, permissions, or T30 scroll containment.

## Required work

- Strengthen the room title, mode tabs, sender/time metadata, message body, and
  composer hierarchy for one-handed mobile use.
- Give ordinary messages a high-contrast field-transmission treatment while
  preserving image, place, and shared-topic message behavior.
- Keep text inputs at 16px and primary room controls at least 44px on mobile.
- Improve topic-rail labels and cards so switching away from chat does not
  reintroduce low-contrast, undersized text.
- Preserve the fixed room shell, internal message/topic scrolling, safe-area
  handling, keyboard resizing, and latest-message follow behavior from T30.
- Keep the room inside the smaller available viewport when browser resize and
  visual-viewport events arrive out of order.
- Add regression coverage at 390x844 and confirm desktop containment at
  1440x900.

## Acceptance

- Ordinary chat body text is at least 15px with a comfortable reading line
  height, and sender/time metadata is at least 12px on mobile.
- The composer textarea is at least 16px and add/send/mode controls have a
  minimum 44px touch target on mobile.
- Own and received messages remain visually distinct without relying only on
  alignment or low-contrast tinted backgrounds.
- The message timeline remains the only chat scroll owner and the composer stays
  fully inside 390x844 and 390x640 viewports.
- The topic rail remains internally scrollable and readable.
- Frontend lint, format, typecheck, tests, Playwright room checks, and build pass.
