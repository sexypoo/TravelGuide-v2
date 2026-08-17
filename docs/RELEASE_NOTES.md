# 여쭈어 (여JJU) release candidate notes

## 2026-08-18 chat surface and place modal

- Expanded the desktop room to a compact 16px outer gutter and bottom-settled
  short conversations above the composer.
- Replaced bordered signal-heavy text bubbles with neutral received bubbles and
  a single-color sent surface while preserving mobile readability minimums.
- Rebuilt room topics as question-first white cards with one sentence-like
  context line, one byline/answer footer, and a compact secondary share action.
  Normal urgency is omitted and same-day timestamps use a short `오늘` label.
- Moved place selection into a document-level modal with search-first focus,
  focus containment, Escape and backdrop closing, map/result panes, and a
  selected-place footer on desktop and mobile.

## 2026-08-18 responsive room refinement

- Removed the unexplained mobile chat gutter and decorative signal rail so the
  focused room now fills the device without horizontal overflow.
- Removed the generated purple underline from both mobile room modes while
  preserving clear selected and keyboard-focus states.
- Rebuilt live-topic cards around the question, one concise status, a ruled
  metadata footer, and an attached share action instead of competing pills.
- Gave desktop chat its own conversation heading, readable message measure, and
  denser pointer-oriented composer rather than scaling up the mobile surface.

## 2026-08-18 chat room readability

- Reworked the focused room as a high-contrast field conversation with clear
  sender/time rows, distinct sent and received surfaces, and readable 15px+
  message copy.
- Raised mobile room metadata, composer text, and touch targets to explicit
  readability minimums while preserving the fixed composer and internal
  message/topic scrolling.
- Improved live-topic cards and mode switching with the same paper, ink,
  magenta, and iris hierarchy used across the native-feeling app shell.
- Hardened compact viewport resizing against a temporarily stale
  `visualViewport.height` and added real-stack checks at 390x844, 390x640, and
  1440x900.

## 2026-08-17 mobile app readability

- Replaced the mobile floating navigation pill with a safe-area-aware,
  full-width route deck that stays flush with the viewport at either scroll
  boundary.
- Reduced excessive page-top whitespace and introduced a higher-contrast mobile
  type scale for home, community, nearby, profile, verification, and saved-place
  pages while preserving the room focus layout.
- Raised primary mobile copy, utility labels, form controls, and touch targets to
  explicit readability and accessibility minimums.
- Added real-stack Playwright coverage for stable navigation geometry, content
  reserve, readable copy, horizontal overflow, and the unchanged desktop shell.

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
