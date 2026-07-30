# T01 frontend authentication plan

## Goal and scope

Implement only the frontend half of T01 in `frontend/`: a real landing page, register/login flows backed by the existing NestJS cookie-auth API, authenticated user/admin shells, session-expiry UX, and the shared visual foundation for later app routes. Do not change `backend/` or begin profile, destination, room, or verification UI.

## Previous-task verification

- Frontend T00 is committed as `5e8ac87` and provides the Next.js 15 scaffold, same-origin API rewrite, environment validation, health diagnostic, and baseline tests.
- Backend T01 is committed as `8e63536` and exposes register, login, logout, and current-user endpoints with an httpOnly `tg_access` cookie.
- Backend T02 is already present, but this frontend slice deliberately consumes only the T01 auth contract.

## Design direction

Use the agreed **Jeju Signal** direction: quiet neutral app surfaces, large Korean typography, generous spacing, and one restrained magenta-to-purple signal treatment.

- Core palette: ink `#191F28`, muted `#6B7684`, canvas `#F7F8FA`, surface `#FFFFFF`, magenta `#E93CAC`, purple `#7C3AED`.
- Display stack prefers Wanted Sans; body stack prefers Pretendard/SUIT with safe Korean system fallbacks. No network font dependency is added in this slice.
- The signature `Signal Halo` appears in the landing/auth context panel and active primary action only. Cards and page backgrounds stay neutral.
- Mobile uses a single-column app flow; desktop uses a calm split auth layout. Content remains usable at 390x844 and 1440x900.
- Motion is limited to one entrance sequence and signal pulse, with `prefers-reduced-motion` support.

The current T00 grid, condensed editorial type, hard borders, and monospace decoration are removed because they conflict with the requested clean app character. Location/signal identity is retained through the halo rather than decorative coordinates everywhere.

## Routes and behavior

- `/`: product landing with required headline, three-step explanation, start CTA, emergency disclaimer, and real API health status.
- `/auth/register`: email, password, nickname, required terms agreement, client validation matching the backend, stable duplicate-field messages, pending state, and automatic navigation to `/app` after the backend sets the cookie.
- `/auth/login`: email/password, invalid-credential message, pending state, safe `next` handling, and navigation to the requested protected route.
- `/app`: server-validated authenticated shell with the user nickname and logout. No T02 room/profile content is introduced.
- `/admin`: server-validated admin shell. Anonymous users go to login; ordinary users return to `/app`.

Protected pages validate the cookie against `/api/v1/auth/me`; checking only for cookie presence is insufficient. A missing or expired session redirects to `/auth/login?next=...`. Browser API calls always use relative URLs and `credentials: include`; no token is stored or exposed to JavaScript.

## Components and modules

- Explicit current-user and Problem Details parsers at the API boundary.
- Browser auth client for register/login/logout.
- Server-only current-user loader and route requirements.
- Shared auth form shell, field/error components, signal illustration, wordmark, and logout action.
- CSS design tokens and responsive component styles in the existing global stylesheet; no new production dependency.

## Validation and accessibility

- Email is trimmed/lowercased and validated.
- Password is 10–72 characters with at least one ASCII letter and number during registration.
- Nickname is trimmed, nonblank, and 2–20 characters.
- Terms agreement is required.
- Labels remain visible, field errors are associated with inputs, submission status uses `aria-live`, keyboard focus is visible, and errors say how to recover.
- Inputs use appropriate autocomplete attributes; the password is never logged or persisted.

## Tests and commands

- Unit tests cover response parsing, cookie-bearing API requests, stable Problem Details mapping, and validation boundaries.
- Existing health tests remain green.
- Run `corepack yarn verify` under the supported Node 20 Docker build environment if host Node differs.
- Run the real backend, PostgreSQL, and frontend; verify register, logout, login, expired/missing session redirect, and ordinary-user admin redirect without API interception.
- Visually inspect 390x844 and 1440x900 in a real browser, including focus, validation, pending/error feedback, and reduced-motion-safe behavior.

## Risks

- An httpOnly cookie cannot be read by the frontend: session truth must come from `/auth/me` and requests must stay same-origin.
- Server-side auth fetches can lose cookies unless the incoming cookie header is forwarded explicitly.
- An unchecked `next` parameter can create an open redirect: accept only local single-slash paths.
- Backend validation messages are technical English in some cases: map stable error codes and use client-side Korean recovery guidance without hiding unknown server errors.
- Authenticated shells must not invent destination or verification data before the corresponding frontend task.
