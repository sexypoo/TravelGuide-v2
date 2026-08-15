# T26 — 여JJU brand rename

## Goal

Replace the user-facing TravelGuide name with the final service brand while
preserving stable technical identifiers.

## Required work

- Use `여쭈어` as the service name and `여JJU` as the compact visual wordmark.
- Update the shared wordmark, landing copy, metadata, and primary product docs.
- Keep package names, database names, deployment variables, demo email domains,
  local-storage keys, and TypeScript integration identifiers unchanged.
- Record the display-name/technical-name boundary in `docs/DECISIONS.md`.

## Acceptance

- Every user-facing frontend occurrence uses the new brand.
- The shared wordmark remains accessible and works at mobile and desktop sizes.
- Focused tests, lint, typecheck, and build pass.
- No runtime identifier or deployment contract is renamed.
