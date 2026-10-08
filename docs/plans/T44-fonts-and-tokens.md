# T44 self-host web fonts and unify color tokens

## Goal

Fix the two system-level problems found during T42 so every screen, desktop
and mobile, renders with the intended type and one set of color values. Later
screen work (landing, verification, nearby, profile, admin) builds on this.

## Problems

1. `--display` names `Wanted Sans Variable` and `--body` names
   `Pretendard Variable`, but no `@font-face` exists and CSP is
   `font-src 'self' data:`. Every visitor without those fonts installed gets
   Apple SD Gothic Neo / Noto Sans KR / system-ui instead. Headings and body
   currently look the same on most devices.
2. `:root` (desktop and the room shell) uses the pre-T31 palette
   (`--ink #494653`, `--magenta #cf426f`, `--purple #7068d8`, …), while
   `.appShell:not(.appShell--room)` under 760px overrides them with the T31/T42
   palette (`#282531`, `#c73568`, `#675dda`, …). The same screen looks washed
   out on desktop, and the room screen on mobile uses the old values.

## Approach

### Fonts

- Vendor the official dynamic-subset variable builds, both SIL OFL 1.1:
  - Pretendard Variable 1.3.9 (`pretendard` npm package,
    `dist/web/variable/woff2-dynamic-subset`, 92 files, about 3.0 MB total)
  - Wanted Sans Variable 1.0.3 (`wanted-sans` npm package,
    `fonts/webfonts/variable/split/woff2`, 92 files, about 2.3 MB total)
- Each slice has a `unicode-range`, so a browser downloads only the slices
  for the characters on the page (typically a few hundred KB), not the full
  2.0 MB + 1.3 MB files. `next/font/local` was rejected: it takes one file per
  weight range, so it would preload the full files on every page.
- Files live in `frontend/src/app/fonts/<family>/` with the upstream
  `@font-face` CSS rewritten to relative URLs. Next.js emits them under
  `/_next/static/media` with content hashes and immutable caching, so they
  satisfy `font-src 'self'` without a CSP change.
- `font-display: swap` stays (upstream default). The existing fallback stacks
  stay behind the web fonts.
- License texts are committed beside the fonts.
- No npm dependency is added; the packages are only the download source.

### Tokens

- `:root` adopts the T31/T42 values: ink `#282531`, muted `#625c69`, subtle
  `#77717e`, line `rgba(40, 37, 49, 0.12)`, line-strong
  `rgba(40, 37, 49, 0.2)`, magenta `#c73568`, purple `#675dda`, purple-dark
  `#5148b4`, plum `#8a3e8f`, the matching soft tints, gradients and card shadow.
- The token overrides in `mobile-app.css` are removed; the mobile shell keeps
  its layout rules and reads the shared tokens.
- Hardcoded copies of the old palette in `globals.css` (39 `rgba()` tints of
  the old ink/magenta/iris, `#eee7ec`, one conic gradient) move to the new
  values so nothing keeps the old hue.
- `--berry-soft`, `--iris-soft` and `--plum-soft` keep their names.

## Files

- `frontend/src/app/fonts/pretendard/*` (new): woff2 slices, `pretendard.css`, `LICENSE.txt`
- `frontend/src/app/fonts/wanted-sans/*` (new): woff2 slices, `wanted-sans.css`, `LICENSE.txt`
- `frontend/src/app/layout.tsx`: import the two font stylesheets
- `frontend/src/app/globals.css`: `:root` token values, old-palette literals
- `frontend/src/app/mobile-app.css`: drop the token override block
- `docs/DECISIONS.md`: ADR for self-hosted dynamic-subset fonts
- `docs/DEPLOYMENT.md`: health check path is `/api/v1/health/ready`

## Migrations

None.

## Tests

- `yarn lint`, `yarn format:check`, `yarn typecheck`, `yarn test`, `yarn build`
- Playwright `mobile-app-shell`, `critical-room`, `locked-room-layout`
- Before/after screenshots at 390x844 and 1440x900 of landing, `/app`, room,
  topic detail, community; confirm in the browser that the
  `Pretendard Variable` and `Wanted Sans Variable` faces load
  (`document.fonts`), with no CSP violations in the console.

## Risks

- Desktop screens get darker text and stronger magenta/iris. This is intended
  (T42 decision), but it changes every desktop screen at once. Screenshots are
  reviewed before commit.
- Real fonts change glyph widths; tight layouts (chat header, buttons,
  badges) may wrap differently. Checked at both viewports.
- About 5.4 MB of binary font files are added to the repository.
