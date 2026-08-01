# Local demo account seed plan

## Goal

Provide one administrator and four usable demo users in the local development
database. Keep the existing approved traveler, add one approved traveler and
two approved locals, and make the process idempotent.

## Security boundary

- Account identities may be documented, but passwords come only from
  `DEMO_USER_PASSWORD` and `DEMO_ADMIN_PASSWORD` environment variables.
- Demo seeding requires the explicit `DEMO_SEED_ENABLED=true` switch.
- The Markdown file containing actual local passwords lives under
  `backend/.data/`, which is already excluded from Git.
- The seed is for local/demo data and must not be part of the normal database
  seed or integration-test setup.

## Implementation

- Add `prisma/seed-demo.ts` and a `db:seed:demo` package command.
- Upsert fixed demo account identities and reset their bcrypt password hashes
  from environment variables.
- Ensure approved Jeju verification records and local placeholder proof images
  exist so all four users can exercise the real room permissions.
- Document the safe command and account roles in the backend README and env
  template; write the actual local credential table to the ignored data folder.

## Validation

- Run formatting, lint, typecheck, unit tests, and build.
- Execute the seed twice against the development database and confirm there are
  exactly five managed accounts with the expected roles and verification types.
- Exercise the real login endpoint for each account without printing cookies or
  password hashes.

## Risks

- Seeding changes existing local demo/admin passwords by design; the local
  credential Markdown becomes the source of truth for this workspace.
- Placeholder evidence is synthetic and labeled as demo-only; it must never be
  mistaken for a real verification document.
