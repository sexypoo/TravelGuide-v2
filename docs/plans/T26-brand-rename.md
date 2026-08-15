# T26 여JJU brand rename

## Goal

Present the service consistently as `여쭈어` (wordmark `여JJU`)
without risking the
release candidate through a repository-wide technical rename.

## Files

- `frontend/src/components/brand/wordmark.tsx` and focused test: update the
  shared accessible wordmark and replace the letter tile with a compact airplane
  symbol.
- `frontend/src/app/globals.css`: refine the mixed Korean/Latin wordmark while
  preserving the current brand palette and dimensions.
- `frontend/src/app/layout.tsx` and `frontend/src/app/page.tsx`: update browser
  metadata, safety copy, and copyright. Suppress root body hydration warnings
  caused by browser extensions that inject attributes before React hydrates.
- `frontend/src/app/layout.test.tsx`: protect the narrowly scoped root hydration
  behavior and declared smooth-scroll behavior with a regression test.
- Primary root/product docs and `docs/DECISIONS.md`: document the new display
  brand and the retained internal identifier boundary.

## Design direction

- Palette: ink `#494653`, canvas `#fff9fb`, magenta `#cf426f`, plum `#914ba5`,
  and iris `#7068d8`.
- Type: Wanted Sans for the wordmark, Pretendard/SUIT for body and controls.
- Layout: keep the existing compact `[monogram] [name]` footprint everywhere.
- Signature: a top-view airplane signal tile followed by `여` in ink and
  gradient `JJU`, connecting travel and Jeju without adding another decorative
  element.

## Migrations and dependencies

- No database migration.
- No dependency change.
- Do not rename package, deployment, database, storage, email, or browser-state
  identifiers.

## Tests

1. Focused wordmark accessibility/render test.
2. Frontend lint and typecheck.
3. Frontend build.
4. Visual verification at 390x844 and 1440x900.
5. Focused root-layout regression test for extension-injected body attributes.

## Risks

- Old screenshots in untracked presentation assets may still show the previous
  wordmark and must be regenerated separately if they are used in the deck.
- Renaming browser storage keys would reset notification preferences, so they
  intentionally remain unchanged.
- `suppressHydrationWarning` only applies to the root body element; genuine
  mismatches deeper in the application remain visible during development.
