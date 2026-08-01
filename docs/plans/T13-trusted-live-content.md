# T13 trusted live content

## Goal

Close the moderation and freshness gaps introduced by rich room messages, then
make field topics easier to prove, locate, and browse.

## Scope

### P0 moderation

- Add `MESSAGE` as a report target.
- Store message removal metadata and redact text, image, place, and shared-topic
  payloads after an administrator removes a reported message.
- Deny protected image reads after removal and broadcast a message removal event
  so open timelines update without a refresh.
- Offer report actions on messages written by another participant.

### P0 live-status correctness

- Count at most the latest structured observation from each author.
- Mark a summary `STALE` after 30 minutes without a new observation while
  preserving the last known values as historical context.
- Show the observation cutoff, unique contributor count, and an explicit prompt
  to add a new field update. Never label stale information as current.

### P1 answer evidence

- Allow one optional JPEG, PNG, or WebP image up to 10 MiB on an answer.
- Store it privately, clean it up after a DB failure, and expose it through an
  authenticated endpoint with room read authorization.
- Redact and deny the image when the answer is removed.

### P1 place selection

- Keep one explicit location-consent flow.
- Let the sender choose either device location or a manually selected map
  coordinate with place name and address. Do not add a third-party map SDK or
  leak coordinates outside the verified room.
- Show a compact coordinate preview and require confirmation before sending.

### P1 topic discovery

- Add an optional server-side category filter to the cursor question list.
- Add compact category chips in the topic rail; changing a filter uses a
  distinct query cache and keeps OPEN/RESOLVED state intact.

## Design direction

- Preserve Canvas `#fff9fb`, Ink `#494653`, Berry `#cf426f`, Plum `#914ba5`,
  Iris `#7068d8`, and reserve Teal `#0f9f99` for fresh field observations.
- Stale state uses warm amber rather than teal so time quality is readable at a
  glance. Evidence photos remain subordinate to answer text.
- Place selection stays inside the existing `+` travel-tool flow. Topic filters
  are a single horizontally scrollable instrument strip, not a second tab bar.

## Acceptance

- Another participant can report any message kind; own messages cannot be
  reported. Admin removal redacts REST and realtime views.
- Two observations from one author count as one contributor and only the latest
  values affect the summary.
- A 31-minute-old latest observation returns `STALE`; a recent one returns
  `LIVE`.
- Answer image signature, size, room authorization, removal, and orphan cleanup
  are covered by tests.
- Device and manual coordinates both create the same explicit place-message API
  contract.
- Category filtering is enforced by the backend and represented in the query
  key.
- Backend and frontend lint, format, typecheck, tests, and production builds
  pass.
