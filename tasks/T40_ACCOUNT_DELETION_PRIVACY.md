# T40 — Account deletion and privacy disclosure

## Goal

Add a complete, store-reviewable account deletion flow and accurate public
privacy disclosures without weakening authentication, authorization, or
private-file handling.

## Required work

- Let authenticated non-admin users permanently delete their account from the
  profile screen after an explicit confirmation and, for password accounts,
  password reauthentication.
- Delete account-owned personal data, user-generated content, related reports,
  preorder data for the same email, and private object-storage files.
- Revoke a stored Sign in with Apple refresh token before deleting an Apple
  identity, with encrypted-at-rest storage for newly issued refresh tokens.
- Clear the authentication cookie after successful deletion.
- Publish a privacy policy and a public account-deletion information page that
  can be linked from app-store declarations without requiring the mobile app.
- Link both public pages from the guest home and the profile account-management
  section.
- Cover backend authorization/data cleanup and frontend confirmation states
  with regression tests.

## Out of scope

- Deleting administrator accounts through the public API.
- A delayed recovery window, soft deletion, data export, or operator dashboard.
- A public unauthenticated deletion request that bypasses ownership proof.
- Reworking unrelated profile, authentication, or social-login design.
- Adding analytics, consent-management, or new production dependencies.

## Acceptance

- A password account cannot be deleted without the exact confirmation phrase
  and a correct current password.
- A social-only account can be deleted after the exact confirmation phrase.
- An administrator receives a forbidden response from the public deletion API.
- Successful deletion removes the user, owned/cascaded content, matching
  preorder row, target reports that would otherwise be orphaned, and all
  discoverable private object keys, then clears the session cookie.
- A configured Apple account revokes its refresh token before local deletion;
  token material is encrypted at rest and never returned by a public DTO.
- `/privacy` and `/account-deletion` are public, mobile-readable, and accurately
  describe scope, retention, authentication, and the deletion path.
- Relevant lint, typecheck, unit, integration, build, and browser checks pass.
