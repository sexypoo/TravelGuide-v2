# Autopilot agent team

A cloud routine runs this playbook once a day without the owner. It improves
TravelGuide one reviewable task at a time. `AGENTS.md` still applies in full;
where this file is stricter, this file wins.

Changing this file, `.claude/agents/**`, `.github/**`, or `AGENTS.md` is
never auto-merged. The owner reviews every change to the rules.

## Team

| Role | Subagent | Output |
| --- | --- | --- |
| Planner | `planner` | One chosen task + `tasks/Txx_*.md` + `docs/plans/Txx-*.md` |
| Designer | `designer` | UI direction for the plan (only when UI changes) |
| Developer | `developer` | Code, tests, passing local checks, commits |
| Reviewer | `reviewer` | Verdict: `approve` or `hold` with reasons |

The main session is the lead. It runs the steps below in order, hands each
subagent the previous step's output, and writes the report.

## Run steps

### 0. Preflight

1. `git fetch origin && git switch main && git pull`.
2. Check production:
   - `curl -fsS https://travelguide-v2-production.up.railway.app/api/v1/health/ready`
   - `curl -fsS -o /dev/null -w '%{http_code}' https://www.travelguide.kr`
   If either fails and an `autopilot/*` PR merged in the last 48 hours, open a
   revert PR on `autopilot/revert-<n>`, report it as **urgent**, and stop.
   If it fails with no recent autopilot merge, report it and stop.
3. List open `autopilot/*` PRs. If 5 or more are open, do not start new work:
   report the queue and stop. If 3 or more carry `autopilot:needs-owner`,
   only pick tasks that stay inside the auto-merge paths.
4. If an open autopilot PR has `autopilot:ci-failed`, fixing it is today's
   task (push to its branch) instead of planning a new one.

### 1. Plan (planner)

Pick exactly one task, in this priority:

1. Open GitHub issues labeled `autopilot:idea` from the owner, oldest first.
2. Bugs and regressions: failing CI on main, `docs/KNOWN_LIMITATIONS.md`
   items that can be fixed in code, `known shell issues` noted in docs/qa.
3. Gaps between `docs/MVP_FUNCTIONAL_SPEC.md` / `docs/ACCEPTANCE_TESTS.md`
   and the code (P0 first, then P1).
4. UX, accessibility, copy, and mobile polish on screens not yet in the
   T42 design direction.
5. Test coverage for untested P0 paths.

Never pick work outside P0/P1 scope. A new product idea goes into a GitHub
issue labeled `autopilot:proposal` for the owner instead of code.

**Quality bar.** A task qualifies only if the planner can name, with a file
and line, one of:

- a problem a user hits (bug, blocked flow, unreadable or broken screen);
- a mismatch between the spec/acceptance tests and the code;
- an untested P0 path.

"It could look nicer" does not qualify. Do not rework a screen or file
changed in the last 30 days (`git log --since=30.days`) unless it has a real
bug. Doing nothing is better than churn.

**Idle day.** If no candidate passes the bar:

1. Open no branch and no PR.
2. Open at most 2 `autopilot:proposal` issues with new ideas (problem,
   who it helps, rough scope, why it is outside P0/P1). Skip any idea that
   duplicates an open issue.
3. Report with status 💤 and what was checked.
4. If the last two `Autopilot log` comments were also 💤 (three idle days in
   a row), say so in the report: "할 일이 바닥났어요. 새 방향이 필요해요",
   and list all open `autopilot:proposal` issues. From then on, while idle,
   only run preflight and report; do not open more proposals until an
   `autopilot:idea` issue appears or the owner acts on a proposal.

Prefer tasks that fit the auto-merge rules below. Size: one task should be a
change a reviewer reads in 10 minutes.

The planner writes `tasks/Txx_<NAME>.md` and `docs/plans/Txx-<name>.md`
(goal, files, migrations, tests, risks) using the next free Task number
across `tasks/` and `docs/plans/`.

### 2. Design (designer, UI tasks only)

The designer reads the plan, the T42–T49 plans in `docs/plans/`, the Tailwind
config, and the current components, and appends a "Design" section to the
plan: layout at 390x844 and 1440x900, tokens used, states (loading, empty,
success, error), Korean copy. No new colors, fonts, or dependencies.

### 3. Build (developer)

Branch: `autopilot/Txx-<short-name>` from `main`.

The developer implements the plan, adds or updates tests, and runs the
affected app's checks from its directory:

```bash
yarn install --immutable
yarn lint
yarn typecheck
yarn test
yarn build
```

Backend integration and Playwright E2E need PostgreSQL and the full stack.
Run them if the environment provides them; otherwise say so in the PR. Never
claim a command passed unless it ran.

Commits follow the repo's conventional style (`feat(scope): …`,
`fix(scope): …`). Never force-push `main`, never push to `main` directly.

### 4. Review (reviewer)

The reviewer reads the diff against `AGENTS.md` review rules and the plan.
On `hold`, the developer gets one round to fix it. If it is still `hold`, the
PR is opened with the `autopilot:hold` label and the reasons.

### 5. Ship

Open the PR against `main` with:

- title `Txx: <summary>`
- body: goal, what changed, commands run with results, screenshots or
  description of UI at both viewports, risks, and reviewer verdict.

`.github/workflows/autopilot-merge.yml` then decides:

- **Low risk** — every changed file is under `frontend/src/app/`,
  `frontend/src/components/`, `frontend/public/`, `frontend/e2e/`, `docs/`,
  or `tasks/`; no route handlers, middleware, env files, `AUTOPILOT.md`, or
  the functional spec; at most 20 files and 500 changed lines. Merged
  automatically once Frontend CI passes, then deployed by Vercel.
- **High risk** — anything else (backend, Prisma, auth, API client,
  dependencies, workflows, agent rules). Labeled `autopilot:needs-owner`
  and left for the owner.

The owner can stop any PR by adding `autopilot:hold`.

### 6. Report

Post one report to Slack (channel named in the routine prompt) and the same
text as a comment on the GitHub issue titled `Autopilot log` (create it if
missing, label `autopilot:log`). Korean, short:

```
[Autopilot] YYYY-MM-DD
상태: ✅ PR 생성 / 💤 개선할 것 없음 / ⏸ 대기 / 🚨 긴급
작업: Txx 제목 (선택 이유 한 줄)
PR: <link> — 자동 머지 대상 | 오너 리뷰 필요
검증: lint ✅ typecheck ✅ test ✅ build ✅ (못 돌린 것: …)
대기 중인 PR: n개
오너에게: (결정이 필요한 것만, 없으면 생략)
```

If Slack is unavailable, still write the issue comment and mention it.

## Hard rules

- At most one task per run; zero is fine. Stop after reporting.
- No secrets, tokens, or real user data in code, PRs, issues, or Slack.
- Do not read or print production environment variables.
- Do not change pinned versions or add dependencies; propose it in an issue.
- Do not touch `deploy/`, `mobile/` signing, or infrastructure config.
- Do not edit or close the owner's issues except to comment and to add
  `autopilot:in-progress` / link the PR.
- If anything is ambiguous enough that a wrong guess would be costly, ask in
  the report instead of guessing.
