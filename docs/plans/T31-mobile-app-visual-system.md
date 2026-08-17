# T31 Mobile app visual system and stable navigation

## Goal

Turn the authenticated mobile web surface into a calmer, native-feeling app
shell. A traveler should be able to scan the current place, status, or next
action with one hand and without squinting. The room keeps its separate focus
mode; this task improves the pages around it.

## Design pass 1 — system

### Subject, audience, and job

- Subject: a live travel community and local field guide.
- Audience: Korean travelers and local contributors using a phone while moving.
- Single job: understand the page and reach the next useful action at a glance.

### Color tokens

- Route Ink `#282531`: primary copy and decisive controls.
- Field Gray `#625c69`: supporting copy.
- Paper `#fff9fb`: app canvas.
- Card White `#ffffff`: content surfaces.
- Signal Magenta `#c73568`: live/active travel signal.
- Guide Iris `#675dda`: navigational and focus signal.

Lines and soft states are derived from these six tokens with opacity instead of
introducing more competing colors.

### Type roles

- Display: Wanted Sans, 760–820, tight Korean display tracking, 28–34px mobile.
- Body: Pretendard, 550–650, at least 15px with 1.6 line height.
- Utility: Pretendard/SUIT, 700–800, at least 12px and reserved for metadata.

### Layout

```text
┌────────────────────────────┐
│ brand              profile │  compact sticky header
├────────────────────────────┤
│ PAGE SIGNAL                │
│ Clear title                │
│ Readable supporting copy   │
│                            │
│ ┌────────────────────────┐ │
│ │ primary content/action │ │  scrolling document
│ └────────────────────────┘ │
│             …              │
├──────── route line ────────┤
│ Home  Room  Talk  Near  Me │  fixed route deck
└─────── safe area ──────────┘
```

The route deck is full-width and flush with the viewport, while content owns a
matching bottom reserve. Cards use a quieter one-pixel boundary and shallower
shadow so type, not decoration, carries hierarchy.

## Design pass 2 — critique and revision

The first idea (larger type plus white cards) is too generic and would not make
the product feel more intentional. The revision introduces one signature motif:
the active destination sits below a thin magenta-to-iris route signal. This
reuses the journey language already present in the brand while keeping gradients
out of ordinary cards and copy.

The deliberate aesthetic risk is replacing the familiar floating glass pill
with a full-width route deck. It is less decorative, but it removes the visible
movement caused by overscroll/safe-area changes and reads more like a stable
native-app boundary. Stronger typography, compact top spacing, and the route
signal keep it distinctive rather than merely utilitarian.

## Files

- `frontend/src/app/mobile-app.css`: isolated final-cascade mobile app shell,
  stable route deck, readable type scale, page-specific hierarchy, focus and
  reduced-motion handling.
- `frontend/src/app/layout.tsx`: load the app visual-system stylesheet after the
  existing global styles.
- `frontend/e2e/mobile-app-shell.spec.ts`: verify fixed navigation, safe content,
  readability, overflow, and desktop containment against the real stack.
- `tasks/T31_MOBILE_APP_VISUAL_SYSTEM.md`: task scope and acceptance.
- `docs/DECISIONS.md` and `docs/RELEASE_NOTES.md`: record the visual-system and
  release impact.

## Migrations and dependencies

- No database migration.
- No API or shared-contract change.
- No production dependency.

## Verification

1. Run focused navigation, app-frame, and affected component tests.
2. Run real-stack Playwright at 390x844 across authenticated app pages and
   compare the deck geometry before/after end-of-page scrolling.
3. Inspect Playwright screenshots for home, community, nearby, and profile and
   revise any weak hierarchy or clipping.
4. Run the T30 room regression at 390x844 and 1440x900.
5. Run frontend lint, format check, typecheck, full tests, and production build.
6. Deploy the verified web bundle and inspect the installed iOS simulator app.

## Risks

- iOS overscroll and safe-area insets can make a floating fixed element appear
  to move; the deck must be flush to the physical bottom and contain overscroll.
- Broad typography overrides can make dense community/place cards overflow;
  selectors stay inside the non-room app shell and are verified at 390px.
- A larger bottom deck can hide final controls unless every non-room page shares
  the same content reserve and scroll padding.
- Desktop navigation and the room's internal scroll owner must remain unchanged.

## Results

- Added a final-cascade mobile app layer with a full-width safe-area route deck,
  fixed viewport geometry, shared bottom content reserve, stronger contrast, and
  a 15px/12px readable type floor for primary/utility copy.
- Reworked the mobile hierarchy across home, community, nearby, profile,
  verification, saved-place, and detail surfaces while leaving T30 room focus
  mode outside the new layout selectors.
- Visually inspected 390x844 screenshots for home, community, nearby, and
  profile; the production-style hierarchy is readable without horizontal
  clipping. The black lower-left circle in development captures is Next.js dev
  tooling, not application UI.
- Real-stack Playwright verified six authenticated mobile routes, unchanged
  desktop navigation, and both existing room scenarios: 4 tests passed in 1.4m.
- Frontend focused tests passed (7 suites/14 tests). Full frontend verification
  passed (55 suites/131 tests, coverage gate, lint, format, typecheck, and
  Next.js 15.5.21 production build).
