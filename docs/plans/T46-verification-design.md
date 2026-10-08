# T46 verification screens in the T42 direction

## Goal

Bring the verification overview (`/app/verifications`) and the traveler and
local application forms into the T42/T43 visual system. All MVP §9.5
behaviour stays: logical sections, file format and size guidance before
upload, consent before submit, disabled submit while sending, redirect to the
status screen, `현재 위치 확인`, only inside/outside and accuracy shown (never
coordinates), and cause-specific GPS failures.

No API, validation, or submission logic changes.

## Problems on the current screens

- Tracked labels above every heading (`나의 참여 자격`, `새 인증 신청`,
  `여행자 인증`, `현지인 인증`) and English stamps on status cards
  (`TRAVELER PASS`, `LOCAL PASS`).
- A "pass" metaphor (`제주와 연결되는 패스`, `아직 만든 패스가 없어요`) that
  the rest of the product never uses. Users apply for 인증 and get 참여 자격.
- `제주 · KR` exposes a country code. `제주 · 반경 80km` is useful, but it is
  shown as a chip far from the location step it explains.
- Form pages use the 4.5rem desktop page heading. That is far too loud for a
  form.
- The submit button is the magenta→iris gradient. T42 made ink the only
  primary treatment.
- Status cards have a gradient edge. Choice cards have icon tiles and a
  `신청 시작 →` footer. Form sections are boxed cards. Under T43 rules, cards
  are only for list items, and these are a status list, a choice list, and
  form sections.
- A pending application still renders as a link (`aria-disabled`) back to
  the same page. Screen readers announce it as a link that does nothing.
- The privacy note sits in a gray box with an icon.

## Design pass 1: system

- Subject: proving to an administrator that you are in Jeju as a traveler or
  a local, so you can ask or answer in the live room.
- Audience: travelers mid-trip on a phone, and locals. Both are wary of
  uploading documents and sharing location.
- Single job: see where your application stands, or send one with the least
  friction and the clearest privacy promise.

Color: shared tokens. Ink for text and the primary button. Muted for support
text. Iris for the approved state and focus. `--danger` for rejection and
errors. `--success` only for a confirmed location check. Magenta is not used:
nothing on these screens is live.

Type: `--display` for page titles at 2rem (2.5rem desktop), matching the
`/app` greeting. `--body` for the rest. Section titles 1.15rem.

Layout: one left-aligned column, max 45rem and centered in the app content area like `/app`. Sections
are separated by hairlines, not boxes.

```text
참여 자격
질문하려면 여행자 인증, 답변하려면 현지인 인증이 필요해요.

✓ 현지인 인증을 보냈어요                       ← only after submit
  관리자가 확인하면 여기에 바로 반영돼요.

내 인증
──────────────────────────────────────────
제주 여행자 인증                     승인 완료
2026. 10. 8. – 2026. 10. 9.
● 제출 ─ ● 심사 ─ ● 참여
──────────────────────────────────────────

새로 신청하기
──────────────────────────────────────────
여행자 인증                                 ›
일정과 예약 증빙으로 신청해요.
──────────────────────────────────────────
현지인 인증                            심사 중   ← not a link while pending
현지인 신청을 심사하고 있어요.
──────────────────────────────────────────
증빙과 정확한 위치는 공개되지 않고 관리자 심사에만 쓰여요.
```

```text
← 인증 현황
현지인 인증 신청
승인되면 제주 도움방에서 여행자 질문에 답할 수 있어요.

1  현재 위치
   제주 중심 반경 80km 안에 있는지만 확인해요.
   좌표는 화면에 표시하지 않아요.
   [ 현재 위치 확인 ]                          ← outline button
   ✓ 제주 안에서 확인했어요. 정확도 35m
──────────────────────────────────────────
2  제주와의 연결
   연고 유형 [거주 ▾]
   관계 설명                              0/300
   [                                       ]
   [ 연고 증빙 선택   JPEG, PNG, PDF, 최대 5MB ]
──────────────────────────────────────────
[ ] 위치·증빙 확인 및 개인정보 이용에 동의합니다. …
[        현지인 인증 신청하기        ]          ← ink
```

## Design pass 2: critique and revision

- First draft kept the status entries as cards because they are list items.
  But the list usually holds one or two entries, and a lone card reads as a
  hero. Revised: divided rows, like the `/app` home destination list.
  Status is right-aligned text in the state's color, with no pill.
- The 제출 → 심사 → 참여 progress is a real sequence, so it stays as an
  `<ol>`, compact under the dates. Done steps use ink and the current step
  uses iris. The old version was the same iris for everything.
- Section numbers on the forms: kept. The form is filled top to bottom, and
  the numbers tell a wary user how much is left.
- The page title says what the page is (`현지인 인증 신청`). The sentence
  that used to be the title becomes the lede and says what approval unlocks.
- The upload control keeps a dashed border. Here it is a real affordance (a
  drop target), not decoration. It moves to neutral line colors, and keyboard
  focus on the visually hidden input now shows a ring.
- `·` joins in the location result and file hint become sentences or commas.

## Files

- `frontend/src/app/app/verifications/page.tsx`: overview structure and copy.
  Pending choices are not links.
- `frontend/src/app/app/verifications/traveler/page.tsx`,
  `frontend/src/app/app/verifications/local/page.tsx`: header, no chip.
- `frontend/src/components/verifications/verification-status-card.tsx`: row
  layout, no English stamp.
- `frontend/src/components/verifications/traveler-verification-form.tsx`,
  `frontend/src/components/verifications/local-verification-form.tsx`:
  class names only, plus copy. No logic change.
- `frontend/src/components/verifications/verification.module.css` (new):
  shared by the three pages and two forms.
- `frontend/src/app/globals.css`, `frontend/src/app/mobile-app.css`: remove
  verification-only rules with a selector-aware prune. Shared classes
  (`pageHeading`, `appBackLink`, `formAlert`, `buttonSpinner`, `isDisabled`)
  stay.
- Tests: `traveler-verification-form.test.tsx`,
  `verification-form-layout.spec.ts`, `mobile-app-shell.spec.ts` (the
  verifications entry) move from class selectors to data attributes or ids.

## Migrations

None.

## Tests

- Unit: existing traveler/local form tests still pass with updated selectors.
- E2E: `verification-form-layout` (390px date fields inside the form, frame
  `overflow: hidden`, left-aligned dates), `mobile-app-shell`.
- Before/after full-page captures at 390x844 and 1440x900: overview, overview
  after submit, traveler form, traveler validation error, local form, local
  location inside Jeju, local location outside Jeju.
- `yarn verify`.

## Risks

- Global CSS removal touches grouped selectors. The prune drops only the
  selectors that name verification-only classes and keeps the rest of each
  group. The diff is audited for non-verification selectors.
- No new dependencies, no API changes.
