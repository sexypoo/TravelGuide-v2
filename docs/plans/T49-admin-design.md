# T49 admin screens in the T42 direction

## Goal

Bring the operator screens (`/admin` verification review, `/admin/reports`,
`/admin/metrics`) into the T42/T43 system and make them readable for an
operator. Review decisions, evidence download, filters, metrics, and all API
calls stay the same.

## Problems on the current screens

- Raw enum values are shown to operators: status pills read `PENDING` and
  `APPROVED`, report rows read `COMMUNITY_POST · FALSE_INFORMATION`, the
  detail title reads `COMMUNITY_POST REPORT`, and the local proof type reads
  `WORK`.
- Decorative English eyebrows: `TRUST DESK`, `OPERATIONS SIGNAL`,
  `LOCAL CONTRIBUTION`.
- The 4.5rem page heading is far too loud for a work tool.
- The admin header, heading, and tab navigation are copy-pasted into three
  pages, and the metrics page uses a different content width, so the tabs
  shift between pages.
- Report decisions are not peers. `유지 검토` is the magenta→iris gradient
  primary, `기각 검토` is pink, and `숨김 검토` is plain text. That nudges the
  operator toward one outcome before they have read the case.
- Facts sit in tinted tiles. The placeholder uses `↖`, and the evidence button
  ends in `↓`. Metrics put a gradient bar under the first cell and color `0%`
  green and iris for no reason.

## Design pass 1: system

- Subject: deciding, case by case, who may take part in the Jeju room and
  which reported content stays visible.
- Audience: one or two operators on a laptop. Occasionally on a phone.
- Single job: scan the queue, open a case, read the evidence and facts, and
  record a decision that cannot be undone.

Color: shared tokens. Ink for text and confirming a non-destructive
decision. `--danger` for confirming a rejection or removal, and for the
`반려` state. `--success` for approved. Iris for pending, focus, and the
selected row marker. No magenta, no gradients.

Type: `--display` 2rem title. `--body` for everything else. Tabular figures
for counts, rates, and times.

Layout: one shared frame (header, title, tabs) at max 72rem on every admin
page. Review pages are master–detail: the queue (22rem) beside the case panel
on desktop, stacked on mobile.

```text
여JJU                        E2E관리자 관리자   사용자 화면   [로그아웃]
인증 심사
신청 내용과 비공개 증빙을 확인한 뒤 참여 자격을 결정하세요.
인증 심사   신고 관리   서비스 지표
─────────────────────────────────────────────────────────────────────
상태 [전체 상태 ▾]  유형 [전체 유형 ▾]  [필터 적용]

5건 · 최신 제출순            ┌──────────────────────────────────────┐
───────────────────────────  │ 현지인 신청                    심사 중 │
E2E현지인B           승인    │ E2E여행자                               │
제주 현지인 · 10월 8일 제출  │ 여행지   제주      제출 시각  …          │
───────────────────────────  │ 연고 유형 근무     위치 확인  제주 안, 42m │
▌E2E여행자          심사 중  │ 신청 메모                               │
 제주 현지인 · 10월 8일 제출 │ …                                       │
───────────────────────────  │ [비공개 증빙 다운로드]                   │
                             │ 처리 후에는 되돌릴 수 없습니다.          │
                             │ [승인 검토] [반려 검토]                  │
                             └──────────────────────────────────────┘
```

## Design pass 2: critique and revision

- Status: the pills become plain colored text with Korean labels. A pill on
  every row is the card-kit look, and color plus a word already tells the
  states apart.
- Decisions: every `… 검토` button is the same outline style, so the
  operator chooses. Color appears only on the confirm step: ink for
  approve/keep/dismiss, danger for reject/remove.
- The case panel keeps a border. It is a separate working surface next to the
  queue, not decoration. The facts inside become a plain two-column
  definition list.
- Metrics: the question → answer → resolution funnel is a real sequence. It
  stays as three steps, each with a thin bar sized to its rate, in ink, with
  no gradient. The three secondary cells become a plain definition row.
  Contributors become divided rows.
- `·` is kept in exactly one place, the row meta (`제주 현지인 · 10월 8일
  제출`), where it separates two different kinds of fact in a dense list. The
  case title and facts no longer use it.

## Files

- `frontend/src/components/admin/admin-frame.tsx` (new): shared header,
  title, and tabs
- `frontend/src/components/admin/admin-labels.ts` (new): Korean labels for
  verification status/type/proof and report status/target
- `frontend/src/components/reports/report-reason-labels.ts` (new): reason
  labels moved out of `report-menu.tsx` so admin and users share one list
- `frontend/src/components/admin/admin.module.css` (new)
- `frontend/src/app/admin/page.tsx`, `frontend/src/app/admin/reports/page.tsx`,
  `frontend/src/app/admin/metrics/page.tsx`
- `frontend/src/components/admin/verification-review-panel.tsx`,
  `frontend/src/components/admin/report-review-panel.tsx`: markup and labels.
  Button names are unchanged.
- `frontend/src/components/reports/report-menu.tsx`: import the shared labels
- `frontend/src/app/globals.css`, `frontend/src/app/mobile-app.css`:
  selector-aware prune of admin rules that no component uses any more

## Migrations

None.

## Tests

- Unit: the existing verification review panel tests (approve, reject reason
  validation). Add a label test: a pending local application shows
  `심사 중` and `근무`, not `PENDING` or `WORK`.
- Before/after captures at 390x844 and 1440x900: the queue, a local
  application with the reject step open, a report case, and metrics. Data is
  inserted into the test database only by the temporary capture spec.
- Full Playwright suite and `yarn verify`.

## Risks

- Admin screens have no committed E2E. The capture run is the browser check.
- No new dependencies, no API changes.
