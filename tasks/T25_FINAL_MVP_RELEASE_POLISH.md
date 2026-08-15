# T25 — Final MVP release polish

## Goal

Remove the final locally reproducible presentation blockers without adding new
product scope.

## Required work

- Restore the backend integration gate after the public avatar contract change.
- Make the guarded demo reset refresh the canonical topic and answer timestamps
  and remove stale room content authored by managed demo accounts.
- Show approved verification states instead of offering the same application
  again.
- Put the verified real-time room before optional community and nearby features
  on the home screen and in primary navigation.
- Update release documentation with the current candidate evidence while keeping
  external deployment and physical-device gates open.

## Acceptance

- Backend and frontend verification commands pass on the current revision.
- Relevant regression tests cover the demo reset, public profile contract,
  approved verification CTA, and navigation order.
- The demo reset remains explicitly guarded and does not delete content owned by
  non-demo users.
- Presentation documentation does not claim unrun HTTPS, device, rehearsal, or
  backup-video checks.
