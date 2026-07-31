# T08 — resolution, reporting, and moderation plan

## Goal

Complete the topic decision loop and minimum trust-and-safety workflow without
changing the T07A/T07B chat contract: topic owners can accept one eligible
answer or resolve without one, signed-in users can report question/answer/user
targets once, and administrators can audit and review reports with optional
question/answer soft deletion.

## Preconditions checked

- T07B is committed as `e8b6043`; the working tree is clean at task start.
- `Question.acceptedAnswerId`, `resolvedAt`, `removedAt`, and answer removal
  fields already exist. T08 only needs the Report schema plus supporting
  relations/enums and public response fields.
- Existing writes are REST-first and publish Socket events only after commit.
- Existing public question conversion already has a removed-question
  placeholder, but answer redaction and accepted-answer state are not exposed.

## Backend changes

- Extend Prisma with `ReportTargetType`, `ReportReason`, `ReportStatus`,
  `ReportReviewDecision`, and `Report`; add the required unique key, indexes,
  reviewer/reporter relations, and a forward-only SQL migration.
- Add transactional question owner actions:
  - `PATCH /questions/:id/accept-answer`
  - `PATCH /questions/:id/resolve`
- Validate owner, OPEN/unexpired/not-removed state, and same-question,
  non-removed answer inside the transaction. Publish
  `room.question.updated` only after commit.
- Add authenticated `POST /reports` with target existence/ownership checks,
  OTHER detail validation, and duplicate conflict handling.
- Add guarded admin report list/detail/review endpoints. Review updates use a
  PENDING-only transaction, preserve reviewer/time/note audit fields, and soft
  delete only QUESTION/ANSWER targets when explicitly requested.
- Publish `room.content.removed` after a committed soft delete. Public question
  and answer DTOs retain stable ids/metadata but replace original text and URLs
  with a fixed placeholder/null; no private fields enter public events.

## Frontend changes

- Extend runtime-validated question/answer contracts with accepted and removed
  state, plus accept/resolve mutations and realtime cache replacement.
- Add owner-only decision controls to topic detail with an explicit confirmation
  step. A resolved topic shows one quiet resolution strip and the accepted
  answer is marked in the thread.
- Add a compact report sheet/form for other users' topics, answers, and authors;
  validate OTHER detail before calling the real API and expose pending/error/
  success states.
- Add report API/server parsing and an `/admin/reports` route with status/type
  filters, desktop list/mobile cards, detail evidence, and a two-step review
  action. Keep `/admin` focused on verification review and link the two desks.
- Handle `room.question.updated` and `room.content.removed` by updating or
  invalidating affected query caches, with REST refetch after reconnect.

## Design direction

- Subject: a live Jeju help room where the topic owner makes a final decision
  and trust staff review a bounded evidence trail.
- Single jobs: topic detail answers “what resolved this?”; report admin answers
  “what was reported, and what action is justified?”
- Palette: Ink `#191F28`, Canvas `#F7F8FA`, Surface `#FFFFFF`, Signal Magenta
  `#E93CAC`, Signal Purple `#7C3AED`, Safety Red `#E5484D`.
- Type: existing Wanted Sans-style display role, Pretendard-style body role,
  compact uppercase utility labels only where they encode workflow state.
- Layout: keep the established topic card/thread; place resolution controls at
  the seam between topic and answers. The admin view reuses the calm two-column
  review desk rather than introducing dashboard statistics.
- Signature: the accepted answer receives one vertical magenta-to-purple
  “decision thread” that visually connects the resolved topic to the chosen
  evidence. Destructive moderation uses red only for the final confirmed action.
- Self-critique: avoid a generic modal/card stack and decorative gradients.
  The gradient is reserved for the accepted decision thread; reporting remains
  neutral until a destructive action is selected.

## Tests and verification

- Backend unit tests for DTO redaction, acceptance/resolve rules, report
  validation, duplicate mapping, and review transitions.
- Real PostgreSQL integration coverage for E2E-019 through E2E-026, including
  owner/mismatch races, post-resolution answer rejection, duplicate/self
  reports, admin permission, audit fields, soft-delete redaction, and both new
  Socket events.
- Frontend parser/cache/component tests for resolution controls, accepted
  answer, report form, removed placeholders, and admin review.
- Run backend format/lint/typecheck/unit/integration/build/database validation,
  then frontend format/lint/typecheck/test/build on Node 20.
- Exercise login, owner resolution/report creation, and admin report review
  through the running same-origin frontend proxy. Browser viewport QA is
  attempted only through the configured in-app browser.

## Risks

- Acceptance and moderation races can produce invalid double transitions; use
  transaction-scoped advisory locks plus conditional state checks.
- A soft-deleted answer may already be accepted. Do not rewrite historical
  resolution; redact the accepted answer publicly while keeping the relation.
- User reports have no soft-delete action. Review may keep/dismiss them, but a
  REMOVE decision is rejected for USER targets because banning is out of scope.
- Report rate limiting belongs to the cross-cutting T09 hardening task; T08
  implements uniqueness and validation without adding an isolated limiter.
