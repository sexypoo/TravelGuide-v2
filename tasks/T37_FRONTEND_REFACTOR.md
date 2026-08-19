# T37 — Frontend structural refactor

## Goal

Improve maintainability across the frontend without changing product behavior,
visual design, public routes, API contracts, or dependencies.

## Required work

- Centralize repeated browser API request behavior and runtime response guards.
- Separate realtime transport protocol parsing from React lifecycle and cache
  coordination.
- Move static preorder presentation data out of the route component.
- Preserve existing accessibility, loading, empty, error, and retry states.
- Add focused regression tests for the new shared boundaries.

## Out of scope

- Product, copy, or visual redesign.
- Backend, database, migration, auth, or Socket event contract changes.
- Dependency upgrades or new production packages.
- Mechanical splitting of global CSS without a selector ownership migration.

## Acceptance

- Existing frontend behavior and snapshots remain unchanged.
- Shared request and parser utilities are covered by focused tests.
- Realtime provider retains join/leave, reconnect, dedupe, notification, and
  cache update behavior.
- Frontend format, lint, typecheck, tests, coverage, and production build pass.
- Core public and room surfaces remain sound at 390x844 and 1440x900.
