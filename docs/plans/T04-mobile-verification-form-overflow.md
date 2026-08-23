# T04 mobile verification form overflow fix

## Goal

Prevent the traveler verification form from exceeding the viewport width on a
390px mobile screen, especially for native date inputs.

## Files

- `frontend/src/app/globals.css`: allow the form, section, grid items, and
  date controls to shrink within their containing card.
- `frontend/e2e/verification-form-layout.spec.ts`: regression check that the
  traveler verification page has no horizontal document overflow at 390x844.

## Migrations

None.

## Tests

- Run the focused Playwright layout check when its real API prerequisites are
  available.
- Run frontend formatting, lint, typecheck, and relevant component tests.

## Risks

Native date controls vary by browser. The fix constrains their layout without
changing their native behavior or submitted values.
