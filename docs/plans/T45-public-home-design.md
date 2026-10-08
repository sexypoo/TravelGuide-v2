# T45 public home in the T42 direction

## Goal

Bring the signed-out home (`/`) into the same visual system as the
authenticated home and core screens, keeping every T35 / MVP §9.3 constraint:
login is the first action, registration is secondary, the three app
destinations are previewed and route through login, the MVP headline and the
verification → question → local answers sequence stay in the first viewport,
service health and the emergency disclaimer remain, and nothing scrolls at
390x844 or 1440x900.

## Problems on the current page

- It uses a separate palette (`#f4f6f8` canvas, `#191f28` text, `#6b7684`
  gray) that appears nowhere else in the product. Signing in visibly switches
  to a different app.
- `JEJU LIVE HELP` is a decorative all-caps English label above the heading.
- The MVP headline `여행이 틀어지는 순간, 지금 그곳을 아는 사람에게 묻다.` is
  demoted to gray body text under an instruction (`로그인하고, 여행지의 지금을
  확인하세요.`), which is the button's job, not the headline's.
- The primary button is an iris fill with an appended arrow. T42/T43 made ink
  the only primary treatment.
- The sequence is dots joined by lines with one-word labels. It is a real
  sequence, but it reads as decoration and does not say who answers.
- The destinations sit in a shadowed card with tinted icon tiles and a label
  above the heading (`로그인 후 이용할 수 있어요`). T42 replaced this with
  divided rows.
- The footer is two boxed pills. It is chrome, not content.
- All of it lives in `globals.css` (about 470 lines).

## Design pass 1: system

- Subject: a live help room where verified travelers and locals in Jeju answer
  what is happening right now.
- Audience: Korean travelers on a phone, often mid-trip, who are not signed in.
- Single job: sign in (or create an account) and know what opens afterwards.

Color: shared tokens only. `--canvas #fff9fb`, `--ink #282531` (text and the
one primary button), `--muted #625c69`, `--line`, `--purple #675dda` for focus.
Magenta is not used: this page has no live state to signal.

Type: `--display` (Wanted Sans) for the headline and the place name,
`--body` (Pretendard) for everything else. Headline 2rem mobile / 2.75rem
desktop, tight leading (1.2), weight 800. Body 1rem / 1.6.

Layout: left-aligned. Mobile is one column. Desktop is two columns (headline
and actions | destinations) inside 70rem.

```text
여JJU                                       [로그인]

여행이 틀어지는 순간,                  로그인하면 이어지는 곳
지금 그곳을 아는 사람에게 묻다.        ─────────────────────────────
인증된 여행자와 현지인이                제주                          ›
제주의 지금을 알려줘요.                 실시간 도움방 · 인증 후 질문
                                       ─────────────────────────────
[        로그인        ]               여행자 커뮤니티               ›
처음이신가요? 계정 만들기               인증 없이 묻고 나눠요
                                       ─────────────────────────────
① 여행자·현지인 인증                    여행자·현지인 인증            ›
② 제주방에 질문                         도움방 참여 자격을 신청해요
③ 여러 현지인이 답변                    ─────────────────────────────
─────────────────────────────────────────────────────────────────
● 서비스 정상 연결   긴급 구조·의료는 119 등 공식 기관에 먼저…   개인정보 처리방침 계정 삭제
```

## Design pass 2: critique and revision

- The first draft put a giant `제주` above the headline, like the
  authenticated home's room panel. Here that would be the oversized hero that
  T35 forbids, and the headline is about the moment, not the place. Revised:
  the place name stays the bold element only inside the room row (display
  face, 1.75rem). It is the one element that echoes the signed-in home, so the
  first thing seen after login is already familiar.
- Numbered steps: kept, because this content really is an ordered sequence.
  Each step now names who acts (`여러 현지인이 답변`), which is the
  differentiator the old one-word labels hid. The numbers come from CSS
  counters on an `<ol>`, not text.
- Icon tiles in the rows: removed. They repeat the titles and are the generic
  card-kit look. The rows keep only the chevron, like the T42 home.
- `→` in the button: removed. The button says what it does.
- Footer: one quiet line above a hairline. The status keeps its dot because
  that dot is real state (API health). Under 760px it wraps to two lines.
- `·` in the room row meta: replaced by two short sentences. The middle-dot
  join is a template tell, and the two facts read better as a sentence.

## Files

- `frontend/src/app/page.tsx`: new structure and copy. Same routes and `next`
  paths.
- `frontend/src/app/public-home.module.css` (new): page-scoped styles.
- `frontend/src/app/globals.css`: remove every `.guestHome*` rule (classes no
  longer exist).
- `frontend/src/app/page.test.tsx`, `frontend/e2e/public-home.spec.ts`: new
  heading text. Selectors move from class names to ids/roles. Background
  assertion becomes the shared canvas `#fff9fb`.

## Migrations

None.

## Tests

- Unit: heading is the MVP headline; two login links; register link;
  destination `next` paths; the sequence list names the three steps.
- E2E `public-home.spec.ts` at 390x844 and 1440x900: no horizontal overflow,
  no vertical scroll, heading 32–45px, primary ≥ 48px, rows ≥ 64px, footer
  inside the viewport.
- `yarn verify`; screenshots before/after at both viewports.

## Risks

- Height budget at 390x844 is tight with the headline now on three lines.
  Spacing is tuned against the E2E no-scroll assertion.
- Heading text changes; any external doc quoting the old heading is updated.
- No new dependencies, no API changes.
