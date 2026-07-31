# T07 — Core room, question, answer frontend

> Superseded for the room surface by ADR-016 and the follow-up T07A/T07B
> chat-topic slices. The query/detail implementation remains reusable as the
> structured topic layer.

## Goal

Deliver the presentation's central user experience with real REST data and real Socket updates.

## Read first

- Screen sections 9.6 and 9.7
- ROOM-002, QST-001, QST-002, ANS-001, RT-003
- E2E-011 through E2E-018

## Required work

- 제주 room header and trust explanation
- Open/resolved tabs; resolved may be empty until T08
- Cursor pagination or reliable load-more
- Question card list
- Traveler-only question composer
- Question detail route
- Local-only answer form
- Verification badges and source type chips
- TanStack Query keys and typed API hooks
- Singleton authenticated Socket provider
- Event-driven cache update/dedupe
- Rejoin and REST refetch after reconnect
- Loading, empty, error, retry, disconnected states
- Accessible forms and mobile layout

## Constraints

- Do not implement accept/resolve/report yet.
- Do not use fake data after API is available.
- Do not duplicate server data into a second global store.
- Do not show controls the user lacks permission to use.

## Acceptance

- Three browser contexts can observe question/answer updates without refresh.
- Network interruption followed by reconnect restores missed answers.
- Long Korean text wraps without layout break.
- 390x844 and 1440x900 pass visual inspection.
- No duplicate socket event rendering after navigation back and forth.
