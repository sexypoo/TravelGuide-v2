# TravelGuide v2 release candidate notes

## Candidate status

Not released or tagged. Repository verification, including three consecutive
browser E2E runs, is complete, but the real HTTPS deployment, physical mobile
check, reboot recovery, backup recording, and three consecutive manual
rehearsals remain mandatory.

## Product capability

- Account registration, secure cookie login/logout, profile editing, and public
  contributor profiles.
- Evidence-based traveler/local verification with administrator review and
  private file access.
- Destination-neutral account community for posts, comments, and reports.
- Verified group room with text, protected image, confirmed place, and shared
  topic cards.
- Structured topics, traveler/local answers, live waiting summaries, protected
  topic/answer images, acceptance, resolution, expiry, and reporting.
- Socket.io live updates, reconnect refetch, duplicate-event protection,
  new-message follow behavior, and opt-in browser notifications while open.
- Administrator verification, moderation, and service metrics screens.

## Operational capability

- PostgreSQL migrations and idempotent base/demo seeds.
- Production-only private S3 adapter with encrypted object writes and
  authenticated API streaming; no public object URLs.
- Same-origin HTTPS Nginx template with WebSocket upgrade and 12 MiB upload
  ceiling.
- PM2 process definitions for one NestJS API and one Next.js web process.
- Production environment validation, guarded production demo seed, health/login/
  secure-cookie/WebSocket room-join smoke, and rollback runbook.

## Automated evidence

- Backend: 27 unit suites/71 tests and 9 PostgreSQL integration suites/37 tests.
- Frontend: 37 suites/90 tests with global coverage gate at 55/59/57/56 for
  statements/branches/functions/lines.
- Backend combined coverage is 85.23/62.85/84.24/85.96 with a gate at
  80/60/75/80 for statements/branches/functions/lines.
- Playwright's two real-stack multi-context/mobile scenarios passed three
  consecutive Chromium runs after aligning waiting-topic fixtures with the
  structured observation contract.

Exact final results, candidate revision, domain, device, and rehearsal timestamps
must be copied into `docs/PRESENTATION_CHECKLIST.md` before tagging.
