# T14 browser notifications

## Goal

Add an explicit, low-noise browser notification layer on top of the existing
Socket room subscription without introducing server push infrastructure.

## Files

- Add a small notification preference/runtime module and tests under
  `frontend/src/lib/notifications/`.
- Pass the authenticated user id into `RealtimeProvider` so own events are
  suppressed at the event boundary.
- Add a room-header notification control with permission states and tests.
- Extend the existing room header CSS using the Canvas/Berry/Plum palette.
- Record the page-open notification decision in `docs/DECISIONS.md`.

## State and event contract

- Browser support: `Notification` exists on `window`.
- Preference: `localStorage['travelguide:browser-notifications'] === 'enabled'`.
- Effective state requires both the enabled preference and browser permission
  `granted`.
- Emit only when `document.visibilityState !== 'visible'`, the event author is
  not the authenticated user, and the event has passed existing event-id
  deduplication.
- Message destination: `/app/rooms/:slug`.
- Answer destination: `/app/questions/:questionId`.

## Design

- Keep the room title as the header thesis.
- Add one compact bell instrument next to the participant badge; a berry pulse
  is the sole signature motion and appears only when notifications are active.
- Use direct state copy: `알림 켜기`, `알림 사용 중`, `브라우저에서 차단됨`,
  `알림 미지원`.
- Preserve keyboard focus, touch target size, and reduced-motion behavior.

## Tests

- Unit-test permission/preference evaluation, visibility gating, own-event
  suppression, and click navigation.
- Component-test permission request and disabled states.
- Run frontend format, typecheck, tests, lint, and production build while the
  development server remains healthy in its separate `.next-dev` directory.

## Risks

- Browser notification APIs differ in older mobile browsers; unsupported is a
  stable no-op state.
- OS/browser permission cannot be reversed by the app, so denied state directs
  the user to browser settings and never calls `requestPermission` again.
- This is not background push: closing the page stops Socket delivery and must
  be stated in the UI.

