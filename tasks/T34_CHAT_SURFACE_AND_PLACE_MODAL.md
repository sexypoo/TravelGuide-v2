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

## Feedback acceptance

- A room topic uses only one compact context line, the question, and one footer
  line; normal urgency does not consume a separate label.
- Sharing is a small secondary control rather than a full-width card footer.
- At 390px, two topic cards expose materially more question content without
  sacrificing the 12px metadata minimum or hiding answer count and sharing.
- The topic surface remains a clean rounded rectangle with at most 15px corner
  radius and approximately 12px inner padding, not an oversized soft card.
- A `TOPIC_SHARE` message uses one white rounded attachment, plain inline answer
  cadence, and one integrated footer; it has no lavender field or nested
  statistics card and remains readable at 390px.
- A `PLACE` message uses the same compact white attachment family with the place
  name first, a plain address and recommendation, and one integrated map/save
  footer; it has no gradient icon tile, nested quote card, or floating pill.
- `TOPIC_SHARE` and `PLACE` stay in one compact attachment family but are
  recognizable before reading: topic uses an unboxed conversation/violet
  signal and place uses an unboxed pin/berry signal, without tinted card bodies.
