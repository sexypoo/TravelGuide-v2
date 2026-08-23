# T04 mobile verification form overflow fix

## Goal

Prevent the traveler verification form from exceeding the viewport width on a
390px mobile screen, especially for native date inputs.

## Files

- `frontend/src/app/globals.css`: allow the form, section, grid items, and
  date controls to shrink within their containing card. Render the visible
  date-field surface on a clipped wrapper so WKWebView native control metrics
  cannot escape the card.
- `frontend/src/components/verifications/traveler-verification-form.tsx`: wrap
  native date controls in the constrained visual frame.
- `frontend/src/app/mobile-app.css`: keep scrolled page content from painting
  into the iOS safe-area gap above the sticky app header.
- `frontend/e2e/verification-form-layout.spec.ts`: regression check that the
  traveler verification page has no horizontal document overflow at 390x844.

## Migrations

None.

## Tests

- Run the focused Playwright layout check when its real API prerequisites are
  available.
- Run frontend formatting, lint, typecheck, and relevant component tests.

## Risks

Native date controls vary by browser and iOS can retain an intrinsic width even
when the input itself has `min-width: 0`. The wrapper clips only the native
paint surface; it does not change picker behavior or submitted values.
