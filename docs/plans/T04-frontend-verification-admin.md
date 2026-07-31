# T04 frontend verification and admin review plan

## Goal and scope

Implement only the frontend T04 vertical slice in `frontend/`: own verification status, traveler/local multipart forms, geolocation UX, and administrator list/detail/evidence/review. Use the real T03 API through the existing same-origin rewrite. Do not modify `backend/` or add question features.

## Existing-state verification

- T03 backend is running at port 3001 with the verified real PostgreSQL/private-storage implementation.
- Frontend T02 remains uncommitted but tested; T04 builds on its app shell, room/destination contract, and design tokens without rewriting it.
- The project has no TanStack Query dependency despite the architecture preference. T04 will use server `no-store` reads plus `router.refresh()` after mutations, avoiding a new production dependency for a small review surface.

## Design direction

Subject: a Korean responsive travel-help app for travelers and Jeju locals. The page's single job is to make a sensitive verification submission or review feel understandable and controlled.

Tokens stay within the established system: Ink `#191F28`, Canvas `#F7F8FA`, Surface `#FFFFFF`, Signal Magenta `#E93CAC`, Trust Purple `#7C3AED`, and Success `#00A878`. Display text uses the existing Wanted/Pretendard stack; body and utility copy use Pretendard/SUIT fallbacks. No new font network dependency is introduced.

Layout concepts:

```text
USER / desktop                 USER / mobile
heading + compact status       heading
┌─ travel pass ─────────┐      ┌─ travel pass ─┐
│ state · destination  │      │ state         │
└──────────────────────┘      └───────────────┘
┌─ choose/form ─────────┐      section cards
│ preparation → proof  │      stacked fields
└──────────────────────┘      sticky-safe CTA

ADMIN / desktop                ADMIN / mobile
header + filters               header + filters
list rail │ review detail      application cards
          │ evidence/action    selected detail below
```

Signature: each application is represented as a restrained “Jeju participation pass” with a clipped route notch, a single magenta-to-purple signal edge, and a truthful progress line (`제출 → 심사 → 참여`). This encodes the actual process instead of adding decorative dashboard metrics.

Self-critique before build: a generic verification dashboard would use KPI cards and colored status pills everywhere. Remove those. Keep one pass motif, neutral form sections, explicit privacy copy, and one gradient primary action. Motion is limited to the existing page entrance and pending spinner with reduced-motion support.

## Routes and components

- Replace `/app/verifications` guide with status overview and two actionable choices.
- Add `/app/verifications/traveler` and `/app/verifications/local` forms.
- Replace `/admin` placeholder with a real review workspace; optional `verification` query selection keeps list/detail shareable without exposing evidence URLs.
- Add client components for forms, location capture, evidence opening, review confirmations, and refresh-after-success.

## API and privacy

- Add strict runtime parsers for verification/user/admin DTOs and updated room access states.
- Server reads forward the httpOnly cookie and use `cache: no-store`.
- Client multipart writes use relative `/api/v1`, `credentials: include`, and `FormData` without manually setting `Content-Type`.
- Exact coordinates exist only in the local form's in-memory submission state and are never rendered, logged, persisted in browser storage, or returned by response parsers.
- Evidence is fetched only after an administrator clicks; an object URL is revoked immediately after opening/downloading and is never cached in React state beyond the operation.

## Validation and interaction

- Traveler: destination, ISO date boundaries, one allowed file <=5 MiB, optional note <=300, explicit evidence/privacy consent.
- Local: browser geolocation with timeout and high accuracy; map denied/unavailable/timeout, >200 m accuracy, and >80 km Haversine distance to specific Korean guidance; proof type, 30–300 relationship note, allowed file, consent.
- Disable submit/review while pending, expose status via `aria-live`, show API Problem Details messages, and route successful applications back to status.
- Admin review requires an explicit confirmation step. Rejection requires 10–300 characters before the real mutation.

## Tests

- Contract parsers reject private/unexpected invalid data and accept all T03 statuses/access states.
- Traveler/local form tests cover validation, FormData calls, geolocation error mapping, hidden coordinates, and successful navigation.
- Admin review tests cover evidence-on-click, confirmation, rejection reason validation, and refresh.
- Verify 390x844 and 1440x900 using the available browser/Playwright path if available; otherwise run build/tests and report the visual verification limitation precisely.

## Files and commands

- Add verification/admin API modules, server loaders, forms/cards/workspace, routes, tests, and scoped CSS.
- Update home status summary/CTAs, room access parser/fixtures, admin shell, README, and this plan only.

Run from `frontend/` under Node 20 where needed:

```bash
yarn format
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn build
yarn verify
```

## Risks

- Native date inputs are local calendar dates while backend requires instants: convert start to local day start and end to local day end in Asia/Seoul-compatible browser time, then submit ISO UTC.
- Server/client cache mismatch after review: all reads are `no-store`; successful mutations call `router.refresh()`.
- Object URL leaks: evidence fetch opens once and always revokes in `finally`.
- Geolocation privacy: never include raw coordinates in visible strings or normal-user response types.
- Dirty worktree: preserve all pre-existing frontend T02 and backend T03 changes; do not commit without a separate user request.
