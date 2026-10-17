# Autopilot agent team

A scheduled Claude task runs this playbook once a day without the owner. It
improves TravelGuide one GitHub issue at a time. `CLAUDE.md` applies in
full; where this file is stricter, this file wins.

Changing this file, `CLAUDE.md`, `AGENTS.md`, `.claude/**`, `.github/**`, or
the source-of-truth docs (`docs/PRODUCT.md`, `docs/MVP_FUNCTIONAL_SPEC.md`,
`docs/ACCEPTANCE_TESTS.md`, `docs/ARCHITECTURE.md`) is never auto-merged.
The owner reviews every change to the rules and the product scope.

## Team

| Role | Subagent | Output |
| --- | --- | --- |
| Planner | `planner` | One GitHub issue with the plan, or `idle` |
| Designer | `designer` | Design section for the plan (UI changes only) |
| Developer | `developer` | Branch, code, tests, passing checks |
| Reviewer | `reviewer` | `approve` or `hold` with reasons |

The main session is the lead. It runs the steps below in order, hands each
subagent the previous step's output, and writes the report.

## Run steps

### 0. Preflight

1. Start from an up-to-date `origin/main`.
2. Check production:
   - `curl -fsS https://travelguide-v2-production.up.railway.app/api/v1/health/ready`
   - `curl -fsS -o /dev/null -w '%{http_code}' https://www.travelguide.kr`
   If either fails and an `autopilot/*` PR merged in the last 48 hours, open a
   revert PR on `autopilot/revert-<pr#>`, report it as **urgent**, and stop.
   If it fails with no recent autopilot merge, report it and stop.
3. List open `autopilot/*` PRs. If 5 or more are open, do not start new work:
   report the queue and stop. If 3 or more carry `autopilot:needs-owner`,
   only pick work that stays inside the auto-merge paths.
4. If an open autopilot PR has `autopilot:ci-failed`, fixing it is today's
   work (push to its branch) instead of planning something new.

### 1. Plan (planner)

Pick at most one piece of work, in this priority:

1. Open issues labeled `autopilot:idea` (the owner's requests), oldest first.
2. Open issues labeled `bug`, failing CI on `main`, and items in
   `docs/KNOWN_LIMITATIONS.md` that can be fixed in code.
3. The "지금 우선순위" list in `docs/PRODUCT.md`: broken or blocked flows,
   mobile usability and accessibility, and gaps between a requirement ID in
   `docs/MVP_FUNCTIONAL_SPEC.md` / `docs/ACCEPTANCE_TESTS.md` and the code.
4. Tests for untested paths in the core flow (verify → enter room → topic →
   answer → accept).

Never build anything listed under "하지 않는 것" in `docs/PRODUCT.md`. A new
product idea goes into an `autopilot:proposal` issue instead of code.

**Quality bar.** Work qualifies only if the planner can name, with a file
and line, one of:

- a problem a user hits (bug, blocked flow, unreadable or broken screen);
- a mismatch between a requirement ID or acceptance scenario and the code;
- an untested path in the core flow.

"It could look nicer" does not qualify. Do not rework a screen or file
changed in the last 30 days (`git log --since=30.days`) unless it has a real
bug. Doing nothing is better than churn.

**Idle day.** If no candidate passes the bar:

1. Open no branch and no PR.
2. Open at most 2 `autopilot:proposal` issues with new ideas (problem,
   who it helps, rough scope, why it is outside the current scope). Skip any
   idea that duplicates an open issue.
3. Report with status 💤 and what was checked.
4. If the last two `Autopilot log` comments were also 💤 (three idle days in
   a row), say so in the report: "할 일이 바닥났어요. 새 방향이 필요해요",
   and list all open `autopilot:proposal` issues. From then on, while idle,
   only run preflight and report; do not open more proposals until an
   `autopilot:idea` issue appears or the owner acts on a proposal.

Prefer work that fits the auto-merge rules below and that a reviewer reads
in 10 minutes.

**Issue.** Use the existing issue when the work came from one; otherwise
create it. Add `autopilot:in-progress`. The issue body (or a comment on an
owner's issue) holds the plan: goal, evidence (file:line), files, tests,
risks, and whether it is small or large as defined in `CLAUDE.md`. Large
work also gets `docs/plans/<issue#>-<slug>.md`.

### 2. Design (designer, UI work only)

The designer adds a "Design" section to the plan: layout at 390x844 and
1440x900, tokens and components used, loading/empty/success/error states,
and exact Korean copy. No new colors, fonts, or dependencies.

### 3. Build (developer)

Branch: `autopilot/<issue#>-<slug>` from `origin/main`.

The developer implements the plan, adds or updates tests, and runs the
affected app's checks from its directory:

```bash
yarn install --immutable
yarn lint
yarn typecheck
yarn test
yarn build
```

When the environment has Docker, also run backend `yarn test:integration`
and frontend `yarn test:e2e` for affected apps, following the `local-stack`
skill. Otherwise say so in the PR. Never claim a command passed unless it
ran.

Commits follow the repo's conventional style. Never push to `main`; never
force-push.

### 4. Review (reviewer)

The reviewer reads the diff against the review priorities in `CLAUDE.md`
and the plan. On `hold`, the developer gets one round to fix it. If it is
still `hold`, the PR is opened with the `autopilot:hold` label and the
reasons.

### 5. Ship

Open the PR against `main`:

- title: conventional summary, e.g. `fix(room): keep composer above keyboard`
- body: `Closes #<issue>`, what changed, commands run with results, UI at
  both viewports, risks, and the reviewer verdict.

`.github/workflows/autopilot-merge.yml` then decides:

- **Low risk** — every changed file is under `frontend/src/app/`,
  `frontend/src/components/`, `frontend/public/`, `frontend/e2e/`, `docs/`,
  or `tasks/`; no sign-in or account deletion screens
  (`frontend/src/app/auth/`, `frontend/src/app/account-deletion/`), the
  design system and shell (`frontend/src/components/ui/`, `components/app/`),
  route
  handlers, middleware, env files, agent rules, or source-of-truth docs; at most 20 files and 500 changed lines. Merged
  automatically once Frontend CI passes, then deployed by Vercel.
- **High risk** — anything else (backend, Prisma, auth, API client,
  dependencies, workflows, agent rules). Labeled `autopilot:needs-owner`
  and left for the owner.

The owner can stop any PR by adding `autopilot:hold`.

### 6. Report

Post one report to Slack (channel named in the task prompt) and the same
text as a comment on the GitHub issue titled `Autopilot log` (create it if
missing, label `autopilot:log`). Korean, short:

```
[Autopilot] YYYY-MM-DD
상태: ✅ PR 생성 / 💤 개선할 것 없음 / ⏸ 대기 / 🚨 긴급
작업: #이슈 제목 (선택 이유 한 줄)
PR: <link> — 자동 머지 대상 | 오너 리뷰 필요
검증: lint ✅ typecheck ✅ test ✅ build ✅ (못 돌린 것: …)
대기 중인 PR: n개
오너에게: (결정이 필요한 것만, 없으면 생략)
```

If Slack is unavailable, still write the issue comment and mention it.

## Hard rules

- At most one piece of work per run; zero is fine. Stop after reporting.
- No secrets, tokens, or real user data in code, PRs, issues, or Slack.
- Do not read or print production environment variables or `.env` files.
- Do not change pinned versions or add dependencies; propose it in an issue.
- Do not touch `deploy/`, `mobile/` signing, or infrastructure config.
- Do not edit or close the owner's issues except to comment, add
  `autopilot:in-progress`, and link the PR.
- If anything is ambiguous enough that a wrong guess would be costly, ask in
  the report instead of guessing.
