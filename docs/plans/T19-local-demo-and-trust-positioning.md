# T19 verified local demo and trust positioning

## Goal

- Provision one production account with an approved Jeju local verification
  through the real registration, verification, and administrator-review APIs.
- Make the landing page clearly explain that travelers can compare recent
  traveler experience with recommendations from verified locals.
- Prefer a truthful trust promise over an absolute claim that the service can
  never contain viral or promotional content.

## Files

- `frontend/src/app/page.tsx`: refine the hero, live answer example, and trust
  signals.
- `frontend/src/app/globals.css`: style the compact trust-signal row without
  changing the established magenta-purple visual system.
- `docs/plans/T19-local-demo-and-trust-positioning.md`: record scope, checks,
  and operational risks.

No backend source or schema change is required. The account is operational data,
not a hard-coded seed identity.

## Production operation

1. Register one dedicated demo local through `POST /api/v1/auth/register`.
2. Submit a clearly labeled synthetic demo proof and in-radius coordinates
   through `POST /api/v1/verifications/local`.
3. Authenticate with the existing initial administrator secret without printing
   it, inspect the pending request, and approve it through the admin API.
4. Confirm login, `APPROVED` local status, and Jeju room access.
5. Return the demo account credential to the operator; never commit it.

## Validation

- Run frontend formatting, lint, typecheck, focused tests, and production build.
- Verify the landing page at 390x844 and 1440x900 if the local browser path is
  available.
- Verify the production account using only public DTOs; do not expose proof,
  GPS, password hashes, cookies, or administrator secrets.

## Risks

- “No viral content” cannot be guaranteed by copy alone. The UI will say that
  direct experience is prioritized and identify the two contributor signals.
- Production account creation is an external mutation. It must target the known
  Railway production API and remain idempotent if the email already exists.
- The proof is synthetic demo data and must be labeled as such; it is not a claim
  that a real person's residence was reviewed.
