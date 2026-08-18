# T35 Public home gateway

## Goal

Turn `/` from a promotional landing page into the signed-out front door of the
actual product. A visitor should immediately understand that login is required,
know which service areas open afterward, and enter the auth flow without
scrolling through a sales narrative.

## Design pass 1 — signed-out service desk

### Subject, audience, and job

- Subject: the entrance to a live Jeju travel-help application.
- Audience: a returning traveler or local opening the web/native shell while
  signed out, plus a first-time user deciding whether to create an account.
- Single job: move into login while preserving enough context to choose where
  to continue after authentication.

### Tokens and type

- Arrival Canvas `#f4f6f8`, Surface White `#ffffff`, Decision Ink `#191f28`,
  Utility Gray `#6b7684`, Guide Violet `#6257d9`, and Live Green `#00a27a`.
- Wanted Sans carries the restrained 34–44px welcome and 18px destination
  titles; Pretendard carries 15–16px explanations; SUIT carries 12px service
  state and route metadata.

### Layout

```text
┌ 여JJU                                             로그인 ┐
│                                                        │
│ 안녕하세요                         로그인 후 이용할 메뉴 │
│ 여행지의 지금을 함께 확인해요      ┌ 제주 도움방      › ┐ │
│ 짧은 제품 설명                     ├ 커뮤니티          › ┤ │
│ [ 로그인 ]  계정 만들기            └ 참여 인증         › ┘ │
│ 인증 ─ 질문 ─ 답변                                      │
│                                                        │
│ ● 서비스 정상                    안전 안내              │
└────────────────────────────────────────────────────────┘
```

The signature is the compact `인증 ─ 질문 ─ 답변` route line. It is not a
feature-card section: it acts like an arrival board showing how access flows
through the service.

## Design pass 2 — critique and revision

A centered login card alone would look like a generic SaaS auth splash, while
replacing the old hero with another two-column illustration would preserve the
landing-page problem. The revision uses a flat signed-out dashboard: restrained
welcome copy on the left, real post-login destinations on the right, and no
decorative mock conversation or halo.

The deliberate aesthetic risk is removing the existing hero artwork, gradients,
trust pills, three feature cards, and promotional footer completely. Brand color
is reserved for the login decision and the route line; all destination rows use
quiet white surfaces and hairlines. The exact MVP headline survives as modest
supporting copy rather than the largest marketing claim.

## Files

- `frontend/src/app/page.tsx`: signed-out gateway content and safe login links.
- `frontend/src/app/globals.css`: public-home layout, interaction, and responsive
  treatment without changing auth or app shells.
- `frontend/src/app/page.test.tsx`: signed-out links and authenticated redirects.
- `frontend/e2e/public-home.spec.ts`: real browser geometry, hierarchy, targets,
  safe next paths, and screenshots at 390x844 and 1440x900.
- `docs/MVP_FUNCTIONAL_SPEC.md`, `docs/ACCEPTANCE_TESTS.md`,
  `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, and `docs/RELEASE_NOTES.md`:
  replace the landing-page boundary with the public gateway decision.

## Migrations and dependencies

- No migration, API, auth contract, or dependency change.
- Existing cookie-based redirect and `safeNextPath` handling remain authoritative.

## Verification

1. Run the public-home unit test plus focused lint and TypeScript.
2. Render and inspect 390x844 and 1440x900 screenshots.
3. Run complete frontend verification and real-stack Playwright.
4. Deploy only the Vercel frontend; leave the Railway frontend untouched.

## Risks

- Public links must not imply room access without authentication and must carry
  only internal safe `next` paths.
- The compact home must preserve the MVP safety disclaimer and required
  three-step concept without becoming another long landing page.
- Shared legacy landing styles remain used by preorder/auth elements in parts;
  new selectors must be scoped instead of deleting shared rules blindly.

## Results

- Replaced the decorative landing composition with a signed-out app gateway:
  login is primary, registration is secondary, and three real service entries
  preserve internal post-login destinations.
- Kept the MVP headline, authentication-question-answer sequence, live service
  state, and emergency disclaimer inside the first viewport without marketing
  cards, mock conversations, or a long footer.
- Inspected 390x844 and 1440x900 screenshots after two visual passes. The second
  pass reduced the desktop heading to 44px, top-aligned the dashboard content,
  and fixed Korean flow labels so they never break vertically.
- Complete `corepack yarn verify` passed: formatting, ESLint, TypeScript, 57
  Jest suites with 137 tests, coverage gates, and the Next.js 15.5.21 build.
- Complete real-stack Playwright passed: 6 tests in 1.1 minutes against
  PostgreSQL, NestJS, Next.js, and Socket.io. The two new public-home scenarios
  assert a single-viewport layout, safe login links, 44px+ targets, no legacy
  hero, and no horizontal overflow at both required viewport sizes.
- No dependency, migration, API, auth contract, Railway frontend, or native
  package change was required.
