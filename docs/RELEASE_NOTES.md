# 여쭈어 (여JJU) release candidate notes

## 2026-08-17 mobile room viewport

- Fixed clipped chat/topic content and unstable document scrolling in mobile
  browsers and the Capacitor WebView.
- Room detail pages now follow the current visual viewport during browser chrome
  and software-keyboard resizing, while the message timeline or topic rail owns
  vertical scrolling and the composer remains visible.
- Preserved readers' position in older messages while keeping bottom-following
  readers at the latest message after viewport and content-size changes.
- Added real-stack Playwright coverage for 390x844, a compact 390x640 viewport,
  internal chat/topic scrolling, fixed document scroll, and a visible composer.

## 2026-08-17 mobile packaging

- Added an isolated Capacitor 8.5 Android/iOS project under `mobile/` without
  changing or redeploying the existing web/API applications.
- Generated branded adaptive Android icons, iOS AppIcon, light/dark splash
  assets, native location permission declarations, and an iOS privacy manifest.
- Built an installable Android debug APK, an unsigned Play release AAB, and an
  unsigned iOS Simulator app; installed and launched the iOS app successfully on
  an iPhone 17 Pro Simulator.
- Store signing remains owner-controlled: Google Play requires an upload
  keystore and Apple distribution requires an enrolled Developer Team and App
  Store Connect record.
- Production store submission remains blocked until the existing product adds
  in-app account deletion, an external deletion-request URL for Google Play, and
  a public privacy-policy URL.

- Next.js와 eslint-config-next를 Vercel 배포 차단 대상인 15.5.2에서 공식
  Maintenance LTS 보안판 15.5.21로 올리고 전체 프론트엔드 검증을 통과했다.

## Candidate status

Not released or tagged. Repository verification, including three consecutive
browser E2E runs, is complete, but the real HTTPS deployment, physical mobile
check, reboot recovery, backup recording, and three consecutive manual
rehearsals remain mandatory.

## Product capability

- Public Jeju-pilot preorder registration with explicit consent, minimal
  PostgreSQL storage, idempotent duplicate handling, and no applicant-list API.
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

- T27 focused evidence: 2 backend unit tests, 7 real-PostgreSQL integration
  tests, and 7 frontend focused tests passed; both production builds passed.
- Backend: 33 unit suites/92 tests and 12 PostgreSQL integration suites/40 tests.
- Frontend: 55 suites/131 tests with global coverage gate at 55/59/57/56 for
  statements/branches/functions/lines.
- Backend combined coverage is 85.85/64.73/85.19/86.55 with a gate at
  80/60/75/80 for statements/branches/functions/lines.
- Playwright's two real-stack multi-context/mobile scenarios passed three
  consecutive Chromium runs in 36.4s, 38.0s, and 33.5s on 2026-08-15.

Exact final results, candidate revision, domain, device, and rehearsal timestamps
must be copied into `docs/PRESENTATION_CHECKLIST.md` before tagging.
