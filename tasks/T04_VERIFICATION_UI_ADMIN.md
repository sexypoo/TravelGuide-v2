# T04 — Verification application UI and admin review UI

## Goal

Make traveler/local verification operable end to end by a real user and administrator.

## Read first

- Screen sections 9.4, 9.5, 9.8
- VER-001 through ADM-001
- E2E-004 through E2E-010

## Required work

- My verification status page
- Traveler form: dates, file, note, consent
- Local form: geolocation, accuracy, proof type, file, relationship note, consent
- Geolocation error handling: denied, unavailable, timeout, low accuracy, outside area
- Upload progress or clear pending state
- Submission success and API field errors
- Admin verification list, filters, detail, private evidence access
- Approve and reject confirmation flows
- Query cache invalidation after review
- Mobile and desktop layouts
- Component/form tests where valuable

## Constraints

- Do not show raw coordinates to normal users.
- Do not automatically approve.
- Do not cache evidence URL longer than needed.
- Do not implement question features.

## Acceptance

- A new user can submit each application without dev tools.
- An admin can review and act without Prisma Studio.
- A rejected user sees the reason and can reapply.
- An approved user sees room access after refresh/query invalidation.
- 390x844 has no horizontal overflow.

