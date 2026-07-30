# T06 — Answers and real-time backend

## Goal

Complete the multi-local real-time capability using REST writes and Socket.io broadcasts.

## Read first

- ANS-001
- RT-001 through RT-003
- Architecture sections 7 and 8
- E2E-014 through E2E-018

## Required work

- Answer enums/model/migration
- Create answer endpoint and DTO
- Source type and official HTTPS URL validation
- Own-question and per-local answer limits
- Socket gateway authenticated from cookie
- room.join/room.leave with RoomAccessService
- `RealtimePublisher` invoked after committed question and answer writes
- Public event DTOs and event ids
- Socket integration test with at least two clients
- Reconnect-compatible API behavior

## Constraints

- No writes in Socket handlers except join/leave state.
- Do not trust client room id or role.
- Do not add typing, presence, read receipts, or notifications.
- Do not emit raw Prisma objects.

## Acceptance

- E2E-014 through E2E-018 backend/socket behavior
- Unauthorized socket join is rejected
- Event is not sent if DB write fails
- Same answer id can be safely deduplicated by client
- Official source accepts https only

## Mandatory review

Inspect for duplicate listeners, namespace/path mismatch, cookie/CORS issues, and broadcast-before-commit errors.

