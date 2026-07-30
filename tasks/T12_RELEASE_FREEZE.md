# T12 — Release freeze and presentation rehearsal

## Goal

Freeze a reliable demonstration build. Fix bugs only.

## Read first

- MVP completion definition
- Final presentation checklist
- All unresolved entries in DAILY_STATUS and DECISIONS

## Required work

- Run full verify and E2E suite
- Rehearse traveler + two locals + admin three times
- Test actual mobile device and desktop
- Test reconnect, refresh, and server restart
- Prepare demo reset steps and backup screen recording
- Resolve only release-blocking or high-severity defects
- Create release notes and tag
- List known limitations honestly

## Constraints

- No new feature, dependency, schema redesign, or visual redesign.
- Avoid last-minute production migration unless fixing a release blocker.
- Preserve a rollback point.

## Acceptance

- Three consecutive successful rehearsals
- No open critical/high security or data-integrity issue
- Presentation account credentials stored outside repository
- Final release tag and rollback instructions exist
- Known limitations match the declared out-of-scope list

