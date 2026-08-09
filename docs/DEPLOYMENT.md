# TravelGuide Railway deployment

This runbook deploys TravelGuide v2 to one Railway project without AWS. Create
four resources in the same `production` environment:

| Resource | Source root | Public | Purpose |
| --- | --- | --- | --- |
| `frontend` | `/frontend` | Yes | Next.js web application |
| `backend` | `/backend` | Yes | NestJS API and Socket.io |
| `Postgres` | Railway managed | No | Application database |
| `uploads` | Railway Bucket | No | Private evidence and chat media |

The backend proxies authorized private files from the bucket. Do not expose the
Postgres service or bucket publicly.

## 1. GitHub services

Connect both application services to the same GitHub repository and `main`
branch. Set each service's Root Directory exactly as shown above. Both folders
contain a Dockerfile, so custom build and start commands are unnecessary.

The backend container runs `prisma migrate deploy` and the idempotent base seed
before starting NestJS. The base seed only upserts the Jeju destination and
room; demo accounts are never created automatically. Do not use `prisma db push`
in production. Configure the backend health check as `/health/ready` after its
public domain and database are available.

The application reads Railway's generated `PORT` automatically and binds to
`0.0.0.0`.

## 2. Backend variables

Add these variables to the `backend` service. Use Railway variable references
instead of copying secret values where possible.

```text
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
WEB_ORIGIN=https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}
JWT_SECRET=<sealed random value of at least 32 characters>
JWT_EXPIRES_IN=24h
STORAGE_DRIVER=s3
INITIAL_ADMIN_EMAIL=<production administrator email>
INITIAL_ADMIN_PASSWORD=<sealed 10-72 character password with a letter and digit>
INITIAL_ADMIN_NICKNAME=<unique 2-20 character nickname>
GOOGLE_PLACES_API_KEY=<sealed Google server API key>
```

Do not set `PORT`; Railway supplies it. `API_PORT` remains supported outside
Railway, but `PORT` takes precedence when present. `FRONTEND_URL` is accepted as
a legacy alias for `WEB_ORIGIN`.

Generate the JWT secret outside Git, for example with `openssl rand -base64 48`,
and paste it into a sealed Railway variable. Keep `INITIAL_ADMIN_PASSWORD` sealed
as well. The base seed creates the administrator only when the email does not
exist; later deployments do not reset an existing administrator password.

## 3. Railway Bucket

Create a Storage Bucket named `uploads`, then use its Credentials tab to inject
the AWS SDK-compatible variables into the `backend` service. The application
supports Railway's current automatic variable names:

```text
AWS_ENDPOINT_URL
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME
AWS_DEFAULT_REGION
AWS_S3_URL_STYLE
```

It also supports direct Railway references if automatic injection is not used:

```text
S3_ENDPOINT=${{uploads.ENDPOINT}}
S3_ACCESS_KEY_ID=${{uploads.ACCESS_KEY_ID}}
S3_SECRET_ACCESS_KEY=${{uploads.SECRET_ACCESS_KEY}}
S3_BUCKET=${{uploads.BUCKET}}
S3_REGION=${{uploads.REGION}}
S3_URL_STYLE=virtual
```

Use `BUCKET`, not `RAILWAY_BUCKET_NAME`, for the S3 API bucket name. New Railway
buckets use `virtual` URL style. If the Bucket Credentials tab explicitly says
the bucket is an older path-style bucket, set `S3_URL_STYLE=path`.

Railway Buckets are private and S3-compatible. They replace AWS S3 for the first
release without changing stored object keys, so a later migration to AWS can
reuse the same storage interface.

## 4. Google Maps and Places

In Google Cloud, enable **Maps JavaScript API** and **Places API (New)**, attach
a billing account, and create two separate keys:

- Server key: restrict to Places API (New), keep it sealed in Railway as
  `GOOGLE_PLACES_API_KEY`, and never expose it to the browser.
- Browser key: restrict by HTTP referrer to the production and preview frontend
  domains, allow Maps JavaScript API, and set it as
  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel.

Set conservative daily quotas and billing budget alerts before launch. Place
search is proxied through the backend. The more expensive nearby opening-hours
request is only sent when a user explicitly taps the nearby-open-restaurants
button.

## 5. Frontend variables

Add this runtime variable to the `frontend` service:

```text
API_INTERNAL_URL=http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:${{backend.PORT}}
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<HTTP-referrer-restricted browser key>
```

The browser uses the frontend's same-origin routes; it must not receive a
`*.railway.internal` URL. Generate a public domain for the frontend. The backend
also needs a public domain for direct health checks and any Socket.io route that
is not proxied by the frontend.

When deploying the frontend to Vercel, use the backend's **public HTTPS domain**
for `API_INTERNAL_URL`; Vercel cannot resolve Railway private networking. The
private-domain example above applies only when the frontend is also on Railway.

## 6. First deploy order

1. Create `Postgres` and `uploads`.
2. Create `backend`, set its root directory and all variables, then deploy.
3. Confirm migration and base-seed output, then check `GET /health/ready`.
4. Create `frontend`, set `API_INTERNAL_URL`, then deploy.
5. Put the frontend Railway HTTPS origin in backend `WEB_ORIGIN` and redeploy the
   backend if the reference was not already used.
6. Verify login, room join, Socket.io reconnect, image upload/download, and topic
   sharing in a real browser.

## 7. Smoke checks

Use an approved demo traveler or local account:

```bash
cd backend
SMOKE_BASE_URL=https://<backend-domain> \
SMOKE_EMAIL='<demo-email>' \
SMOKE_PASSWORD='<secret-value>' \
corepack yarn smoke:production
```

The smoke command checks HTTPS health, login cookie behavior, WebSocket
transport, and authorized room join. Never commit the password or paste it into
deployment logs.

Also confirm:

- `/health/live` and `/health/ready` return success.
- Railway deploy logs show a successful Prisma migration before Nest starts.
- A private upload can be read only by an authorized user.
- A redeploy does not remove uploaded files.
- Frontend requests and Socket.io use the expected HTTPS origin.

## 8. Rollback

Railway application rollback does not roll back PostgreSQL schema changes.
Before a migration, create or verify a database backup and review whether the
migration is backward compatible. If a release fails:

1. Stop or limit writes when data compatibility is uncertain.
2. Roll back the frontend and backend deployments to the recorded revision.
3. Restore the database only when the migration requires it.
4. Repeat health, login, Socket.io, and private upload checks.

## 9. Later AWS migration

When AWS becomes available, copy private objects from Railway Bucket to a private
S3 bucket, then replace the six storage variables with AWS values. Remove
`S3_ENDPOINT` for standard AWS S3 and keep `STORAGE_DRIVER=s3`. Validate object
counts and authorized downloads before deleting the Railway Bucket.
