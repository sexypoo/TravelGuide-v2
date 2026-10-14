# T51 Claude-first docs and issue-based workflow

The last T-numbered plan. From here on, work is tracked as GitHub issues.

## Goal

Make the repository easy for Claude (interactive and the autopilot team) to
work in: one short entry file, a current product summary, a process sized to
the change, and no stale presentation-era instructions.

## Problems

- Two files per task (`tasks/` and `docs/plans/`) overlap and have drifted:
  tasks stop at T40, plans run to T50, and T04/T11/T33 numbers are reused.
- Every change, even a copy fix, needs a task file, a plan, and sometimes an
  ADR.
- About 4,700 lines of source-of-truth docs per run. The 1,431-line spec
  still says "2.5-week presentation MVP" and lists maps and bookmarks as
  never-build, although ADR-026–028 shipped them.
- `AGENTS.md` and `docs/ARCHITECTURE.md` list root `yarn` commands, but there
  is no root `package.json`.

## Changes

- `CLAUDE.md`: primary instructions. Keeps every rule from `AGENTS.md`, adds
  a docs map, issue-based small/large workflow, per-app commands, deployment
  facts. `AGENTS.md` becomes a pointer for other agents.
- `docs/PRODUCT.md`: current product, shipped features with their ADRs,
  what we don't build, priorities, unknowns. Wins on scope.
- Spec banner: scope sections superseded by `PRODUCT.md`; requirement IDs
  stay authoritative for behavior.
- Archive `CODEX_START_HERE.md`, `EXECUTION_PLAN.md`, `DAILY_STATUS.md`,
  `PRESENTATION_CHECKLIST.md` to `docs/archive/`; `tasks/README.md` marks
  `tasks/` as history.
- `.claude/skills/local-stack`: Docker PostgreSQL on 5433, integration and
  Playwright runs.
- Autopilot playbook and agents use issues instead of T-numbers; classifier
  protects `PRODUCT.md`, `ACCEPTANCE_TESTS.md`, `ARCHITECTURE.md`.
- `.github/pull_request_template.md`.
- ADR-048.

## Migrations

None.

## Tests

- `node --test .github/scripts/autopilot-risk.test.mjs`
- Link check: every path referenced from `CLAUDE.md` and `README.md` exists.

## Risks

- Historical plans still reference archived docs; acceptable as history.
- `PRODUCT.md` summarizes decisions; if it drifts from ADRs, ADRs win until
  the owner updates it.
