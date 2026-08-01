# T09 — security, health, errors, and observability plan

## Goal

Reduce presentation, privacy, and recovery risk around the completed P0 flows
without changing product behavior or introducing an external monitoring vendor.

## Current gaps

- Request ids exist in responses, but successful requests have no duration/user
  log and Nest output is not JSON structured.
- `/health/live` exists; `/health/ready` does not verify PostgreSQL.
- Exact CORS origin is configured only in `main.ts`; security headers are absent
  from both API and Next responses.
- The four SAFE-002 rate categories are not enforced.
- Production env validation checks the placeholder JWT and S3 driver, but does
  not reject short secrets, URL credentials, wildcard/non-origin web URLs, or
  non-HTTPS public origins.
- Backend problem details are Korean, but frontend fallback/rate-limit mapping
  is repeated. Keyboard focus styles omit textarea/select, and disconnected copy
  does not distinguish offline from reconnecting.

## Backend changes

- Add a global security-header middleware and strict exact-origin CORS helper.
- Add a minimal JSON `LoggerService` and extend request-id middleware to emit
  only timestamp, level, requestId, method, path (without query), status,
  durationMs, and authenticated userId when available. Never log headers,
  cookies, bodies, evidence keys, coordinates, or URLs.
- Add `GET /health/ready` backed by `SELECT 1`, returning 503 Problem Details
  when PostgreSQL is unavailable while keeping `/health/live` process-only.
- Add an in-memory fixed-window rate-limit service/guard with exact SAFE-002
  limits: login IP 5/min, topic user 5/10min, answer user 20/10min, report user
  10/hour. Return `429 RATE_LIMIT_EXCEEDED` and `Retry-After`.
- Rate limiting is active in development/production. It is bypassed only when
  `NODE_ENV=test` so existing real-DB suites sharing one loopback IP do not
  contaminate one another; limit arithmetic and guard response behavior receive
  isolated unit tests.
- Harden production environment checks and add regression tests.
- Verify admin evidence remains guarded and carries no-store, nosniff,
  same-origin, and safe content-disposition headers.

## Frontend changes

- Add equivalent Next security headers, with a production-compatible same-origin
  CSP that permits the existing Socket connection and no third-party content.
- Centralize actionable Korean mappings for rate-limit, session expiry, server,
  and network errors while preserving feature-specific validation messages.
- Distinguish offline/reconnecting room copy and keep REST retry controls.
- Extend visible keyboard focus and font inheritance to textarea/select; link
  async errors with form controls where missing and support Escape/initial focus
  in the report dialog.
- Strengthen server env parsing against credentials and non-origin paths.

## Tests and verification

- Unit: environment edge cases, limiter windows/retry, JSON log redaction shape,
  ready health success/failure, frontend problem mapping, frontend env parsing.
- Integration: live/ready, request id, security headers, CORS allow/deny, 503
  readiness, ordinary-user admin denial, and evidence response headers.
- Run dependency audits for frontend/backend and inspect direct imports before
  removing anything. Do not upgrade pinned versions in T09.
- Run both Node 20 `verify` commands, database validation, production builds,
  and live same-origin health/header/error checks.

## Risks

- In-memory counters are per API process and reset on restart. This is acceptable
  for the fixed single-instance presentation deployment; multi-instance release
  requires a shared limiter.
- A CSP that is too strict can break Next hydration or Socket reconnect. Keep it
  same-origin, test the production build, and avoid adding external sources.
- Logging arbitrary exception objects could leak data. Only exception names and
  server-side stacks are retained; request metadata is allow-listed.
