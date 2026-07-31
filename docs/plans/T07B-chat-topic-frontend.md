# T07B plan — live conversation and topic rail

## Product job

Subject: a live Jeju room for currently verified travelers and locals. Audience:
someone making a near-term travel decision or sharing what they just observed.
The page's single job is to let short facts move quickly through conversation
while making consequential situations easy to preserve as structured topics.

## Design system

- Canvas `#F7F8FA`, paper `#FFFFFF`, ink `#191F28`, muted `#6B7684`.
- Signal magenta `#E93CAC`, route purple `#7C3AED`, verified green `#00A878`.
- Display: existing Wanted/Pretendard stack at restrained room headings. Body:
  Pretendard/SUIT stack. Utility: SF Mono-compatible stack for live state/time.
- Rounded surfaces remain crisp and mostly white. Gradient is reserved for live
  signal continuity, the send action, and topic promotion—not card decoration.

## Layout explorations

Rejected generic dashboard:

```text
[ stat ][ stat ][ stat ]
[ feed cards            ]
```

It treats conversation as analytics and could belong to any SaaS product.

Selected live-room stage:

```text
[ compact Jeju identity · trust · live connection                 ]
[ CONVERSATION — chronological, generous width ][ LIVE TOPICS    ]
[ older messages / bubbles / promoted signal     ][ open/resolved ]
[ sticky message composer                         ][ topic cards   ]
```

At phone widths the two columns become an explicit `대화 / 토픽` switcher; the
composer stays with conversation and topic creation opens in the topic view.

## Signature

An own message promoted to a topic gains a small gradient signal stem and a
`토픽으로 이어짐` link. The same topic enters the adjacent rail in real time.
This encodes a true relationship instead of adding a decorative flourish.

## Self-critique before build

The earlier page made the header and question rail equally loud, so the product
read as a styled issue tracker. T07B reduces the header, removes dashboard-like
guidance blocks, and spends visual emphasis on the conversation-to-topic handoff.
Chat bubbles remain restrained to avoid resembling a generic messenger clone;
verified identity and topic state, not arbitrary bubble color, carry meaning.

## Data and components

- Add strict message API parsers, create/list calls, infinite query hook, and
  query keys.
- Extend the singleton realtime provider with message event merge/dedupe and
  reconnect invalidation.
- Add message timeline/card/composer and adapt the topic composer for direct or
  source-message creation.
- Pass the current user id into the room client so only own messages expose the
  promotion action.
- Extend room/question runtime parsers for participant capabilities, public
  author badges, and `sourceMessageId`.

## Verification

- Parser/cache/component regression tests plus existing frontend suite.
- Lint, format check, strict typecheck, production build.
- Authenticated REST and Socket smoke checks against the running T07A backend.
- Browser QA at 390x844, 768x1024, and 1440x900 when an in-app browser is
  available; otherwise report the unavailable visual surface precisely.

## Risks

- Infinite message pages arrive newest page first while each page displays in
  chronological order; flatten pages from oldest page to newest and dedupe IDs.
- HTTP success and Socket delivery can race; cache helpers must be idempotent.
- Topic creation updates both the topic feed and the source message's `topicId`.
- Mobile keyboards can consume most of the viewport, so avoid fixed viewport
  heights and keep the composer in normal sticky flow.
