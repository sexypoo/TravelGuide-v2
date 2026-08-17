# T33 Responsive room refinement

## Goal

Resolve the four concrete visual regressions reported after T32: a mobile left
gutter, an unwanted active-tab underline, unattractive topic cards, and a
desktop chat surface that looks like an enlarged phone UI. Realtime behavior,
permissions, and the single-scroll-owner contract remain unchanged.

## Design pass 1 — two room contexts

### Subject, audience, and job

- Subject: a destination operations desk receiving short field dispatches.
- Audience: a traveler using the mobile app with one hand and a contributor or
  operator reading the web room on a larger screen.
- Single job: read the latest useful dispatch and move between conversation and
  actionable topics without visual friction.

### Color tokens

- Dispatch Ink `#282531`: primary content and desktop controls.
- Field Gray `#625c69`: time, author, and secondary detail.
- Paper White `#ffffff`: chat and topic surfaces.
- Quiet Canvas `#faf8fa`: desktop panel separation.
- Live Berry `#c73568`: live/category marker only.
- Guide Iris `#675dda`: focus and own-message distinction only.

### Type roles

- Room display: Wanted Sans, 780–820, 20px mobile and 18–22px desktop.
- Message/question body: Pretendard, 590–680, 15–16px with 1.55–1.65 leading.
- Dispatch utility: SUIT/Pretendard, 700–800, 12px for status, time, and actions.

### Layout concepts

Mobile — full-bleed conversation:

```text
┌ back       제주 실시간방       bell ┐
├────── [ 대화 ] [ 실시간 토픽 ] ───┤  no underline
│ NAME · TIME                          │
│ ┌ message ┐                          │  edge-to-edge scroll owner
│                       ┌ mine ┐       │
├ [+] 지금 본 것…               [send]┤
└──────────────── safe area ───────────┘
```

Desktop — operator desk:

```text
┌ room identity / trust / controls ─────────────────────┐
├──────────────────────────────┬─────────────────────────┤
│ LIVE CONVERSATION            │ LIVE TOPICS             │
│ 실시간 대화                  │ 지금 이어지는 토픽      │
├──────────────────────────────┤ ┌ question first       ┐ │
│ received row                 │ │ status · answer/time │ │
│                 own row      │ └ share ───────────────┘ │
├ compact desktop composer ────┤                         │
└──────────────────────────────┴─────────────────────────┘
```

The signature is a quiet dispatch topline: one live berry dot and a ruled
metadata footer. It encodes “current field report” without adding a decorative
rail, gradient underline, or another pill system.

## Design pass 2 — critique and revision

Merely deleting the purple line and rounding the topic card differently would
be a generic cleanup and would leave the core breakpoint problem intact. The
revision treats mobile and desktop as different reading contexts: mobile loses
the outer frame and fills the device, while desktop gains a labeled
conversation panel, restrained message measure, and denser controls.

The topic card also stops presenting three equal pills. Category becomes a
small live marker, question text takes visual priority, status stays concise,
and author/answer/time form one ruled information footer. The share action is
attached to the card as a quiet text command.

The deliberate aesthetic risk is removing nearly all visible framing on the
mobile room. Full-bleed content can feel less “card-like,” but it fixes the
reported empty strip and makes the native app feel intentional. Desktop keeps
the structured frame where it helps scan two simultaneous columns.

## Files

- `frontend/src/app/chat-room.css`: breakpoint-specific room layout, no active
  underline, full-bleed mobile content, refined topic cards, and desktop-only
  density.
- `frontend/src/components/rooms/room-experience.tsx` and its test: add and
  verify the desktop conversation-panel heading.
- `frontend/e2e/critical-room.spec.ts`: assert mobile full-bleed geometry, absent
  switcher pseudo-line, topic-card hierarchy, and desktop composition.
- `tasks/T33_RESPONSIVE_ROOM_REFINEMENT.md`: task scope and acceptance.
- `docs/DECISIONS.md` and `docs/RELEASE_NOTES.md`: responsive room design
  boundary and release impact.

## Migrations and dependencies

- No database migration.
- No API, authorization, Socket.io, or shared-contract change.
- No new dependency.

## Verification

1. Run focused room, question-card, topic-share, app-frame, and layout tests.
2. Run the real-stack room checks at 390x844, 390x640, and 1440x900.
3. Inspect mobile chat, mobile topics, and desktop chat screenshots and revise
   any gutter, underline, card, or density problem.
4. Run the complete frontend verification and real-stack E2E suite.
5. Deploy the verified bundle to Vercel and inspect the installed iOS app while
   leaving the Railway frontend untouched.

## Risks

- Full-bleed mobile width must not reintroduce horizontal overflow around safe
  areas or the composer.
- Removing generated underlines must not weaken keyboard focus; the selected
  segment retains shape and contrast while `:focus-visible` remains explicit.
- Topic-card overrides must stay inside the focused room so full topic pages do
  not change.
- Desktop-only headers and sizes must not consume the shrinkable mobile
  timeline height.

## Results

- Focused room/component verification passed: 5 suites and 10 tests.
- Complete `corepack yarn verify` passed: Prettier, ESLint, TypeScript, 55 Jest
  suites with 131 tests, coverage gates, and the Next.js 15.5.21 production
  build.
- Complete real-stack Playwright passed: 4 tests in 47.7s against PostgreSQL,
  the NestJS API, Next.js, and Socket.io.
- Room screenshots were inspected at 390x844, 390x640, and 1440x900. Mobile
  conversation and topics are full-bleed without the generated active line;
  the topic hierarchy and desktop operator-desk composition match the second
  design pass.
- No migration, dependency, API, authorization, realtime, Railway frontend, or
  native package change was required.
