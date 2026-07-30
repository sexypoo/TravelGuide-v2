# T05 — Room feed and question backend

## Goal

Allow an approved traveler to create and retrieve structured situation questions in the 제주 room.

## Read first

- ROOM-002, ROOM-003
- QST-001, QST-002
- Question data model and APIs
- E2E-011 through E2E-013, E2E-022

## Required work

- Question enums/model/migration
- Room detail and cursor-paginated question list
- Question create endpoint
- Question detail DTO with author public card
- Open-question count limit
- 24-hour expiry calculation and derived EXPIRED public state
- Authorization using shared RoomAccessService
- Text-only safe rendering contract
- Integration tests for roles, windows, limits, expiry, pagination
- API documentation/Swagger updates if enabled

## Constraints

- No answer model yet.
- No WebSocket implementation yet, but expose a service boundary that T06 can publish from after commit.
- Do not add edit/delete.
- Do not include verification evidence or exact GPS in DTO.

## Acceptance

- E2E-011 through E2E-013 backend behavior
- Expired question cannot later accept answers
- Cursor pagination is deterministic by createdAt and id
- User with local-only access cannot create question

