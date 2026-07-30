# T08 — Answer acceptance, resolution, reports, and moderation

## Goal

Complete the decision loop and minimum trust/safety operations.

## Read first

- QST-003
- SAFE-001, SAFE-002
- ADM-002
- E2E-019 through E2E-026

## Required work

- Question acceptedAnswer relation/migration if not already present
- Accept-answer transaction
- Resolve-without-answer endpoint
- Question updated Socket event
- Report model/enums/migration
- Report creation validation and uniqueness
- Admin report list/detail/review APIs
- Content soft delete for question/answer
- room.content.removed event
- Frontend accept/resolve controls
- Report modal/form
- Admin report UI
- Public removed-content placeholders
- Tests for ownership, mismatch, state transition, duplicate report, admin permission

## Constraints

- No reopen or change accepted answer.
- No automatic content removal based only on report count.
- No hard delete of question/answer.
- No user banning system in P0.
- Day 9 ends with feature freeze.

## Acceptance

- E2E-019 through E2E-026
- Resolved question rejects new answers
- Answer from another question cannot be accepted
- Removed content original text is absent from public API
- Admin actions are audited

