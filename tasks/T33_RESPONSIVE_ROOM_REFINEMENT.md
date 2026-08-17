# T33 — Responsive room refinement

## Goal

Correct the focused room after T32 by removing unwanted mobile gutters and
selection lines, replacing the topic-card treatment, and giving desktop chat a
purpose-built wide-screen composition.

## Required work

- Make the mobile room full-bleed and remove the decorative timeline rail that
  reads as empty space on the left.
- Remove the gradient underline from the `대화 / 실시간 토픽` switcher.
- Redesign topic cards around content, status, author, and response count rather
  than stacked pills and a detached share button.
- Separate desktop chat density, header, bubble width, and composer sizing from
  the mobile presentation.
- Preserve T30 viewport containment and T32 readability minimums on mobile.
- Add real-browser regression coverage at 390x844, 390x640, and 1440x900.

## Acceptance

- At 390px the room content reaches both viewport edges without document
  overflow or an unexplained left rail.
- The mobile room switcher has no generated underline in either selected state.
- Topic cards present their question as the primary element and keep metadata
  and share action visually subordinate.
- Desktop chat has a visible conversation header, narrower message measure, and
  denser mouse-oriented composer without inheriting mobile full-bleed rules.
- Message and topic areas remain the only scroll owners and the composer remains
  visible at 390x640.
- Frontend lint, format, typecheck, tests, Playwright, and build pass.
