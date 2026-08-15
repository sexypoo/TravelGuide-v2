# T11 Railway Bucket server-side encryption compatibility

## Goal

Restore production uploads by avoiding unsupported per-request encryption and
automatic optional checksum behavior for Railway's S3-compatible Bucket while
keeping the existing AES256 request and SDK checksum defaults for standard AWS
S3.

## Files

- `backend/src/storage/s3-storage.adapter.ts`: select the PutObject encryption
  option and SDK checksum policy from whether the SDK uses the standard AWS
  endpoint or a custom S3-compatible endpoint.
- `backend/src/storage/s3-storage.adapter.spec.ts`: cover Railway-compatible
  puts and the preserved AWS AES256 behavior.
- `backend/src/users/user-avatars.service.ts`: retain a redacted stage-specific
  diagnostic when production storage or the following database update fails.
- `docs/DECISIONS.md`: record the compatibility refinement to ADR-024.
- `docs/DEPLOYMENT.md` and `docs/KNOWN_LIMITATIONS.md`: document the effective
  encryption contract for Railway and AWS.

## Migrations

None. Database data and object keys are unchanged.

## Tests

- Run the focused S3 adapter Jest suite.
- Run backend lint and typecheck.
- Run the affected backend test suite if time permits.

## Risks

- Custom S3-compatible endpoints do not receive an explicit SSE header because
  feature support varies. Their platform-level encryption remains the storage
  provider's responsibility.
- Standard AWS S3 must continue receiving `ServerSideEncryption: AES256`; a
  regression test protects this branch.
- AWS SDK v3 enables optional CRC32 request checksums by default. Railway's
  S3-compatible endpoint can persist an object but still fail that request, so
  custom endpoints use checksums only when the S3 operation requires one.
- A production deploy is required before uploads recover; the code change alone
  does not alter the currently running Railway service.
- Storage and database failures must remain distinguishable without logging
  credentials, database URLs, image contents, or user profile fields.
