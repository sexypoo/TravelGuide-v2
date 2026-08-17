# T34 Chat surface and place modal

## Goal

Resolve the remaining visual friction in the focused room: wasteful desktop
gutter and empty height, overdesigned message chrome, a topic card that still
looks ornamental, and a place picker that can be clipped by the chat layout.
No API, permission, realtime, or persistence behavior changes.

## Design pass 1 — quiet travel operations

### Subject, audience, and job

- Subject: a live travel help desk where short observations become actionable
  questions or shared places.
- Audience: a traveler typing on mobile and a contributor scanning chat and
  topics side by side on desktop.
- Single job: understand the latest useful update and act on it without reading
  decorative UI first.

### Color tokens

- Decision Ink `#191f28`: message and question text.
- Utility Gray `#6b7684`: author, time, location, and helper copy.
- Quiet Canvas `#f2f4f6`: received bubbles and room separation.
- Surface White `#ffffff`: stage, cards, and modal.
- Guide Violet `#6257d9`: sent messages, focus, and primary actions.
- Live Berry `#d33a6f`: the one live/category signal.

### Type roles

- Room display: Wanted Sans, 760–800, 18–22px for stable room identity.
- Message and question body: Pretendard, 580–720, 15–16px with compact
  1.5–1.6 leading.
- Utility and status: SUIT/Pretendard, 680–780, 12px for names, time, counts,
  and controls.

### Layout concepts

Desktop — compact full-width desk with messages resting near the composer:

```text
┌ room identity ─────────────────────────────────────────────┐
├───────────────────────────────────┬────────────────────────┤
│ conversation                      │ topics                 │
│                                   │ ┌ open · 답변 2       ┐│
│     received                      │ │ 질문을 가장 크게     ││
│                       sent        │ │ 장소 · 작성자 · 시간 ││
│     received                      │ ├ 채팅에 공유       › ┤│
├ compact composer ─────────────────┤ └──────────────────────┘│
└───────────────────────────────────┴────────────────────────┘
```

Place modal — one decision surface above the room:

```text
┌ dimmed room ───────────────────────────────────────────────┐
│        ┌ 장소 보내기                               × ┐     │
│        ├ [ 장소 이름 검색                         검색 ]     │
│        ├ results list ────────┬ map preview ─────────┤     │
│        │ 선택 가능한 장소     │                      │     │
│        ├ selected place ──────┴──── 취소 [선택] ─────┤     │
│        └─────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

The signature is the “answer pulse” in each topic card: a single live dot at
the top and a plain answer count opposite it. It communicates whether a field
question is moving without adding multiple badges or gradient decoration.

## Design pass 2 — critique and revision

Copying Toss literally would produce a generic finance-style stack disconnected
from a live travel room. The revision keeps Toss's neutral canvas, strong type,
large white surfaces, and restrained status color, but ties the only visual
signal to live field responses. Category, urgency, status, author, and time no
longer compete as equal chips.

Simply widening message bubbles would worsen the dead-space complaint. Short
histories instead settle above the composer, while long histories keep the same
scroll behavior. Desktop outer width grows, but message measure remains capped
for readability.

The deliberate aesthetic risk is removing all borders and shadows from plain
text bubbles and using one saturated violet sent surface. The surrounding room
becomes quieter, and direction remains immediately clear through alignment and
color rather than ornamental signal bars.

## Feedback pass — one-glance topic preview

The first neutral-card pass still read like a compact admin panel: status,
answer count, category, urgency, author, time, and share each occupied a
separate visual row. The revised subject is a live travel question preview for
a traveler who needs to decide, in one glance, whether to open or share it.

### Compact tokens and type

- Decision Ink `#191f28`, Utility Gray `#6b7684`, Quiet Canvas `#f2f4f6`,
  Surface White `#ffffff`, Live Green `#00a27a`, and Guide Violet `#6257d9`.
- Wanted Sans carries the question at 16px/700; Pretendard carries the compact
  context and author line; SUIT carries time and answer data at 12px.

### Revised layout

```text
┌ 대기 현황 · ● 진행 중                    공유 ─┐
│ 현재 제주공항 입장 대기 상황을 알려주세요 │
│ 제주여행자 · 인증 여행자 · 오늘       답변 2 › │
└─────────────────────────────────────────┘
```

The signature is a single sentence-like context line: category and live status
read together before the question, rather than as separate badges. Normal
urgency disappears because it carries no decision value; only urgent topics
add an alert word. Share becomes a small quiet utility in the top corner and
the answer count becomes the card's destination cue.

The aesthetic risk is removing the full-width share footer entirely. This is
appropriate here because opening the question remains the primary action and
sharing is a secondary room utility. The critique also removes one more
accessory—the dedicated status row—so the result is not merely a shorter version
of the same card.

User calibration after the first compact screenshot: keep the familiar clean
rounded rectangle, but avoid the inflated soft-card look. The final room card
therefore uses a 14px corner radius, 12px content padding, a 9px share-control
radius, and tighter vertical rhythm instead of the earlier 19px/17px treatment.

## Files

- `frontend/src/components/messages/message-timeline.tsx` and test: add a
  bottom-settling content stack without changing scroll ownership.
- `frontend/src/components/messages/message-card.tsx`: identify plain text
  bubbles explicitly so rich cards keep their own surfaces.
- `frontend/src/components/places/place-picker.tsx` and tests: document portal,
  modal behavior, focus management, and clearer result/selection regions.
- `frontend/src/components/messages/message-composer.test.tsx`: prove the place
  dialog is outside the composer layout.
- `frontend/src/app/chat-room.css`: focused-room width, bubble, topic-card, and
  modal visual system.
- `frontend/src/components/questions/question-card.tsx`, share button, and
  presentation helper/tests: compress the feedback-pass card and shorten live
  timestamps without losing accessible verification and share labels.
- `frontend/e2e/critical-room.spec.ts`: desktop density and mobile modal
  geometry plus topic radius, padding, height, type, and clipping checks.
- `docs/DECISIONS.md` and `docs/RELEASE_NOTES.md`: record the interaction and
  visual boundary.

## Migrations and dependencies

- No database migration.
- No new dependency; use React DOM's existing `createPortal`.
- No API, authorization, realtime, or shared-contract change.

## Verification

1. Run focused message timeline/card/composer, place picker, question card, and
   room experience tests.
2. Run real-stack room checks at 390x844, 390x640, and 1440x900, including the
   place modal.
3. Inspect desktop chat, desktop modal, mobile chat, mobile topics, and mobile
   modal screenshots; remove any remaining decorative or spatial excess.
4. Run the complete frontend verification and real-stack E2E suite.
5. Deploy the verified Vercel frontend and leave the Railway frontend untouched.

## Risks

- Bottom-settled short history must expand naturally when messages exceed the
  viewport and must not break older-message scrolling.
- A portal modal must restore focus and body overflow even when closed by
  Escape, backdrop, or selection.
- Text-bubble color rules must not leak into protected image, place, or shared
  topic cards.
- Wider desktop room content must retain readable message measure and avoid
  horizontal overflow at intermediate widths.

## Results

- Focused ESLint and TypeScript passed; 7 focused suites with 20 tests passed.
- Complete `corepack yarn verify` passed: Prettier, ESLint, TypeScript, 56 Jest
  suites with 134 tests, coverage gates, and the Next.js 15.5.21 production
  build.
- Complete real-stack Playwright passed: 4 tests in 1.4m against PostgreSQL,
  the NestJS API, Next.js, and Socket.io. The focused room scenarios also passed
  together after restoring the 12px mobile metadata minimum. Cold Next.js
  compilation can take longer than the old navigation limits, so only the two
  multi-page scenario budgets were widened; all UI assertions remain unchanged.
- Screenshots were inspected for desktop chat, desktop place modal, mobile chat,
  mobile topics, and mobile place modal. The map preview's initial footer
  overlap and the first mobile metadata reduction were corrected before final
  verification.
- The feedback-pass topic surface was re-inspected at 390x844 and 1440x900. Its
  14px radius, 12px padding, maximum test-card height of 145px, 12px metadata,
  compact same-day time, visible full author name, and secondary share control
  are protected by the real-stack mobile regression.
- Desktop room geometry leaves a 16px outer gutter at 1440x900; short message
  history settles above the composer. The modal is a direct body child, locks
  body overflow, receives search focus, and remains within 390x844.
- No migration, dependency, API, authorization, realtime, Railway frontend, or
  native package change was required.
