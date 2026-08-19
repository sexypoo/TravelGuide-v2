# T38 — Private storage lifecycle refactor

## Goal

Centralize the repeated private-object upload, persistence, and compensating
cleanup flow without changing storage keys, API contracts, authorization, or
public behavior.

## Required work

- Add a storage-layer lifecycle service for `putPrivate` followed by a database
  persistence callback.
- Delete a newly uploaded object when persistence fails and preserve the
  original application error.
- Provide one best-effort deletion path with safe structured logging.
- Adopt the lifecycle boundary in verification, message, question, answer, and
  profile-avatar writes.
- Keep all file validation and domain rules in their owning feature services.
- Add focused unit tests for success, persistence failure, and cleanup failure.

## Out of scope

- Database schema or migration changes.
- Storage retention jobs, queues, or an outbox.
- Object-key format, MIME, size, access-control, or response DTO changes.
- Room access, authentication, realtime, and moderation behavior changes.

## Acceptance

- No new private object remains after a failed database write when storage
  deletion succeeds.
- Cleanup failure never replaces the original persistence error.
- Existing feature and integration tests remain green.
- Backend format, lint, typecheck, coverage, schema validation, and build pass.
