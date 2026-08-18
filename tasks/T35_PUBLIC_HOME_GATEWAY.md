# T35 — Public home gateway

## Goal

Replace the unauthenticated marketing landing page with a compact signed-out
service home that leads directly to login and previews the app destinations a
user can open after authentication.

## Required work

- Keep authenticated root redirects to `/app` or `/admin` unchanged.
- Make login the primary public-home action and account creation secondary.
- Present the Jeju help room, traveler community, and verification as compact
  signed-out entry rows that preserve the intended post-login destination.
- Preserve the MVP headline, authentication-question-answer sequence, service
  health, and emergency/medical disclaimer without long marketing sections.
- Verify 390x844 and 1440x900 with real browser rendering.

## Acceptance

- `/` has no oversized marketing hero, floating demo cards, or multi-section
  landing-page scroll narrative.
- A signed-out visitor can reach login in one action and registration in one
  action; menu rows route through login with a safe `next` path.
- The first viewport identifies the product, shows the primary login action,
  and explains what opens after login.
- The public home has no horizontal overflow at 390px, uses 44px minimum action
  targets, and remains readable at 1440px.
- Existing authenticated redirects, auth forms, API status, and app pages pass.

