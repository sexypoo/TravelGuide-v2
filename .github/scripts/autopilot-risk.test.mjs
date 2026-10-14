import assert from "node:assert/strict";
import { test } from "node:test";

import { classify, parseNumstat } from "./autopilot-risk.mjs";

const files = (...paths) => paths.map((path) => ({ path, lines: 10 }));

test("frontend UI and docs changes are low risk", () => {
  const result = classify(
    files("frontend/src/components/rooms/room-header.tsx", "docs/plans/T51-x.md"),
  );
  assert.equal(result.risk, "low");
  assert.equal(result.frontend, true);
  assert.equal(result.backend, false);
});

test("backend, schema, auth, and dependency changes are high risk", () => {
  for (const path of [
    "backend/src/rooms/room-access.service.ts",
    "backend/prisma/schema.prisma",
    "frontend/src/lib/api/client.ts",
    "frontend/package.json",
    "frontend/yarn.lock",
  ]) {
    assert.equal(classify(files(path)).risk, "high", path);
  }
});

test("agent guardrails and source-of-truth docs can never be auto-merged", () => {
  for (const path of [
    ".github/workflows/autopilot-merge.yml",
    ".github/scripts/autopilot-risk.mjs",
    ".claude/agents/developer.md",
    "AGENTS.md",
    "docs/AUTOPILOT.md",
    "docs/MVP_FUNCTIONAL_SPEC.md",
    "docs/PRODUCT.md",
    "docs/ACCEPTANCE_TESTS.md",
    "docs/ARCHITECTURE.md",
    "CLAUDE.md",
    ".claude/skills/local-stack/SKILL.md",
  ]) {
    assert.equal(classify(files(path)).risk, "high", path);
  }
});

test("route handlers, middleware, and env files under UI paths are high risk", () => {
  for (const path of [
    "frontend/src/app/api/session/route.ts",
    "frontend/src/app/middleware.ts",
    "frontend/src/app/.env.local",
  ]) {
    assert.equal(classify(files(path)).risk, "high", path);
  }
});

test("large changes are high risk", () => {
  const many = Array.from({ length: 21 }, (_, i) => `docs/n${i}.md`);
  assert.equal(classify(files(...many)).risk, "high");
  assert.equal(classify([{ path: "docs/a.md", lines: 501 }]).risk, "high");
});

test("an empty diff is high risk", () => {
  assert.equal(classify([]).risk, "high");
});

test("numstat parsing handles binary files and tabs", () => {
  assert.deepEqual(
    parseNumstat("3\t2\tdocs/a.md\n-\t-\tfrontend/public/x.png\n"),
    [
      { path: "docs/a.md", lines: 5 },
      { path: "frontend/public/x.png", lines: 0 },
    ],
  );
});
