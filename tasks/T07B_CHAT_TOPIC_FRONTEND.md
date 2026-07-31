# T07B — room chat and topic frontend

## Goal

Reshape the authenticated room into a live participant conversation with a
structured topic layer, using the T07A REST and Socket contracts.

## Required work

- Persistent cursor-paginated message timeline and message composer.
- Traveler/local/both public badges and own-message treatment.
- Promote an eligible own message into a topic.
- Direct topic creation for either verified participant type.
- Live message and topic cache updates, dedupe, rejoin, and REST refetch.
- Desktop chat + topic rail and focused mobile chat/topic switcher.
- Loading, empty, error, retry, disconnected, and pending states.
- Keep topic detail and local-only structured answer flow working.

## Constraints

- Modify frontend product code only; source-of-truth task/plan docs may be added.
- Do not change backend contracts in this task.
- Do not add message edit/delete/reactions/presence/read receipts.
- Do not implement T08 accept/resolve/report behavior.
- Render all user content as plain text.

## Acceptance

- A message created in one client appears once in another joined client.
- Own messages of 20+ characters can be promoted once and link to the topic.
- Traveler and local users can create messages/topics; answer form stays local-only.
- Reconnect refetches messages, topic feeds, and active topic detail.
- 390x844, 768x1024, and 1440x900 remain usable without horizontal overflow.

