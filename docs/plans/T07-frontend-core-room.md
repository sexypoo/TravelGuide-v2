# T07 frontend core room plan

## Goal and scope

Implement only frontend T07 in `frontend/`: the authorized Jeju room feed, traveler question composer, question detail, local answer form, TanStack Query cache, and one authenticated Socket.io provider. Use the real T05/T06 REST and Socket contracts. Do not modify `backend/` or implement accept, resolve, report, edit, delete, presence, typing, notifications, or fake data.

Backend T06 is committed as `969d0ae`, its Node 20 verify passed, and the local API preview runs the T06 image on port 3001.

## Product and design thesis

Subject: a time-sensitive Jeju help room for authenticated travelers and locals. Audience: a traveler whose plan has just changed and a local who can make the next decision easier. The page's single job is to move one concrete situation from question to grounded local answers without making the user learn a chat product.

### Compact token system

- `Signal ink #191F28`: primary text and decisive actions.
- `Jeju mist #F7F8FA`: quiet app canvas.
- `Paper #FFFFFF`: question and answer surfaces.
- `Signal magenta #E93CAC`: urgent/question-origin accent used sparingly.
- `Guide purple #7C3AED`: navigation, verified state, and focus.
- `Local green #00A878`: connected state and local-answer confirmation.
- Display role: Wanted Sans/Pretendard heavy with tight Korean spacing for room and question headlines.
- Body role: Pretendard/SUIT for readable long Korean text.
- Utility role: SFMono/ui-monospace only for live state, timestamps, and remaining-time labels.

### Layout exploration

Generic dashboard exploration rejected:

```text
[title] [three statistic cards]
[feed table                    ]
```

It overemphasizes counts and could belong to any admin product. The room is about a human signal moving from a traveler to multiple locals.

Chosen desktop room layout:

```text
[← home]  JEJU LIVE — connected        [verified role]
[room thesis + trust copy              ] [ask / answer guidance]
[OPEN | RESOLVED]                         [now ask]
  ●── [question card / author / expiry / answer count]
  │   [question card / author / expiry / answer count]
  ●── [question card / author / expiry / answer count]
                         [load more]
```

Chosen question detail:

```text
[← Jeju room] [status + remaining time]
[full question / traveler badge]
  │
  ●── [local answer / evidence chip / verified date]
  ●── [local answer / official HTTPS link]
[local-only answer composer]
```

On mobile the layout becomes one column, the signal line remains a quiet left rail, and the primary composer opens inline rather than covering content. The bottom application navigation remains unobstructed.

### Signature and restraint

The memorable element is the “Jeju live signal line”: one magenta-to-purple hairline with state dots connecting the room heading, questions, and local answers. It encodes the actual traveler-to-local flow and gently reacts when a real event arrives. Gradients are otherwise limited to the primary action and verified signal dot; cards stay white with restrained borders and shadows.

After critique, decorative map rings, statistic tiles, glass panels, and repeated gradient chips were removed. They duplicate the existing home visual language without helping the room task. Motion is limited to one arrival highlight and the connected pulse, with reduced-motion support.

## Architecture and files

- Add pinned TanStack Query 5.x and Socket.io client 4.8.1 dependencies.
- Add a client `AppProviders` boundary to the existing authenticated app layout, owning one `QueryClient` and one `RealtimeProvider` for the full authenticated session.
- Add strict runtime parsers and types for question pages, detail answers, public badges, event envelopes, and API problem responses. Never trust `response.json()` directly.
- Add canonical query keys for room feed and question detail; use `useInfiniteQuery` for cursor load-more and mutations for question/answer REST writes.
- The realtime provider connects with cookie credentials, reference-counts joined room slugs, rejoins on every connection, merges created entities by id, and invalidates room/detail REST queries after reconnect. It exposes connected/reconnecting/disconnected state without creating a second server-data store.
- Replace the authorized placeholder in `/app/rooms/[slug]` with a client room experience while preserving the locked introduction and verification CTA.
- Add `/app/questions/[id]` as the real detail route, using the Jeju room access contract to show only the traveler/local controls the current user owns.
- Add focused components for room header/status, question feed/card/composer, question detail, answer list/card/form, and small source/status formatters.
- Append a scoped T07 stylesheet section to the existing visual system and preserve existing T00–T04 selectors.

## Data and interaction rules

- OPEN/RESOLVED tabs produce separate infinite-query caches. Load-more uses only the opaque `nextCursor` returned by the API.
- Question cards use semantic links and render user content as React text only. Long Korean content uses safe wrapping and no `dangerouslySetInnerHTML`.
- The question composer is rendered only for `canAskQuestion`; the answer form only for `canAnswer`, an OPEN/unexpired question, and a different author id.
- Question and answer mutations disable repeat submission, map domain errors to actionable Korean messages, and refetch authoritative REST data after success.
- Official source links require parsed HTTPS, open in a new tab, and use `rel="noopener noreferrer"`.
- Socket question/answer handlers deduplicate by entity id before merging. Reconnect rejoins then invalidates the feed and active detail queries. A polite `aria-live` region announces a newly received answer and the visible connection state explains recovery.
- Loading skeletons, empty invitations, request errors with retry, mutation errors, cursor-loading, and disconnected/reconnecting banners are implemented without fake success content.

## Tests and verification

Unit/component tests cover strict parsers/private-field rejection, feed deduplication, question and answer form capability visibility, source URL rendering, mutation disabled/error states, and socket cache merge helpers.

Run from `frontend/` on Node 20:

```bash
yarn format
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn build
yarn verify
```

Then run the real frontend and T06 backend and inspect `/app/rooms/jeju` and a question detail at 390x844, 768x1024, and 1440x900. Verify keyboard focus, long Korean wrapping, empty/loading/error states where controllable, role-specific controls, event arrival, navigation back/forth without duplicate listeners, and no horizontal overflow.

## Risks and review

- Cache duplication: all event merge helpers compare entity ids and use canonical keys; provider lifecycle lives once above routes.
- Reconnect gap: Socket never becomes truth; every reconnect rejoins and invalidates REST queries.
- Authorization drift: server `Room.access` determines control visibility, while the backend remains authoritative for every write/join.
- Cookie/path mismatch: use the current origin, default `/socket.io`, and `withCredentials: true` through the existing Next/API same-origin development setup.
- Visual regression: new CSS is scoped under room/detail classes and checked at all three required viewports.
- Scope creep: no T08 buttons or placeholder actions are rendered.
