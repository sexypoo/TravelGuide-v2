# T28 Next.js security patch

## Goal

Unblock Vercel deployment by moving the frontend from vulnerable Next.js
15.5.2 to the official patched Maintenance LTS release 15.5.21.

## Files

- `frontend/package.json` and `frontend/yarn.lock`: update `next` and
  `eslint-config-next` together.
- `docs/ARCHITECTURE.md`: record the current pinned frontend framework version.
- `docs/DECISIONS.md`: record the security exception to the previous release
  pin and the decision not to bypass Vercel protection.
- `docs/DAILY_STATUS.md` and `docs/RELEASE_NOTES.md`: record verification.
- `tasks/T28_NEXT_SECURITY_PATCH.md`: acceptance scope.

## Dependencies

- Upgrade only `next` and `eslint-config-next` from 15.5.2 to 15.5.21.
- Keep Next.js on major 15 to avoid a breaking framework migration.
- Keep React 19.1.1, React DOM 19.1.1, TypeScript 5.8.3, and all other pinned
  dependencies unchanged.

## Tests

1. Confirm manifest, lockfile, and installed package versions are 15.5.21.
2. Run `yarn lint`, `yarn format:check`, and `yarn typecheck`.
3. Run the frontend Jest suite.
4. Run a production `yarn build` and verify it reports Next.js 15.5.21.

## Risks

- Maintenance patches can change generated route types or build behavior;
  typecheck and production build cover those contracts.
- Keeping the vulnerable version or bypassing Vercel's protection would leave
  known server-side security exposure and is not an acceptable workaround.
- Package registry access is required to regenerate the lockfile and installed
  dependency tree.
