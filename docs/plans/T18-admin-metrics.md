# T18 admin metrics

## Goal

Expose the MVP KPI definitions as an admin-only, database-backed operating view.

## Backend

- Add an isolated `AdminMetricsModule` guarded by JWT and admin role.
- Read only visible questions and answers. Derive per-question first-answer delay,
  answered-within-ten-minutes, resolution, and acceptance metrics.
- Group visible LOCAL/BOTH answers by author and join only nickname for the
  contributor table.
- Return an explicit DTO with percentages rounded to one decimal and ISO
  `generatedAt`; no raw Prisma records or private verification fields.

## Frontend

- Add a runtime validator and protected server fetcher.
- Add `/admin/metrics` to every admin navigation.
- Design: blush-white control surface, ink copy, magenta/violet signal rail, mint
  for healthy response speed. Keep the one signature element—the conversion
  rail—and make the remaining metric cells restrained.

## Tests

- Backend unit tests cover empty denominators and a mixed question lifecycle.
- Frontend parser tests reject malformed metrics.
- Run both apps' format, typecheck, unit tests, lint, and builds.

## Risks

- The pilot implementation loads minimal timestamps for all valid questions.
  Replace it with SQL aggregates when volume warrants it.
- Metrics are current snapshots, not historical time series.
