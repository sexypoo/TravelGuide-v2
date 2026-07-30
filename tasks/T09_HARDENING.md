# T09 — Security, error handling, health, and observability

## Goal

Reduce presentation and privacy risk without adding product scope.

## Read first

- Security section 13
- Non-functional section 14
- SAFE-002
- Definition of Done

## Required work

- Rate limits by endpoint category
- Security headers and safe CORS
- Environment validation and production secret checks
- `/health/live`, `/health/ready`
- Structured logger and requestId
- Ensure private fields and coordinates never appear in logs/responses
- Consistent frontend Korean error mapping
- Retry and disconnected UI polish
- Accessibility audit for critical flow
- Dependency audit and removal of unused packages
- Verify file response headers and admin authorization

## Constraints

- Do not add an external monitoring vendor.
- Do not refactor working feature architecture for style.
- Do not add P1 product features.

## Acceptance

- E2E-026 and health portions of E2E-028
- Production starts only with valid env
- Logs contain requestId and duration, not secrets
- Rate limit errors are visible and actionable
- `yarn verify` passes before moving to T10

