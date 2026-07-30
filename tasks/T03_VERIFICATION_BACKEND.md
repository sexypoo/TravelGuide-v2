# T03 — Verification backend and private storage

## Goal

Implement the trust foundation: traveler/local applications, evidence storage, eligibility, and admin review APIs.

## Read first

- VER-001 through VER-003
- ADM-001
- ROOM-003
- Architecture sections 4, 7, 9
- E2E-004 through E2E-010

## Required work

- Verification enums, model, indexes, migration
- Private `StorageService` interface
- Local private storage adapter for dev/test
- S3 adapter interface/config; production adapter may be completed here if credentials/environment are available, otherwise it must fail clearly rather than silently use public storage
- Multipart traveler application
- Multipart local application
- File size/type validation and safe random object keys
- GPS accuracy and Haversine radius validation
- Verification status list for current user
- `RoomAccessService` using approved traveler window, local expiry, admin bypass
- Admin list/detail/evidence/review APIs
- Concurrent review protection
- Integration tests with real files and DB

## Constraints

- No Base64 file storage.
- No evidence public URL.
- GPS is not the only approval condition.
- Do not expose exact GPS in public DTOs.
- Do not build frontend forms in this task.

## Acceptance

- E2E-004 through E2E-010 backend behavior
- Failed DB write attempts clean up stored file when possible
- Non-admin evidence access is 403
- Review audit fields are present
- Approved traveler/local immediately affect access service

## Mandatory review

After implementation, run a focused self-review for orphan files, path traversal, MIME spoofing, date boundaries, review race, and private DTO leakage.

