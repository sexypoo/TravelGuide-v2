# TravelGuide backend

NestJS API scaffold for TravelGuide v2. Product features start in later tasks.

## Prerequisites

- Node.js 20.x
- Corepack
- Docker Desktop with Docker Compose

## First setup

Run all commands from this `backend/` directory.

```bash
corepack enable
cp .env.example .env
yarn install
yarn db:up
yarn db:migrate
yarn db:seed
yarn dev
```

The API listens on `http://localhost:3001`. Confirm it with:

```bash
curl http://localhost:3001/api/v1/health/live
```

The response includes `status: "ok"` and an ISO 8601 UTC timestamp. Stop the
database with `yarn db:down`.

Use `/api/v1/health/ready` for deployment readiness checks. It returns success
only after a live PostgreSQL query; `/health/live` deliberately checks the API
process only.

## Authentication API

T01 provides the real cookie-authenticated endpoints below:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Registration requires `email`, `password`, `nickname`, and `termsAgreed: true`.
The access JWT is returned only in the `tg_access` httpOnly cookie. It is never
included in JSON or browser storage.

## Profile and room-shell API

T02 adds authenticated profile and room metadata endpoints:

```text
GET   /api/v1/users/me
PATCH /api/v1/users/me
GET   /api/v1/users/:userId/public
GET   /api/v1/rooms
GET   /api/v1/rooms/:slug
GET   /api/v1/rooms/:slug/content-access
```

Regular users can view the Jeju room metadata. `content-access` allows an
approved traveler from 24 hours before through 24 hours after the trip, an
unexpired approved local, and administrators; all others receive
`ROOM_ACCESS_DENIED`. The endpoint is an authorization probe, not a placeholder
question feed.

## Verification and administrator API

T03 adds private multipart verification and review endpoints:

```text
GET    /api/v1/verifications/me
POST   /api/v1/verifications/traveler
POST   /api/v1/verifications/local
GET    /api/v1/admin/verifications
GET    /api/v1/admin/verifications/:id
GET    /api/v1/admin/verifications/:id/evidence
PATCH  /api/v1/admin/verifications/:id/review
```

Use multipart field `proofFile` for one JPEG, PNG, or PDF up to 5 MiB. Evidence
is stored below `LOCAL_STORAGE_DIR` in development/test and is never served as a
static public path. Only an authenticated administrator can stream it through
the evidence endpoint. Production requires `STORAGE_DRIVER=s3` and fails closed
until a private S3 adapter and deployment credentials are configured.

## Room chat and topic API

T05 and T07A provide persistent chat plus structured topic endpoints. The
existing `questions` path remains for API compatibility while the product UI
calls these records topics.

```text
GET  /api/v1/rooms/:slug/messages?cursor=&limit=50
POST /api/v1/rooms/:slug/messages
GET  /api/v1/rooms/:slug/questions?status=OPEN&cursor=&limit=20
POST /api/v1/rooms/:slug/questions
GET  /api/v1/questions/:questionId
PATCH /api/v1/questions/:questionId/accept-answer
PATCH /api/v1/questions/:questionId/resolve
POST /api/v1/reports
GET  /api/v1/admin/reports?status=PENDING&targetType=ANSWER
GET  /api/v1/admin/reports/:id
PATCH /api/v1/admin/reports/:id/review
```

## Open community API

The community requires a signed-in account but does not require traveler or
local evidence verification. Regular users can publish destination-neutral
tips and questions, and comment on other posts. Administrator accounts can
read and moderate but cannot publish.

```text
GET  /api/v1/community/posts?category=TRAVEL_TIP&cursor=&limit=20
POST /api/v1/community/posts
GET  /api/v1/community/posts/:postId
POST /api/v1/community/posts/:postId/comments
```

Posts accept a category, optional free-text area, title, and plain-text body.
Community posts/comments use the existing report and audited soft-removal
workflow. Creation is rate-limited to 10 posts and 30 comments per 10 minutes.

Room reads and participant writes require a valid traveler or local
verification; administrators remain read-only. Messages accept 1–500 characters
of plain text and load the latest 50 in chronological display order with an
opaque cursor for older history.

A topic accepts `category`, `urgency`, 20–1000 character plain-text `content`,
and optional `areaText` up to 60 characters. Alternatively,
`sourceMessageId` promotes the current user's same-room message and uses its
content. One message can become only one topic. Each participant can have at
most three non-expired open topics in one room. Topics expire after 24 hours;
an expired open record is returned with the derived public status `EXPIRED`.
The topic owner can atomically accept one same-topic, non-removed answer or
resolve without an answer. Both transitions are final and reject later answers.

The feed defaults to 20 items and accepts limits from 1 through 50. Pass the
opaque `nextCursor` from one response as `cursor` for the next page. Feed
responses expose only the author's public id, nickname, and creation-time
participant badge. Safety topics include the 112/119 emergency notice.

## Answer and realtime API

T06 adds verified-local answers and Socket.io broadcasts:

```text
POST /api/v1/questions/:questionId/answers
```

Answers require a valid local verification, 10–1000 character plain-text
`content`, and one of `ON_SITE_NOW`, `RECENT_EXPERIENCE`, `OFFICIAL_SOURCE`, or
`PERSONAL_OPINION`. An official source requires a valid HTTPS `sourceUrl`. A
local cannot answer their own question and can post at most three answers per
question. The question must remain OPEN and unexpired.

Socket.io uses the default namespace and `/socket.io` path. It authenticates the
same `tg_access` cookie and accepts only these client events:

```text
room.join  { roomSlug }
room.leave { roomSlug }
```

After server-authorized join, committed REST writes broadcast
`room.message.created`, `room.question.created`, `room.answer.created`,
`room.question.updated`, and `room.content.removed`.
Every event contains an
`eventId`, `roomSlug`, `occurredAt`, and the same public DTO used by REST. Events
are an immediate update signal; after reconnect clients must rejoin and refetch
the feed/detail REST endpoints.

Signed-in users can report a question, answer, community post/comment, or user once. Own-content
reports are rejected, and `OTHER` requires a 10–300 character detail. Reports
never hide content automatically. Administrators can keep, dismiss, or
explicitly soft-delete question/answer/community content; reviewer, timestamp, and note
are retained. Public DTOs replace removed original text with a fixed notice and
remove source URLs, while administrator report detail retains the audit copy.

## Security and operations

The API emits restrictive security headers, allows credentialed CORS only from
the exact `WEB_ORIGIN`, and writes JSON request logs with request ID, method,
path, status, duration, and authenticated user ID when available. Request
bodies, cookies, credentials, evidence metadata, and coordinates are excluded.

Fixed-window limits apply per IP to login (5/minute), and per user to topic
creation (5/10 minutes), answers (20/10 minutes), and reports (10/hour). A
rejected request returns `429`, `Retry-After`, and Korean retry guidance. This
in-memory limiter is intended for the single API presentation deployment; use a
shared store before horizontally scaling.

Private verification evidence is retained only while a pilot is active and is
scheduled for deletion no later than 30 days after that pilot ends. Until
automated retention exists, an administrator must delete both the private
object and its database record during the post-pilot checklist. Legal holds or
active disputes pause deletion and must be recorded outside the public API.

## Quality commands

```bash
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn test:integration
yarn build
yarn verify
```

`yarn verify` runs all backend quality checks, Prisma schema validation, and the
production build. Integration tests migrate and use the isolated PostgreSQL URL
from `TEST_DATABASE_URL`, then boot a real Nest HTTP server.

## Database commands

```bash
yarn db:up
yarn db:validate
yarn db:generate
yarn db:migrate
yarn db:seed
yarn db:seed:demo
yarn db:deploy
yarn db:down
```

T00 contains only an infrastructure `SystemMetadata` model so Prisma generation,
connection, and migrations can be proven end to end. T01 adds users, T02 adds
the Jeju destination/room, T03 adds verification/review records, and T05 adds
room questions. `yarn db:seed` safely upserts the fixed Jeju metadata and can be
rerun without duplicate rows.

### Local demo accounts

`db:seed:demo` idempotently prepares one administrator, two approved travelers,
and two approved locals. It is separate from the normal seed and refuses to run
without an explicit switch. Passwords are never committed.

```bash
DEMO_SEED_ENABLED=true \
DEMO_USER_PASSWORD='<local demo password>' \
DEMO_ADMIN_PASSWORD='<local admin password>' \
yarn db:seed:demo
```

The managed identities are `admin@travelguide.local`,
`demo@travelguide.local`, `traveler2@travelguide.local`,
`local1@travelguide.local`, and `local2@travelguide.local`. For this workspace,
the actual credentials are recorded only in the Git-ignored
`.data/DEMO_ACCOUNTS.md` file. Running the command again resets the managed
passwords and refreshes their demo verification validity.

## Environment

Copy `.env.example` to `.env`. Startup fails immediately when `DATABASE_URL`,
`API_PORT`, `WEB_ORIGIN`, `JWT_SECRET`, or `JWT_EXPIRES_IN` is invalid. Do not
commit `.env` or real secrets. Production rejects the example JWT secret and
local evidence storage, requires a JWT secret of at least 32 characters, and
requires an HTTPS `WEB_ORIGIN` with no credentials, path, query, or fragment.

`TEST_DATABASE_URL` must point to a database separate from `DATABASE_URL`. A clean
Docker volume creates `travelguide_test` automatically. For a volume created
before T01, create it once with:

```bash
docker compose exec postgres createdb -U travelguide travelguide_test
```

## Troubleshooting

- If Yarn reports version 1.x, use `corepack yarn --version` and confirm it prints
  `4.2.2`. Node 20 installations normally include Corepack.
- If port 5432 is occupied, change `POSTGRES_PORT` and update the port in
  `DATABASE_URL` to match.
- If the database is unhealthy, inspect it with `docker compose ps` and
  `docker compose logs postgres`.
- If Prisma cannot connect, confirm the container is healthy and `.env` uses
  `localhost` when commands run on the host.
- Prisma 5.22 is validated on the required Node 20 runtime. Newer unsupported Node
  majors can fail in the schema engine even when application TypeScript succeeds.
- Delete `node_modules` only as a last resort; first rerun `yarn install --immutable`
  so the committed lockfile remains the source of truth.
