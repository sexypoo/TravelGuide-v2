# T43 apply the home pilot direction to room, topic detail, and community

## Goal

Carry the T42 home direction to the other three core screens: same brand
colors, no decorative English labels, one primary-button treatment, flatter
structure, and one shared signal — the magenta live dot — that always means
"verified information from the place, right now".

## Rules carried over from T42

- No label above a heading unless it carries information.
- Primary action = ink fill. Exception: the chat send button keeps iris because
  it matches the user's own message bubbles.
- Magenta is reserved for live state (connected room, fresh field summary).
- Borders separate content; cards are used only for things that are items in a
  list (topics, posts, answers).
- Times use the body face with tabular figures, not a monospace face.

## Changes per screen

### Room (`room-experience.tsx`, `chat-room.css`, `globals.css`)

- Remove the blob illustration in the room header and the `TRAVEL LIVE ROOM`,
  `LIVE CONVERSATION`, `LIVE TOPICS` labels. The connection pill stays.
- `새 토픽` uses the ink primary treatment.
- Topic card byline shows a stray separator; fix while touching it.

### Topic detail (`question-detail.tsx`, `live-status-board.tsx`,
`topic-resolution-actions.tsx`, `answer-form.tsx`, `question-composer.tsx`)

- `LiveStatusBoard` is this screen's signature. Rebuild it as one block led by
  the headline number, with the live dot + last-checked time above it, the
  server description below, and the remaining facts as a plain definition list.
  Drop the clock tile, the per-metric icon tiles, the duplicated wait metric
  when the headline already states it, and the footer chips.
  New page-scoped `live-status-board.module.css`; old `.liveStatus*` global
  rules are removed.
- Remove `LOCAL SIGNALS`, `YOUR DECISION`, `FIELD REPLY`, `LIVE TOPIC` labels.

### Community (`community-board.tsx`, `globals.css`, `mobile-app.css`)

- Remove `OPEN TRAVEL DESK`; `정보 나누기` becomes the ink primary button
  instead of the magenta→iris gradient.
- Empty state loses the dashed box.

### Shared

- `--utility` becomes the body stack with tabular figures.

## Tests

- Update `room-experience.test.tsx` (no `LIVE CONVERSATION` text).
- Add a `live-status-board.test.tsx` covering live/stale and the deduplicated
  wait metric.
- `yarn lint`, `yarn typecheck`, `yarn format:check`, `yarn test`, `yarn build`,
  Playwright `mobile-app-shell`, `critical-room`, `locked-room-layout`;
  screenshots at 390x844 and 1440x900 before/after.

## Risks

- Global CSS removal uses the selector-aware prune from T42 and a diff audit.
- `--utility` change touches admin screens; they only use it for numbers and
  timestamps.
- No new dependencies, no API changes.
