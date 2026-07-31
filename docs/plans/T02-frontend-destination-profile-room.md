# T02 frontend destination, profile, and locked-room plan

## Goal and scope

Implement only the frontend half of T02 in `frontend/`: the authenticated app information architecture, real Jeju room metadata, truthful locked access, verification guidance CTAs, own-profile view/edit, and responsive navigation. Reuse the committed Backend T02 APIs without changing `backend/`, creating verification state, or fetching/pretending to fetch a question feed.

## Previous-task verification

- Frontend T01 is committed as `24bbc78` with real cookie authentication, protected user/admin shells, API Problem Details handling, and the Jeju Signal visual foundation.
- Backend T02 is committed as `6ba5c49` with Jeju destination/room seed, room metadata/access DTOs, own/public profiles, and an authorization probe.
- The working tree is clean before this plan.

## Product job

For a logged-in but unverified traveler, the home page has one job: make the Jeju room discoverable while explaining the lock and the two legitimate paths to qualify. The room page has one job: show trustworthy room context without requesting private content. The profile page has one job: let the user safely maintain the small public identity they will later use in questions and answers.

## Design plan

### Tokens and typography

- Ink `#191F28`, muted `#6B7684`, canvas `#F7F8FA`, surface `#FFFFFF`, magenta `#E93CAC`, purple `#7C3AED`.
- Wanted Sans-style display stack for page/room names; Pretendard/SUIT-style body stack for controls and explanations; system numeric styling only for dates and coordinates.
- Existing 20px cards, 16px controls, restrained shadow, visible purple focus, and reduced-motion behavior continue unchanged.

### Layout

Mobile prioritizes one vertical decision path:

```text
greeting + truthful auth summary
└─ Jeju room hero card (locked)
   ├─ destination / room title
   ├─ access label + reason
   └─ room introduction
└─ two qualification guidance CTAs
bottom nav: home / verification / Jeju room / profile
```

Desktop keeps the 720px reading column and moves navigation to a quiet left rail rather than stretching the home into a generic dashboard grid.

### Signature

The single expressive element is the **Jeju lock signal**: a small Jeju silhouette inside a muted magenta-purple ring on the room card. It is static while locked. Future approved access may animate once, but T02 never fakes that state.

### Critique and revision

A first-pass dashboard with greeting, statistics, multiple gradient cards, and badges would be interchangeable with finance or productivity apps. Remove statistics and extra decoration. Keep one destination card, encode the real access state in text/icon, and use the qualification choice itself as the secondary hierarchy. Gradient is limited to the Jeju signal and primary navigation emphasis.

## Routes and data

- `/app`: server-fetch `GET /api/v1/rooms`; show greeting, truthful “인증 전” summary, Jeju room card, and traveler/local guidance.
- `/app/rooms/jeju`: server-fetch only `GET /api/v1/rooms/jeju`. If locked, render metadata and access guidance without calling `/content-access` or any questions endpoint.
- `/app/verifications`: information architecture for choosing traveler or local qualification. It explains requirements and that applications open in the dedicated verification task; it does not create records or claim submission success.
- `/app/profile`: server-fetch `GET /api/v1/users/me`; PATCH nickname/bio with client validation and stable conflict/error messages; refresh the server shell after success.

All server API calls forward the incoming cookie to the internal API origin and redirect an expired session to login. Browser mutations stay relative and include credentials. Responses are parsed into explicit public contracts; raw unknown JSON is never rendered.

## Navigation and states

- Responsive app navigation: left rail at desktop, safe-area-aware bottom bar on mobile.
- Home/room/profile have route loading skeletons and actionable error boundaries.
- Empty room data is a truthful empty state, not a hardcoded Jeju fallback.
- Room cards use text plus lock/check icon, never color alone.
- Verification navigation labels applications as unavailable until their real T04 forms exist; no disabled control suggests a submission occurred.

## Validation and privacy

- Nickname: trim, 2–20 nonblank characters.
- Bio: trim, maximum 300 characters; empty value clears it.
- Profile email and role remain only on the owner view. Future public cards use their own narrow contract.
- No exact GPS, evidence, itinerary, password hash, token, or raw Prisma shape enters frontend contracts.
- Coordinates are room metadata, not a user’s location, and are shown only as destination context.

## Files

- Add room/profile API contracts, server loaders, client profile mutation, and tests.
- Replace the T01 session placeholder home with the real room/access UI.
- Add locked room, verification guidance, and profile routes with loading/error states.
- Add responsive navigation and small brand/room/profile components.
- Extend existing global styles and README; do not add production dependencies.

## Tests and commands

- Contract tests reject malformed/private response shapes and verify cookie-bearing room/profile requests.
- Component tests cover locked room rendering, no content request, profile validation/update/conflict, navigation state, and empty/error guidance.
- Run `corepack yarn verify` in Node 20 Docker.
- Against the real running PostgreSQL/NestJS/Next.js stack, verify: register/login, Jeju metadata and `인증 필요`, locked room with no feed request, profile update persistence, navigation, and logout.
- Inspect 390x844 and 1440x900 in the in-app browser if available; otherwise report the visual-QA limitation without substituting mocks for the real flow.

## Risks

- Accidentally calling a content endpoint from the locked page could leak or create misleading UI: the T02 room loader exposes metadata only and tests requested URLs.
- Profile save can leave the header stale: refresh server components after mutation.
- Verification CTAs can become broken links or fake forms: route them to a truthful guidance page until T04 owns real submission.
- A fixed mobile nav can cover content: include bottom safe-area padding and verify the 390px viewport.
- Internal API errors must not collapse into a blank server page: add segment error boundaries with retry actions.
