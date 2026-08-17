# T31 — Mobile app visual system and stable navigation

## Goal

Make every authenticated non-room page easier to scan inside the native app
and keep the bottom navigation visually fixed while the document reaches either
scroll boundary.

## Required work

- Replace the floating mobile navigation pill with a full-width, safe-area-aware
  bottom deck that stays flush with the viewport.
- Reduce excessive mobile page-top spacing and reserve enough content space for
  the bottom deck.
- Raise mobile body, caption, form, and control sizes to readable minimums and
  strengthen text and border contrast.
- Apply the same hierarchy to home, community, nearby, profile, verification,
  saved-place, and detail surfaces without changing their product behavior.
- Preserve the dedicated room focus layout introduced in T30.
- Add real-browser regression coverage at 390x844 and desktop coverage at
  1440x900.

## Acceptance

- The mobile bottom deck remains fixed and flush with the visual viewport before
  and after scrolling a page to the end.
- Authenticated pages have no horizontal overflow and their final action/content
  is not hidden behind the deck.
- Primary mobile body copy is at least 15px, utility copy is at least 12px, and
  touch targets are at least 44px where practical.
- Home, community, nearby, profile, verification, and saved-place pages share a
  clear, high-contrast hierarchy at 390x844.
- Room focus mode and its internal scrolling behavior continue to pass T30 tests.
- Frontend lint, format check, typecheck, tests, Playwright checks, and build pass.
