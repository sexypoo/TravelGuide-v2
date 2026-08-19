# T37 frontend structural refactor

## Goal

Refactor the frontend's cross-cutting infrastructure and largest ownership
hotspots without changing visible behavior, routes, API contracts, or product
scope.

## Audit findings

- Browser API modules repeat credentials, JSON headers, Problem Details error
  conversion, JSON parsing, and multipart handling.
- Runtime response guards such as `isRecord` and ISO-date validation are copied
  across ten API modules.
- `RealtimeProvider` owns transport types, event envelope validation, removed
  target parsing, Socket lifecycle, notifications, and React Query updates in
  one file.
- `/preorder` mixes static presentation content with route composition.
- `globals.css` is large, but selectors and media queries are globally coupled.
  Splitting it safely requires a separate ownership migration and visual pass;
  a mechanical split is intentionally excluded from this task.
- The health probe keeps its dedicated connection-failure contract, and
  server-only requests keep their internal-origin/cookie-forwarding boundary.

## Files

- `frontend/src/lib/api/client.ts` and tests: shared credentialed JSON,
  multipart, blob, and empty-response request behavior.
- `frontend/src/lib/api/runtime.ts` and tests: shared safe runtime guards.
- `frontend/src/lib/api/*.ts`: adopt the shared boundaries while preserving
  each public function and response parser.
- `frontend/src/lib/realtime/protocol.ts` and tests: Socket event contracts and
  runtime parsing.
- `frontend/src/components/providers/realtime-provider.tsx`: retain only Socket
  lifecycle, room membership, notifications, and cache coordination.
- `frontend/src/app/preorder/content.ts`: static problem and product-flow data.
- `frontend/src/app/preorder/page.tsx`: import the extracted content.
- `frontend/src/components/app/app-frame.tsx` and focused tests: floor
  fractional visual viewport heights so fixed room controls remain inside the
  visible WebView.
- `frontend/src/app/chat-room.css`: disable the global vertical entrance
  animation for the viewport-fixed room surface.
- Existing focused tests: update only where the implementation boundary changes
  while preserving behavior assertions.

## Migrations and dependencies

- No database migration.
- No dependency or lockfile change.
- No backend, REST, Socket event, cookie, or route contract change.

## Tests

1. Add focused unit tests for shared API request defaults, multipart behavior,
   errors, and response parsing.
2. Add focused unit tests for shared runtime and realtime protocol parsers.
3. Run frontend format check, lint, strict typecheck, full Jest coverage, and
   production build.
4. Run existing Playwright public-home/mobile-shell/critical-room coverage at
   the configured real-stack boundary when the local services are available.
5. Inspect 390x844 and 1440x900 for `/`, `/preorder`, and the room surface.

## Risks

- Central request helpers can accidentally alter headers or error conversion;
  preserve current fetch shapes and assert them directly.
- Runtime parser consolidation can accept or reject different payloads; keep
  the existing strict ISO and object semantics and cover malformed values.
- Moving realtime parsing must not recreate listeners or change effect
  dependencies; the provider retains its current lifecycle and tests.
- A transformed fixed-height room can move its composer fractionally beyond the
  viewport during page entry; the existing mobile room E2E assertion guards the
  viewport boundary.
- The working tree contains unrelated untracked presentation assets; do not
  stage, edit, or delete them.
