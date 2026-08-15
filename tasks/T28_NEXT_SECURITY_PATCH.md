# T28 — Next.js security patch

## Goal

Restore production deployment eligibility by upgrading the frontend from the
Vercel-blocked Next.js 15.5.2 release to the patched 15.5 maintenance release.

## Required work

- Upgrade `next` and `eslint-config-next` together from 15.5.2 to 15.5.21.
- Regenerate the Yarn lockfile without adding unrelated dependencies.
- Update current architecture and release documentation.
- Run frontend lint, format check, typecheck, tests, and production build.

## Out of scope

- Next.js 16 migration.
- React, React DOM, TypeScript, Tailwind, or application feature changes.
- Disabling Vercel's vulnerable-framework deployment protection.

## Acceptance

- The installed and locked Next.js version is 15.5.21.
- `eslint-config-next` matches the Next.js patch version.
- Frontend verification passes on Node.js 20.x.
- No vulnerable-version bypass environment variable is introduced.
