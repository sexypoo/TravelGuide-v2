# T40 account deletion and privacy disclosure

## Goal

Complete the account lifecycle required for mobile-store review: a signed-in
user can close the account in the product, a reviewer can find the same path on
the public web, and deletion covers relational data, private evidence, uploaded
images, authentication credentials, and matching preorder data.

## Store-policy constraints

- Apple requires apps that create accounts to let users initiate deletion in
  the app and to delete the account with associated personal data and
  user-generated content. Sign in with Apple credentials must be revoked.
- Google Play requires an in-app deletion path and an external web resource
  that identifies the service and explains or starts account deletion. The web
  route may require authentication to prove ownership.
- Therefore the implementation exposes one authenticated destructive API, one
  in-product profile flow, and one public explanatory route linking to the web
  login/profile flow. It does not accept unauthenticated destructive requests.

## Product and visual direction

- **Subject and job:** a signed-in traveler should be able to close the account
  with full awareness of what disappears; a store reviewer should immediately
  understand the same route from the public web.
- **Palette:** reuse the current ink, canvas, white surface, violet action,
  border, and error/berry tokens. Destructive color appears only in disclosure
  copy and the final action, not as a large alarm panel.
- **Typography:** keep the existing display/body/utility hierarchy. Legal copy
  uses readable body measure and explicit section headings rather than a
  marketing hero.
- **Layout:** add a quiet `계정 관리` section after profile content. Expanding
  it reveals deletion scope, password reauthentication when applicable, and
  the exact `계정 삭제` confirmation. Public pages use a plain policy ledger.
- **Signature element:** both surfaces show the real deletion route as a compact
  `계정 → 공개 콘텐츠 → 비공개 증빙·업로드` sequence. This is informative,
  not ornamental.
- **Restraint check:** no new gradient, icon library, floating card system, or
  giant warning banner. The profile continues to feel like the existing app.

## Backend files

- Prisma schema and migration: add nullable encrypted Apple refresh-token
  storage to `AuthIdentity`.
- Environment validation/example: require a dedicated 32-byte hex OAuth token
  encryption key when Apple login is configured.
- Auth credential cipher: AES-256-GCM versioned encryption/decryption without a
  new package.
- Social auth service: retain newly issued Apple refresh tokens and provide a
  server-only revocation operation.
- Users service: persist or rotate encrypted refresh-token material without
  exposing it through public responses.
- Account deletion service/DTO/controller route: verify confirmation, recheck a
  password account, forbid administrators, revoke Apple, collect dependent
  IDs/object keys in a transaction, remove target reports and matching preorder
  registration, delete the user, and clean private storage after commit.
- App bootstrap CORS: allow `DELETE` for the cross-origin web client.
- Backend unit and real-PostgreSQL integration tests.

## Frontend files

- Own-profile response/parser: expose only `hasPassword`, never a hash or social
  credential.
- Profile browser client: add the authenticated delete call.
- Account deletion panel: loading, collapsed, validation, submitting, API error,
  and success navigation states.
- Profile page: mount the account-management section and legal links.
- `/privacy`: public, accurate privacy/retention/deletion disclosure.
- `/account-deletion`: public external deletion resource with ownership-proof
  guidance and login/profile entry point.
- Guest home footer: discoverable privacy and deletion links.
- Focused frontend tests and responsive browser coverage at 390x844 and
  1440x900.

## Data-deletion transaction

1. Validate the exact phrase and password requirements without leaking which
   credential type an arbitrary user has.
2. Revoke a decryptable Apple refresh token before removing its only local copy.
3. Acquire the per-user advisory lock and gather the user's own content plus
   cascaded answers/comments that may contain private files.
4. Delete reports targeting the user or any content that the user deletion will
   remove, then delete the matching preorder row and user in one transaction.
5. After commit, delete the deduplicated avatar, verification evidence,
   question, answer, and chat object keys through the shared private-object
   lifecycle boundary.
6. Clear the httpOnly JWT cookie and return no private response body.

## Migration and dependencies

- One Prisma migration for `AuthIdentity.refreshTokenCiphertext`.
- No production dependency or lockfile change; encryption uses Node `crypto`.
- No changes to `RoomAccessService`, socket authorization, or public content
  enum values.

## Tests

1. Unit-test confirmation, password reauthentication, admin blocking, Apple
   revocation ordering, report/data cleanup, and post-commit storage cleanup.
2. Integration-test deletion against PostgreSQL, including session invalidation,
   cascaded data, matching preorder data, and private storage files.
3. Test own-profile parsing and deletion-client error handling.
4. Test the profile confirmation UI for password and social-only accounts.
5. Run relevant backend/frontend lint, typecheck, test, integration, build, and
   Playwright checks, including both required viewport sizes.

## Risks

- Deleting a question/post can cascade content authored by another user; its
  object keys and target reports must be gathered before the cascade.
- Database deletion and remote Apple revocation cannot be one atomic
  transaction. Revocation occurs first so credentials are not lost before the
  remote call; a later database failure remains retryable as a local operation.
- Database commit and object-storage deletion are also not atomic. The shared
  lifecycle helper logs cleanup failures for operational follow-up, while the
  account and database-visible private metadata remain deleted.
- Legacy Apple identities created before this migration may not have a stored
  refresh token. They remain locally deletable and are explicitly logged for
  operator follow-up instead of trapping the user.
- Unrelated presentation mockups are user-owned untracked files and must not be
  edited or staged.
