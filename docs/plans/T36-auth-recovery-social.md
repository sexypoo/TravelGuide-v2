# T36 plan — Password recovery and social authentication

## Goal

Ship production-ready password recovery and Google, Kakao, and Apple login for
the existing Next.js + NestJS + Prisma application and Capacitor web wrapper.

## Design direction

- Subject: a Jeju travel help network for users who need the fastest safe path
  back into an existing account.
- Palette: Ink `#171B25`, Canvas `#F6F7FA`, Violet `#6659E8`, Kakao
  `#FEE500`, Success `#0AAB84`, Line `#E2E5EA`.
- Type: retain the established display and body families; authentication is a
  continuation of the current brand rather than a new campaign surface.
- Layout: keep the quiet two-panel desktop shell and one-column mobile shell;
  place social providers in one compact stack separated from email by a
  semantic divider.
- Signature: provider buttons use restrained provider-specific marks while the
  existing violet action remains the only dominant control.
- Self-critique: avoid generic floating cards and decorative gradients in the
  form itself; trust comes from short copy, stable spacing, and explicit states.

## Files

- `backend/prisma/schema.prisma` and one new migration
- `backend/src/auth/**`, `backend/src/users/users.service.ts`
- `backend/src/config/environment.ts`, `backend/.env.example`
- auth unit/integration tests under `backend/src/auth` and `backend/test`
- `frontend/src/app/auth/**`, `frontend/src/components/auth/**`
- `frontend/src/lib/api/auth-client.ts`, auth validation/tests
- `frontend/src/app/globals.css` and Playwright auth coverage
- source-of-truth docs and `docs/DECISIONS.md`

## Migration

- Make `User.passwordHash` nullable for social-only accounts.
- Add `User.sessionVersion` with default zero.
- Add `AuthIdentity(provider, providerUserId, userId)` with provider/user
  uniqueness.
- Add `PasswordResetToken(userId, tokenHash, expiresAt, usedAt)` with indexes.

## Backend flow

1. Forgot password always returns 204. For an existing password account,
   generate 32 random bytes, store only SHA-256, and send a 30-minute link via
   Resend.
2. Reset runs in a transaction: consume an unused token, replace the bcrypt
   hash, increment `sessionVersion`, and invalidate sibling reset tokens.
3. JWTs carry `sessionVersion`; REST and Socket authentication compare it with
   the database value.
4. OAuth start signs provider, nonce, safe next path, and short expiry into a
   state JWT. Callback exchanges the code at the official token endpoint,
   obtains a verified email, then finds/creates the identity and local user.
5. Google and Kakao use authorization-code + userinfo. Apple exchanges the code
   with a server-generated ES256 client secret and verifies the returned ID
   token with Apple's JWKS.
6. Provider keys are optional as complete groups. The public provider list
   contains only fully configured providers.

## Tests

- Environment validation for complete/partial provider and email settings.
- Password token hashing, enumeration resistance, expiry, one-time use, bcrypt,
  and session invalidation.
- Social provider configuration, signed state, safe redirects, verified-email
  enforcement, identity linking, and nickname collision handling.
- Frontend request/reset validation and auth-form interactions.
- Playwright at 390x844 and 1440x900 for layout and navigation.

## Risks

- Real external-provider success requires owner-created OAuth apps, registered
  redirect URIs, and production secrets; automated tests cover protocol logic
  without claiming live credentials were exercised.
- Apple private keys contain newlines and must be stored as escaped environment
  values; parsing must normalize `\\n` without logging the key.
- Linking is allowed only for a provider-confirmed email to prevent account
  takeover.
- Resend requires a verified sender domain; failed delivery must be logged only
  as a delivery error and never expose the reset token.
