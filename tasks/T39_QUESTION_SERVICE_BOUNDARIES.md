# T39 — Question service boundaries

## Goal

Split the question module by read, command, expiry, and pure summary
responsibilities without changing routes, response DTOs, authorization, state
transitions, or realtime events.

## Required work

- Move list, detail, and private-image reads into a query service.
- Move creation, promotion, acceptance, and resolution into a command service.
- Let the existing expiry service own both scheduling and the atomic expiry
  batch.
- Move live waiting/crowd aggregation into a pure domain module.
- Share only the Prisma question record shape and common not-found problem.
- Update controllers and focused tests to use the narrower services.

## Out of scope

- API, DTO, Prisma schema, migration, storage, or Socket contract changes.
- Authorization rule changes or edits to `RoomAccessService`.
- New repository abstractions, queues, cron packages, or dependencies.
- Query optimization or product behavior changes.

## Acceptance

- Existing question routes and response bodies remain unchanged.
- Advisory locks and state checks remain inside command/expiry transactions.
- Socket events are still emitted only after committed writes.
- Backend `verify` and critical browser E2E pass.
