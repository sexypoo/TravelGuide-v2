# T25 final MVP release polish

## Goal

Turn the current build into a locally verified presentation candidate by fixing
known test, demo-data, and product-priority inconsistencies. Do not add features.

## Files

- `backend/test/t02.e2e-spec.ts`: align the public profile expectation with the
  intentional avatar response contract.
- `backend/prisma/demo-content.ts` and a focused test: reset managed demo room
  content and refresh canonical topic/answer timestamps consistently.
- `frontend/src/app/app/page.tsx`: render approved qualification cards and move
  the verified room ahead of the optional community lane.
- `frontend/src/components/app/app-navigation.tsx` and tests: promote home and
  the real-time room in the navigation order.
- `frontend/src/app/globals.css`: keep the community palette and layout intact
  while aligning its hero, action, and content heading weights with the nearby
  and profile tabs. Use the shared 850/820/760 hierarchy instead of implicit
  browser heading weights.
- `frontend/src/components/rooms/room-experience.tsx`, its focused test, and
  `frontend/src/app/globals.css`: make the room title bar one coherent unit so
  the back action, room identity, and notification action align predictably.
- `frontend/package.json` and `frontend/yarn.lock`: restore the repository-pinned
  Next.js 15.5.2 version so runtime and lint contracts match.
- Focused frontend presentation helpers/tests if needed to keep state selection
  independently testable.
- `docs/PRESENTATION_CHECKLIST.md`, `docs/DAILY_STATUS.md`, and
  `docs/DECISIONS.md`: record current local evidence, scope priority, and the
  external gates that remain open.

## Migrations and dependencies

- No Prisma migration.
- No new dependency. Restore Next.js from the unrecorded 15.5.21 drift to the
  repository-pinned 15.5.2 version.
- No color, spacing, layout, or font-family change for the community surface;
  this is a focused typography consistency pass.
- Room header design direction: retain ink `#494653`, white `#ffffff`, canvas
  `#fff9fb`, line `#eee7ec`, and iris `#f1efff`; use Wanted Sans for the room
  identity and Pretendard for controls. Desktop uses a quiet signal-panel row;
  mobile uses symmetric 40px action slots around a truly centered title:
  `[ back ][ room title ][ bell ]`. The distinctive element remains the live
  signal tile, now integrated into the bar instead of floating beside it.

## Tests

1. Focused backend unit/integration tests for demo reset and public profile.
2. Focused frontend tests for approved CTA and navigation order.
3. Backend `corepack yarn verify` against the real PostgreSQL test database.
4. Frontend `corepack yarn verify`.
5. Real-stack Playwright when the local database and both apps are available.
6. Compare computed community heading/action weights with the nearby tab and
   visually verify the community list/detail surfaces at mobile and desktop
   widths.
7. Verify the room header hierarchy, centered mobile title, and overflow at
   390x844 and 1440x900; keep the existing chat viewport usable.

## Risks

- Demo cleanup must target only the five fixed demo identities and the Jeju demo
  room; unrelated production users and content must remain untouched.
- Existing questions can be referenced by messages, favorites, reports, and
  accepted-answer fields, so cleanup should use audited soft removal where
  deletion would create referential or evidence-retention risk.
- The current host Node version may differ from the required Node 20 runtime;
  results must record the actual runtime and Node 20 remains a release gate.
- HTTPS, physical GPS/mobile keyboard, host reboot, four-account rehearsals, and
  backup video cannot be inferred from local automation and stay unchecked.
- Variable font interpolation can make close numeric weights look similar, so
  browser-computed values and screenshots must both be checked.
- Header height directly reduces the fixed chat viewport; avoid decorative
  height and verify the message composer remains visible at mobile size.
