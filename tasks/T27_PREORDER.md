# T27 — Public preorder registration

## Goal

Add a presentation-ready public preorder page that stores consented applicants
in PostgreSQL without exposing the applicant list or whether an email already
exists.

## Required work

- Provide a public `/preorder` page linked from the landing page.
- Collect a name, email address, and explicit required privacy consent.
- Normalize email addresses and store only name, email, consent time, and
  creation time.
- Make repeated submissions idempotent and return the same generic success
  response for new and existing emails.
- Rate-limit public submissions.
- Include loading, validation, success, and server-error states.
- Add a Prisma migration, backend tests, frontend tests, and product docs.

## Out of scope

- Applicant list or admin UI/API.
- Marketing email delivery or third-party integrations.
- IP address, user-agent, referral, or analytics storage.
- Editing or deleting a preorder registration.

## Acceptance

- Valid submissions persist in PostgreSQL.
- Invalid email, name, missing consent, and unknown fields return validation
  errors without creating a row.
- Case-insensitive duplicate submissions keep one database row and return the
  same public success shape.
- No endpoint exposes applicant names or emails.
- The page works at 390x844 and 1440x900.
- Relevant tests, lint, typecheck, and builds pass.
