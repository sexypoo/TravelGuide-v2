// Classifies an autopilot PR as low or high risk from its changed files.
// Only low-risk PRs are merged without the owner.
//
// Usage: node autopilot-risk.mjs < numstat.txt
// Input is `git diff --numstat` output: "<added>\t<deleted>\t<path>" per line.
// Prints JSON {risk, reasons, frontend, backend} to stdout.

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const MAX_FILES = 20;
export const MAX_CHANGED_LINES = 500;

const LOW_RISK_PREFIXES = [
  "frontend/src/app/",
  "frontend/src/components/",
  "frontend/public/",
  "frontend/e2e/",
  "docs/",
  "tasks/",
];

const ALWAYS_HIGH_RISK = [
  /^docs\/AUTOPILOT\.md$/,
  /^docs\/MVP_FUNCTIONAL_SPEC\.md$/,
  /(^|\/)route\.tsx?$/,
  /(^|\/)middleware\.tsx?$/,
  /(^|\/)\.env/,
];

export function parseNumstat(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [added, deleted, ...rest] = line.split("\t");
      // Binary files report "-" for both counts.
      return {
        path: rest.join("\t"),
        lines: (Number(added) || 0) + (Number(deleted) || 0),
      };
    });
}

export function classify(files) {
  const reasons = [];

  if (files.length === 0) reasons.push("no changed files");
  if (files.length > MAX_FILES) {
    reasons.push(`${files.length} files changed (max ${MAX_FILES})`);
  }
  const totalLines = files.reduce((sum, file) => sum + file.lines, 0);
  if (totalLines > MAX_CHANGED_LINES) {
    reasons.push(`${totalLines} lines changed (max ${MAX_CHANGED_LINES})`);
  }

  for (const { path } of files) {
    if (ALWAYS_HIGH_RISK.some((pattern) => pattern.test(path))) {
      reasons.push(`protected path: ${path}`);
    } else if (!LOW_RISK_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      reasons.push(`outside auto-merge paths: ${path}`);
    }
  }

  return {
    risk: reasons.length === 0 ? "low" : "high",
    reasons,
    frontend: files.some(({ path }) => path.startsWith("frontend/")),
    backend: files.some(({ path }) => path.startsWith("backend/")),
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const result = classify(parseNumstat(readFileSync(0, "utf8")));
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
