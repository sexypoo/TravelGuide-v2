# T38 private storage lifecycle refactor

## Goal

Remove the duplicated `put private object -> persist metadata -> compensate on
failure` implementation while preserving the current modular-monolith
boundaries and private-file guarantees.

## Files

- `backend/src/storage/private-object-lifecycle.service.ts`: shared upload and
  best-effort deletion orchestration.
- `backend/src/storage/private-object-lifecycle.service.spec.ts`: focused
  success and failure-path coverage.
- `backend/src/storage/storage.module.ts`: provide and export the lifecycle
  service alongside the storage adapter.
- `backend/src/{questions,answers,messages,verifications}/*.service.ts`: use the
  common lifecycle boundary while retaining validation, Prisma transactions,
  advisory locks, response mapping, and realtime publication.
- `backend/src/users/user-avatars.service.ts`: use the same compensation and old
  object cleanup boundary while retaining its safe database-error logging.
- `backend/src/storage/storage-object-key.spec.ts`: normalize existing formatting
  so the backend verification baseline can run.
- Existing module and service tests: update dependency construction only where
  required by the new injected service.

## Migrations and dependencies

- No Prisma schema or migration change.
- No new dependency or lockfile change.
- No REST, Socket, DTO, cookie, storage-key, or authorization contract change.

## Tests

1. Unit-test successful persistence, upload failure, database failure with
   successful cleanup, and cleanup failure preserving the original error.
2. Run affected storage, avatar, verification, message, question, and answer
   tests.
3. Run backend `verify`, including real PostgreSQL integration coverage, Prisma
   validation, and production build.
4. Run frontend critical-room Playwright coverage only if a backend response or
   event regression appears; no frontend contract is intentionally changed.

## Risks

- Catching too broadly can hide upload errors; compensation starts only after a
  successful object upload.
- A cleanup error must be logged without exposing file contents or replacing the
  original database error.
- Feature-specific `P2002` conversion, advisory locks, and realtime publication
  must remain in their owning services.
- The working tree contains unrelated presentation mockups; do not stage, edit,
  or delete them.
