# T17 public contributor profile

## Goal

Turn the existing minimal public-user endpoint into a visible trust surface for
answer contributors without introducing ratings, rankings, or a fixed account
type. Any contributor can have activity counts; a currently valid local
verification adds destination context.

## Backend

- Extend the explicit public response with `bio`, `joinedAt`, and `stats`.
- Count only answers with `removedAt = null`.
- Count accepted answers only when the accepted answer and its question are both
  visible. Keep the existing valid-local-verification lookup.
- Keep the route authenticated and never select email, evidence, GPS, reviewer,
  or admin fields.

## Frontend

- Add a runtime-validated public profile client/server contract.
- Add `/app/users/[id]` as a protected server-rendered route with explicit error
  recovery.
- Link visible answer authors to the profile.
- Design direction: blush-white canvas, ink text, magenta-to-violet path line,
  compact statistic cells, and a destination verification ticket. Existing app
  typography remains to avoid a global visual regression.

## Tests and validation

- Backend service tests cover visible and hidden contribution filters.
- Response and frontend parser tests cover the public contract.
- Run backend/frontend format, typecheck, unit tests, lint, and production build.

## Risks

- Counts are queried at request time and may need caching at larger scale; pilot
  volume does not justify stored counters.
- A public activity count can be mistaken for quality. The UI labels it as
  contribution history and does not calculate a score or rank.
