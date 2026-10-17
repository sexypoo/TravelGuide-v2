# 31 Redesign: design system and screens (mobile and web)

## Goal

Rebuild the frontend's presentation layer in the owner-approved direction
(Toss/Danggeun clarity, hi-fi mockups of 2026-10-18), on both mobile and
web. Keep the brand colors. There are no users yet, so the old styling is
deleted rather than migrated.

## Keep

- Backend, database, API contracts.
- `frontend/src/lib/**`: API clients, auth/session, validation, realtime,
  React Query hooks.
- Component behavior: data loading, mutations, validation, authorization
  gates, loading/empty/error states, accessibility semantics.
- Behavioral tests. Layout-pinning assertions are rewritten for the new
  layout.

## Replace

- All global and screen CSS: `globals.css`, `chat-room.css`,
  `mobile-app.css`, every `*.module.css` (about 13,000 lines).
- Markup and layout of 23 pages and 47 components.

## Design system

`frontend/src/styles/tokens.css` (imported once in the root layout):

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | #282531 | text, dark live card |
| `--ink-2` | #4a4553 | secondary text on light |
| `--muted` | #736d7b | supporting text |
| `--faint` | #a7a2ae | timestamps, inactive tabs |
| `--canvas` | #f4f3f7 | page background |
| `--surface` | #ffffff | cards |
| `--line` | #ecebf0 | dividers |
| `--magenta` | #c73568 | live state, brand moments, write FAB |
| `--iris` | #675dda | primary action, local badge, selection |
| `--plum` | #8a3e8f | profile identity |
| `--success` / `--danger` | #00a878 / #e5484d | status |

Type: Wanted Sans for headings, Pretendard for text (self-hosted, ADR-046).
Scale: 13 / 15 / 16 / 18 / 20 / 24 / 27 / 34 px. Body 15px, never below
12px. Radius: 14 tiles and inputs, 16 buttons, 22 cards, 26 hero card.

Components (CSS Modules, one folder `frontend/src/components/ui/`):
`Card`, `ListRow`, `Button`, `Chip`, `IconTile`, `SegmentedControl`,
`TopBar`, `TabBar`, `SideNav`, `Avatar`, `EmptyState`, `Field`.

Layout:

```
mobile <1024px            web >=1024px
+--------------------+    +--------+------------------------+
| TopBar (title)     |    | SideNav|  page head             |
|                    |    |  logo  |  +-------------+-----+ |
| canvas + cards     |    |  nav   |  | main 1.55fr | 1fr | |
|                    |    |        |  +-------------+-----+ |
| TabBar (5)         |    |  me    |  max 1080, centered    |
+--------------------+    +--------+------------------------+
```

The room is a focused screen on both: own top bar, no tab bar/side nav;
web shows chat (max 720 measure) and the topic rail side by side.

One memorable element: the dark ink live-room card on home with the latest
topics and answer counts. Everything else stays quiet.

## Order (one commit per step on `redesign/31`)

1. Tokens, base, `ui/` primitives, app shell (TopBar/TabBar/SideNav).
   Logout moves to 내 정보.
2. Home
3. Room and topic detail
4. Community list and detail
5. 내 정보 (view/edit split), saved places, travel records, verification
6. Nearby, public home, auth, legal, preorder, admin
7. Delete legacy CSS, rewrite layout E2E, final checks

## Migrations

None.

## Tests

- Unit: keep behavior assertions; update text/role queries for new copy.
- E2E: full suite with local Docker PostgreSQL; rewrite shell/room layout
  specs for the new layout at 390x844 and 1440x900.
- Screenshots of every page at 390x844 and 1440x900 before the final PR.
- `yarn lint`, `yarn typecheck`, `yarn test`, `yarn build`.

## Risks

- Large diff in one PR. Mitigation: one commit per step, screenshots per
  step, behavior tests unchanged.
- Copy changes can break E2E text queries. Update them in the same step.
- No presence data: the home card uses today's answer count and recent
  topics, which existing APIs provide.
