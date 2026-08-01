# Rich room messages and structured live topics

## Goal

Connect chat and topics in both directions, add image and place messages to the
verified room, and provide a structured wait-status topic that turns multiple
on-site answers into a useful live summary.

## Product contract

- Existing message-to-topic promotion remains. Every topic card and topic detail
  also offers `채팅에 공유`, creating a topic-share message in the same room.
- Chat supports four explicit kinds: plain text, protected image with optional
  caption, shared place with user-confirmed coordinates, and topic share.
- Only users with current room participation can create rich messages. Any user
  who can view the verified room can read them and retrieve its images.
- Images accept JPEG, PNG, or WebP signatures up to 10 MiB. They use private
  storage and an authenticated image endpoint; object keys never enter DTOs.
- Place messages require a name and latitude/longitude. The composer warns that
  the selected coordinates are shared with verified room participants.
- Topic categories add waiting status, crowd, operating status, and events.
- Waiting-status answers may include wait minutes, crowd level, entry status,
  and the observation timestamp. The detail response derives a median wait,
  agreement count, latest confirmation, dominant crowd/entry states, and a
  recommended recheck time from active structured answers.
- Any currently verified traveler or local may answer another participant's
  topic. The answer stores and displays the participant kind used at creation.

## Data and API

- Add message-kind and structured-status enums and nullable fields to
  `ChatMessage` and `Answer`; add a many-to-one shared-topic relation.
- Preserve existing text message and message-promotion fields for compatibility.
- Add multipart image, JSON place, topic-share, and authenticated image routes
  below `/api/v1/rooms/:slug/messages`.
- Extend question/answer DTOs and realtime event payloads with explicit public
  rich-message and status-summary contracts.
- Keep writes in REST and reuse existing room authorization and Socket broadcast.

## Frontend design direction

- Subject: a high-signal verified travel room where people can understand a
  place now, not a generic social feed.
- Palette: Canvas `#fff9fb`, Ink `#494653`, Teal signal `#0f9f99`, Berry
  `#cf426f`, Plum `#914ba5`, Iris `#7068d8`.
- Type: existing display face for live status values, body face for answers, and
  utility face for timestamps and observation metadata.
- Chat remains the main linear stream; attachments open from one `+` action tray.

```text
CHAT MESSAGE                       WAIT TOPIC DETAIL
┌ topic / image / place card ┐     ┌ 30–40분 · 4명 일치 ┐
│ semantic preview           │     │ status explanation │
└────────────────────────────┘     ├ wait crowd entry ...┤
       [+] [message........] [↗]   └ latest observations ┘
```

- Signature: a single “live field board” on waiting topics, using teal only for
  currently observed status. Other topic types keep the quieter existing detail
  layout. This reflects the reference screen's hierarchy without copying its
  mobile shell, blue navigation, or decorative density.
- Self-critique: adding a dashboard to every topic would turn a conversational
  service into a generic analytics UI. Limit structured metrics to waiting and
  crowd topics where aggregation is truthful; use explicit `확인 N명 중 M명`
  rather than an unexplained AI badge.

## Tests and rollout

- Commit a forward-only Prisma migration and parser/validation tests.
- Integration-test authorization, upload signatures, place bounds, same-room
  topic sharing, protected image reads, structured-answer validation, summary,
  and realtime-compatible DTOs.
- Frontend-test API parsers, attachment composer states, message cards, share
  mutation, structured answer form, and detail board.
- Run both apps' lint, format, typecheck, tests, backend integration, and builds.

## Risks

- Coordinates are sensitive: require a dedicated action and confirmation copy,
  never expose them outside a verified room DTO.
- Upload/DB failure can orphan objects: store first, delete on transaction error.
- Shared topic messages must reference the same room and an unremoved topic.
- Existing text messages and old answers must parse with null rich fields.
- The current local storage adapter is the supported demo path; production S3
  remains intentionally unavailable until deployment work supplies it.
