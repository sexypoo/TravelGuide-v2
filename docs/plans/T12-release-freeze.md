# T12 release freeze and presentation rehearsal

## Goal

Freeze the current feature set, prepare a repeatable presentation rehearsal,
and create an honest release record without declaring success before the real
HTTPS, browser, mobile, restart, and three-run gates pass.

## Scope

- Documentation and release bookkeeping only unless a critical/high defect is
  reproduced.
- No feature, dependency, schema, migration, or visual redesign.
- Preserve commit `755772e` as the pre-freeze deployment rollback point.

## Artifacts

- `docs/PRESENTATION_CHECKLIST.md`: environment, reset, three-run matrix, mobile,
  reconnect, restart, security, backup recording, and sign-off.
- `docs/RELEASE_NOTES.md`: demonstrated functionality and operational changes.
- `docs/KNOWN_LIMITATIONS.md`: explicit MVP boundaries and current blockers.
- `docs/DAILY_STATUS.md`: T12 status remains blocked until external gates pass.

## Verification order

1. Restore Docker/browser availability and run backend/frontend `verify`.
2. Run Playwright three consecutive times without retrying individual failures.
3. Deploy the exact candidate revision using `docs/DEPLOYMENT.md`.
4. Run production smoke, reboot, and run production smoke again.
5. Rehearse traveler + local A + local B + admin at desktop and mobile sizes
   three consecutive times, resetting demo data before each run.
6. Record a backup video, store credentials outside Git, sign off known
   limitations, then create annotated tag `v0.1.0`.

## Stop conditions

- Any critical/high authorization, private-data, upload consistency, state
  transition, or Socket reconnect defect blocks tagging.
- A failed rehearsal resets the consecutive-success count to zero.
- Missing HTTPS, GPS, WebSocket upgrade, reboot recovery, or backup video blocks
  release even when local tests pass.
