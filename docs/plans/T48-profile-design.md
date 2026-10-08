# T48 profile and saved places in the T42 direction

## Goal

Bring `/app/profile` (public profile form, travel records, account
management) and `/app/saved-places` into the T42/T43 system. Profile saving,
avatar upload and removal, travel record CRUD, account deletion, and
favorites removal keep their current logic and API calls.

## Problems on the current screens

- Tracked labels above headings: `내 정보`, `MY JOURNEY`, `ACCOUNT`,
  `다시 가고 싶은 곳`, and `찜한 장소` repeated above every saved place.
- The initial avatar appears twice: once in the identity card and again in
  the photo editor directly below it.
- `일반 사용자` exposes a role value that tells the user nothing.
- Cards are nested inside cards: the public-info card holds a photo card and
  a travel-style card, the records card holds a record card, and the account
  card holds a deletion box. Shortcuts are icon-tile cards.
- The shortcut `지역 인증` contradicts the `참여 자격` naming from T46.
- The page heading uses the 4.5rem desktop size.
- Travel records sit on a timeline whose magenta dot implies live state.

## Design pass 1: system

- Subject: the traveler's own account. Who others see in the room, and what
  they keep for themselves.
- Audience: a signed-in traveler or local, usually on a phone.
- Single job: change what others see, and find personal lists and account
  controls without hunting.

Color: shared tokens. Ink for text and the save button. Muted for support
text. Iris for selected travel styles and focus. `--danger` only inside
account deletion. No magenta.

Type: `--display` 2rem/2.5rem title, 1.25rem section titles, `--body`
elsewhere.

Layout: one column, max 45rem, centered like `/app`. Hairline-separated
sections, each with a plain `h2` and a one-line description.

```text
프로필
traveler@e2e.local로 2026년 10월 8일에 가입했어요.
이메일은 다른 사용자에게 보이지 않아요.
──────────────────────────────────────────
찜한 장소                                   ›
참여 자격                                   ›
──────────────────────────────────────────
공개 정보
질문과 답변에서 다른 사용자에게 보이는 정보예요.
 (E)  프로필 사진  [사진 선택] [사진 지우기]
      JPEG, PNG, WebP 파일, 최대 5MB
 닉네임                                  6/20
 [E2E여행자                               ]
 나의 여행 스타일        최대 5개, 0개 선택
 [🍜 맛집 탐방] [🌿 느린 여행] …               ← toggle chips stay
 짧은 소개                               0/300
 [                                         ]
 [ 변경 내용 저장 ]
──────────────────────────────────────────
나의 여행 기록                      [+ 기록 추가]
나에게만 보여요.
 봄날의 제주                     4월 2일 – 4월 5일
 제주
 새벽 오름에서 본 일출이…                수정 삭제
──────────────────────────────────────────
계정 관리
개인정보 처리방침 · 삭제 안내 links
[계정 삭제 살펴보기]
```

## Design pass 2: critique and revision

- The identity card is removed. Its facts (email, join date, email privacy)
  become the lede, and the photo editor is the only avatar on the page.
- The shortcuts become divided rows with no icon tiles, using the T46 name
  `참여 자격`.
- The travel-style chips are kept: they are real toggle controls. They are
  flattened (no inner card), and the selected state uses an ink border and
  an iris check, not a fill.
- The records timeline is dropped. Records are divided rows: title and dates
  on the first line, destination, note, then edit/delete as text buttons.
  The magenta dot goes, since nothing here is live.
- Account deletion stays behind `계정 삭제 살펴보기`, now a plain text-style
  button. Danger red appears only once the destructive form is open.
- Saved places become divided rows: name, address, `지도에서 보기` and
  `찜 해제`. The per-item `찜한 장소` label and pin tile are removed.
- The `·` in the photo hint becomes a comma.

## Files

- `frontend/src/app/app/profile/page.tsx`, `frontend/src/app/app/saved-places/page.tsx`
- `frontend/src/components/profile/profile-form.tsx`,
  `frontend/src/components/profile/travel-records-panel.tsx`,
  `frontend/src/components/profile/account-deletion-panel.tsx`,
  `frontend/src/components/places/saved-places-list.tsx`: markup and class
  names only
- `frontend/src/components/profile/profile.module.css` (new)
- `frontend/src/app/globals.css`, `frontend/src/app/mobile-app.css`:
  selector-aware prune of profile, travel-record, account-deletion, and
  saved-place rules, plus `pageHeading` (no remaining users)
- `frontend/e2e/mobile-app-shell.spec.ts`: profile and saved-places entries
  move to ids

## Migrations

None.

## Tests

- Unit: existing profile form, travel records, and account deletion tests.
- E2E: `mobile-app-shell`, `account-deletion`.
- Before/after captures at 390x844 and 1440x900: profile, record form open,
  profile with a record and deletion expanded, saved places.
- `yarn verify`.

## Risks

- `account-deletion.spec.ts` drives the deletion flow by role and label, so
  labels and button names are kept verbatim.
- No new dependencies, no API changes.
