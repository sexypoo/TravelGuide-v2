# T42 authenticated home design pilot

## Goal

Pilot a cleaner visual direction on `/app` only, keep the current 여JJU brand
colors, and decide from before/after screenshots whether to roll it out to the
room, topic detail, and community screens.

## Problems on the current home

- Decorative English labels (`TRAVEL NETWORK`) and tracked Korean labels above
  every heading carry no information.
- The room card leads with an abstract blob illustration inside concentric
  rings; the useful facts (where, can I enter) come second.
- `운영 시간대 Asia/Seoul` exposes a system value, not something a traveler uses.
- The community lane uses a rotated `OPEN` stamp, gradient wash and dashed ring.
- The approved qualification is shown twice: in the greeting summary and again
  as a card in the qualification grid.
- Three different primary-button treatments exist across the app (ink, iris,
  magenta→iris gradient). The home uses ink.
- Desktop and mobile use different values for the same tokens (`--ink`
  `#494653` vs `#282531`), so desktop headings look washed out.

## Design pass 1 — system

- Subject: a live help room for travelers in Jeju, staffed by verified
  travelers and locals.
- Audience: Korean travelers on a phone, often mid-trip.
- Single job of this page: enter the room you can enter, or learn the one step
  that unlocks it.

Color (existing brand, fixed per page so desktop and mobile match):

- Ink `#282531`: text and the one primary button.
- Field gray `#625c69`: supporting text.
- Paper `#fff9fb`: canvas (unchanged).
- Line `rgba(40, 37, 49, 0.12)`: the only border.
- Signal magenta `#c73568`: reserved for the live dot on an enterable room.
- Guide iris `#675dda`: focus ring and the approved-status check.

Type: existing `--display` (Wanted Sans) and `--body` (Pretendard) stacks.
Scale 1rem / 1.15 / 2 (greeting, the T31 mobile `h1` floor) and 3.5rem
(mobile) / 4.5rem (desktop) for the place name. Body 1rem at 1.6 line height.

Layout: one left-aligned column, max 40rem.

```text
E2E여행자님,
무엇이 궁금하세요?
✓ 제주 여행자 인증 완료 — 실시간방에 참여할 수 있어요   ← one status line

┌──────────────────────────────────┐
│ ● 입장 가능                       │
│ 제주                              │  ← place name is the hero
│ 제주 실시간 여행 도움방             │
│ 인증된 여행자와 현지인이 지금 상황을 │
│ 묻고 답해요. 제주 중심 반경 80km    │
│ [ 방으로 이동                    ] │
└──────────────────────────────────┘

다른 방법으로 참여하기
────────────────────────────────────
여행자 커뮤니티                    ›
인증 없이 묻고 나눌 수 있어요
────────────────────────────────────
제주에 살고 있나요?                ›   ← only qualifications not approved
현지인 인증으로 답변할 수 있어요
────────────────────────────────────
```

## Design pass 2 — critique and revision

- First draft kept the room as an illustrated card with a smaller title. That is
  the generic "hero card with art" default; the art is not a place anyone
  recognizes. Revised: the destination name set large in display type is the
  one bold element. It is real content and scales to future destinations.
- First draft kept two section headings with labels above them. Revised: no
  labels above headings; one `h2` for the secondary list.
- Secondary destinations were cards in a grid. Revised to divided rows: they are
  a list of alternatives, not peers of the room.
- Motion: only the live dot pulses, and only when the room is enterable; it is
  disabled under `prefers-reduced-motion`.

## Files

- `frontend/src/app/app/page.tsx`: new structure, deduplicated qualification.
- `frontend/src/app/app/home.module.css` (new): page-scoped styles, so the
  pilot does not fight the global cascade.
- `frontend/src/components/rooms/room-card.tsx`: place-led room panel; drops
  the blob illustration and timezone.
- `frontend/src/app/globals.css`, `frontend/src/app/mobile-app.css`: remove
  rules for home-only classes that no longer exist.
- `frontend/e2e/mobile-app-shell.spec.ts`: home selectors move from class
  names to ids.
- Tests: `room-card.test.tsx` updated for the open state.

## Out of scope (found during review, reported separately)

- Web fonts are declared but never loaded; CSP `font-src 'self'` means they
  must be self-hosted. Affects every page.
- Global token values differ between desktop and the mobile shell.

## Tests

`yarn lint`, `yarn typecheck`, `yarn format:check`, `yarn test`, Playwright
screenshots at 390x844 and 1440x900, `mobile-app-shell.spec.ts`.

## Risks

- Removing global rules: classes are confirmed home-only by grep before
  deletion; `accessBadge`, `qualificationIcon`, `emptyState` stay (shared).
- No new dependencies, no API changes.
