# T21 flat room conversation

## Goal

Remove the “screen inside a screen” feeling from the live room. The room header
should identify the space once; messages and the composer should then sit
directly on the room canvas without a second card shell or duplicate chat
header.

## Files

- `frontend/src/components/rooms/room-experience.tsx`: remove the duplicate
  inner conversation heading and label the conversation region directly.
- `frontend/src/components/rooms/room-experience.test.tsx`: protect the flat
  conversation hierarchy.
- `frontend/src/app/globals.css`: remove the chat card border, radius, shadow,
  and white panel; provide one intentional message scroll region sized to the
  viewport; separate desktop topics with a quiet rule instead of another card.

## Design direction

- Canvas: white `#ffffff`, matching the earlier conversation surface without
  restoring its inset-card treatment.
- Messages: directly on the canvas, with the existing restrained bubble colors.
- Structure: room header → trust line → chat/topics switcher → conversation.
- Signature: the conversation is the page, not a widget embedded in the page.

## Validation

- Run formatting, lint, typecheck, unit coverage, and production build.
- Confirm the room keeps one visible title and one message scroll container.
- Check 390x844 and 1440x900 when browser control is available.

## Risks

- The message timeline must remain the scroll owner because follow-to-latest and
  unread-message behavior depend on its scroll position.
- The open room is locked to the viewport so the page and timeline cannot both
  scroll. Locked room guidance remains a normal scrolling page.
- Removing `overflow: hidden` from the old card must not allow attachment or
  topic controls to cover unrelated content.
- Mobile height calculations must leave the composer reachable above the safe
  area without restoring the removed global navigation clearance.
