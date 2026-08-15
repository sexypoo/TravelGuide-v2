# T11 Railway Bucket server-side encryption compatibility

## Goal

Restore production uploads by avoiding the unsupported per-request
`ServerSideEncryption` option for Railway's S3-compatible Bucket while keeping
the existing AES256 request for standard AWS S3.

## Files

- `backend/src/storage/s3-storage.adapter.ts`: select the PutObject encryption
  option from whether the SDK uses the standard AWS endpoint or a custom
  S3-compatible endpoint.
- `backend/src/storage/s3-storage.adapter.spec.ts`: cover Railway-compatible
  puts and the preserved AWS AES256 behavior.
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
- A production deploy is required before uploads recover; the code change alone
  does not alter the currently running Railway service.
