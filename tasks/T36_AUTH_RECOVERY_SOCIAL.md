# T36 — Password recovery and social authentication

## Goal

Extend the production authentication slice with secure email password recovery
and Google, Kakao, and Apple sign-in while preserving the existing httpOnly
cookie session contract.

## Scope decision

This Task is an explicit product-owner expansion beyond the original 2.5-week
MVP exclusion list. Update the functional spec, acceptance tests, architecture,
and execution plan as part of this Task before marking it complete.

## Required work

- Store only hashed, single-use password reset tokens with a 30-minute expiry.
- Return the same forgot-password response for known and unknown email addresses.
- Deliver reset links through the Resend HTTPS API without logging tokens.
- Invalidate existing sessions when a password is reset.
- Add Google, Kakao, and Apple authorization-code flows with signed state.
- Accept only provider-verified email addresses and link identities by verified
  email without overwriting profile data.
- Keep provider secrets server-side and expose only configured providers.
- Preserve a safe post-login `next` path.
- Add mobile- and desktop-readable recovery and social-login surfaces.

## Acceptance

- A valid reset link changes the password once; reused, expired, and malformed
  links fail without changing credentials.
- Forgot-password does not reveal whether an account exists.
- Resetting a password invalidates prior JWT sessions.
- Configured social providers complete login and create/link one local account.
- OAuth replay, state mismatch, unverified email, and provider failure are
  rejected with a user-actionable redirect.
- Existing register/login/logout/me behavior remains compatible.

## Commands

```bash
cd backend && yarn lint && yarn typecheck && yarn test && yarn test:integration && yarn build
cd frontend && yarn lint && yarn typecheck && yarn test && yarn build && yarn test:e2e
```
