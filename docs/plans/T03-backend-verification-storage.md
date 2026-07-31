# T03 backend verification and private storage plan

## Goal and scope

Implement only T03 in `backend/`: the Verification model, private evidence storage, traveler/local applications, own-status reads, destination eligibility, room access, and administrator review. Preserve the uncommitted Frontend T02 work and do not create T04 forms.

## Previous-task verification

- Backend T02 is committed as `6ba5c49` and its PostgreSQL integration suite passed under the fixed Node 20 runtime.
- Frontend T02 has uncommitted work in `frontend/`; T03 will not touch it.
- T02's `RoomAccessService` is the intended temporary authorization seam and will be replaced with database-backed verification checks rather than duplicated.

## Data model and migration

Add `VerificationType` (`TRAVELER`, `LOCAL`), `VerificationStatus` (`PENDING`, `APPROVED`, `REJECTED`, `REVOKED`, `EXPIRED`), and `LocalProofType` (`RESIDENCE`, `WORK`, `STUDY`, `OTHER`).

Add `Verification` with user/destination/reviewer relations; traveler dates; local proof type and private GPS fields; proof object metadata; note; review audit/rejection/expiry timestamps; and created/updated timestamps. Add the specified composite indexes. A PostgreSQL partial unique index enforces at most one PENDING application per user, destination, and type under races.

## Private storage

- Define the `StorageService` token/interface with private put, private download lookup, and delete operations.
- The local adapter writes below `LOCAL_STORAGE_DIR` with `verification/{userId}/{random UUID}` keys, rejects unsafe keys, never uses the original filename in a path, and is never mounted as static content.
- The administrator evidence endpoint authenticates before resolving and streaming the local file. Public DTOs never contain object keys, URLs, exact GPS, or filesystem paths.
- `STORAGE_DRIVER=local` is allowed only for development/test. Production requires `s3`; because no deploy credentials or S3 SDK are available in this task, the S3 adapter fails clearly at startup instead of falling back to local/public storage.
- If storage succeeds and the Verification insert fails, the service attempts deletion and emits a warning containing only the safe object key if cleanup itself fails.

No new production package is required: Nest's Express adapter already includes Multer, and Node's standard `fs`, `crypto`, and stream APIs cover private local storage.

## Validation and domain rules

- Multipart field name is `proofFile`; one JPEG, PNG, or PDF up to 5 MiB is required.
- Validate both declared MIME and JPEG/PNG/PDF magic bytes to prevent MIME spoofing.
- Traveler dates are strict ISO timestamps, `startsAt <= endsAt`, and `endsAt >= submission time`. Reject pending duplicates and a new interval fully contained in an existing approved interval.
- Local input validates numeric coordinate bounds, accuracy at most 200 m, and Haversine distance within the destination radius. `capturedAt` is stored as private audit data; the source requirements specify no freshness window, so none is invented.
- Local notes are trimmed and 30–300 characters; traveler notes are optional and at most 300.

## APIs and DTO privacy

Authenticated user endpoints:

```text
POST /api/v1/verifications/traveler   multipart/form-data
POST /api/v1/verifications/local      multipart/form-data
GET  /api/v1/verifications/me
```

Administrator endpoints guarded by both `JwtAuthGuard` and `AdminGuard`:

```text
GET   /api/v1/admin/verifications?status=&type=&destinationId=
GET   /api/v1/admin/verifications/:id
GET   /api/v1/admin/verifications/:id/evidence
PATCH /api/v1/admin/verifications/:id/review
```

Own-status DTOs expose rejection reasons only to their owner and approved validity dates. Admin detail exposes a coarse GPS summary (accuracy and captured time plus inside-radius result), not exact coordinates. Evidence bytes are available only from the separately guarded endpoint.

Review uses `updateMany({ id, status: PENDING })` inside a transaction. A zero row count returns conflict code `VERIFICATION_ALREADY_REVIEWED`. Approval records reviewer/time and gives local approvals a 90-day expiry; rejection requires a trimmed 10–300 character reason.

## Room access

Make `RoomAccessService` asynchronous and destination-aware:

- admin: always available;
- approved traveler: current time from 24 hours before `startsAt` through 24 hours after `endsAt`, inclusive;
- approved local: current time before `expiresAt`;
- otherwise expose pending traveler/local state when present, or verification required.

Rooms list/detail/content checks all call the same service. Later Socket joins can reuse the exported service.

## Files

- Update Prisma schema and add one T03 migration.
- Add `storage/`, `verifications/`, and `admin/verifications/` modules, DTOs, services, controllers, and focused utilities.
- Update app composition, environment validation/example, room access service/types/call sites/tests, public local profile mapping, README, and integration setup/tests.
- Record the file-signature, local-streaming, and production-fail-closed decisions in `docs/DECISIONS.md`.

## Tests and commands

Add unit tests for file signatures, Haversine boundaries, and room-access dates. Add real PostgreSQL/Supertest integration coverage for E2E-004 through E2E-010, including real multipart buffers, oversize/type rejection, owner status privacy, admin-only evidence, room access immediately after approval, local expiry, resubmission, and competing review requests.

Run from `backend/` under Node 20 where Prisma is required:

```bash
yarn db:generate
yarn db:migrate --name add_verification_storage
yarn format
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn test:integration
yarn db:validate
yarn build
yarn verify
```

## Risks and review checklist

- Orphans: force and test cleanup after failed inserts; cleanup failure is warning-only so the original DB error is preserved.
- Path traversal: object keys are generated server-side and every local lookup validates fixed segments and resolves beneath the configured root.
- MIME spoofing: compare declared MIME with recognized file signature before storage.
- Date boundaries: use injected/current `Date` consistently and inclusive traveler boundaries; local expiry is exclusive.
- Review race: conditional update count is the single winning transition and audit fields are updated together.
- Private leakage: map every response explicitly and search serialized DTOs/tests for object keys, coordinates, paths, and evidence URLs.
