# T50 autopilot agent team

## Goal

Run a daily cloud agent team (planner → designer → developer → reviewer) that
picks one improvement, implements it on an `autopilot/*` branch, opens a PR,
and reports to Slack and a GitHub issue. Low-risk PRs merge automatically
after CI; everything else waits for the owner.

## Files

- `docs/AUTOPILOT.md`: operating manual the cloud routine follows each run.
- `.claude/agents/{planner,designer,developer,reviewer}.md`: role subagents.
- `.github/scripts/autopilot-risk.mjs` (+ test): deterministic low/high risk
  classifier for a PR's changed files.
- `.github/workflows/autopilot-merge.yml`: `pull_request_target` on
  `autopilot/*` PRs. Runs main's classifier on the PR file list (PR code is
  never checked out), waits for Frontend CI, squash-merges when low risk.
- `docs/DECISIONS.md`: ADR for autonomous merges.

## Migrations

None.

## Tests

- `node --test .github/scripts/autopilot-risk.test.mjs`
- YAML parse check of changed workflows.
- First routine run verified by hand: branch, PR, label, CI, report.

## Risks

- `main` deploys straight to production (Vercel + Railway). Mitigation:
  allow-list of auto-merge paths (frontend UI, docs, tasks), size limit, no
  auto-merge for schema, auth, API client, dependencies, workflows, or agent
  instructions. Next run checks production health first and opens a revert PR
  if a merged change broke it.
- Cloud sessions cannot run the local Docker DB/Playwright stack; CI is the
  gate. Playwright E2E is not in CI, so UI regressions can slip through.
- The agent could edit its own guardrails. Mitigation: `.github/**`,
  `.claude/**`, `AGENTS.md`, `docs/AUTOPILOT.md` are always high risk.
- `main` has no branch protection; anyone with push could bypass. Recommended
  owner action: protect `main` (require PR).
