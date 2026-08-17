# T34 — Chat surface and place modal

## Goal

Make the desktop room use its available space, simplify message bubbles and
topic cards, and turn place selection into a reliable viewport-level modal.

## Required work

- Reduce the desktop room's outer gutter and align short conversations near the
  composer instead of leaving a large dead zone below the latest message.
- Replace bordered, signal-heavy text bubbles with a quieter received/sent
  treatment while preserving readable metadata and mobile type minimums.
- Rework room topic cards into a clean Toss-like hierarchy with one status,
  question-first copy, subordinate metadata, and an obvious share action.
- Render the place picker through a document-level portal with overlay closing,
  Escape support, initial focus, focus containment, and a selected-place footer.
- Keep the room's single-scroll-owner and realtime behavior unchanged.

## Acceptance

- At 1440x900 the room uses all but a compact outer gutter and short message
  history rests above the composer.
- Text bubbles have no decorative signal bar, border, or card shadow; received
  and sent messages remain clearly distinct.
- Topic cards use a neutral surface, restrained status color, strong question
  copy, and a single footer action without stacked decorative pills.
- The place picker is attached to `document.body`, covers the viewport, closes
  with Escape or backdrop click, and remains usable at 390x844.
- Existing message, topic, place search, selection, and send behavior passes.
- Frontend verify and real-stack Playwright pass.
