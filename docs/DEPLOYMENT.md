# TravelGuide production deployment

This runbook targets one Linux host with Nginx and PM2, a managed PostgreSQL 16
database, and a private S3 bucket. The public surface is one HTTPS origin; ports
3000, 3001, and 5432 must not be exposed by the host firewall.

## 1. Required external resources

- DNS A/AAAA record for the presentation domain.
- PostgreSQL 16 database reachable only from the application host.
- Private S3 bucket with public access blocked, versioning enabled, and a
  lifecycle policy appropriate for verification evidence.
- Instance role, workload identity, or least-privilege AWS credentials allowing
  `s3:GetObject`, `s3:PutObject`, and `s3:DeleteObject` only below the bucket's
  `verification/`, `room-media/`, `answer-media/`, and `question-media/` prefixes.
- Node.js 20, Corepack, Nginx, Certbot, and PM2 installed on the host.

Do not add bucket website hosting, public ACLs, or public object URLs. Downloads
are authorized by NestJS and streamed from S3 through the same HTTPS origin.

## 2. Environment files

Copy `backend/.env.production.example` to `backend/.env` and
`frontend/.env.production.example` to `frontend/.env.production`. Replace every
blank required value and the example public origin. Prefer an instance role; if
static AWS credentials are unavoidable, provide both key variables.

```bash
chmod 600 backend/.env frontend/.env.production
```

`WEB_ORIGIN` must exactly equal the public HTTPS origin. `API_INTERNAL_URL` stays
on loopback and is never a browser-visible API base URL. Generate a JWT secret
with at least 32 random characters and store it outside Git.

## 3. First HTTPS setup

Obtain the certificate before enabling the TLS server block. Then render the
checked-in template with the domain as the only substitution:

```bash
export TRAVELGUIDE_DOMAIN=travel.example.com
envsubst '${TRAVELGUIDE_DOMAIN}' \
  < deploy/nginx/travelguide.conf.template \
  | sudo tee /etc/nginx/sites-available/travelguide.conf >/dev/null
sudo ln -s /etc/nginx/sites-available/travelguide.conf /etc/nginx/sites-enabled/travelguide.conf
sudo nginx -t
sudo systemctl reload nginx
```

Use the host's approved Certbot flow and confirm automatic renewal with
`certbot renew --dry-run`. The template redirects HTTP to HTTPS, forwards REST
and Socket.io to NestJS, forwards all other traffic to Next.js, and accepts the
current 10 MiB media limit with a 12 MiB proxy ceiling.

## 4. Deploy

Record the current revision and take a PostgreSQL snapshot before every deploy.
From the repository root:

```bash
git rev-parse HEAD
cd backend
corepack yarn install --immutable
corepack yarn verify
corepack yarn db:deploy
corepack yarn build

cd ../frontend
corepack yarn install --immutable
corepack yarn verify
corepack yarn build

cd ..
pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save
```

Run `pm2 startup` once using the exact command it prints, reboot the host, and
confirm both processes return with `pm2 status`. Do not use `prisma db push`.

## 5. Controlled demo data

Base destination data is idempotent:

```bash
cd backend
corepack yarn db:seed
```

Demo accounts and content require environment-supplied passwords plus two
production confirmations. Run this only against the intended presentation DB:

```bash
NODE_ENV=production \
DEMO_SEED_ENABLED=true \
DEMO_SEED_CONFIRM_PRODUCTION=seed-travelguide-demo \
DEMO_USER_PASSWORD='from-secret-manager' \
DEMO_ADMIN_PASSWORD='from-secret-manager' \
corepack yarn db:seed:demo
```

The command upserts the documented demo identities, uploads synthetic proof to
the configured private S3 bucket, and never prints passwords. Keep the account
inventory and real values outside the repository.

## 6. Smoke and restart verification

Use an approved demo traveler/local account that can join the Jeju room:

```bash
cd backend
SMOKE_BASE_URL=https://travel.example.com \
SMOKE_EMAIL='demo-account@example.com' \
SMOKE_PASSWORD='from-secret-manager' \
corepack yarn smoke:production
```

The command requires HTTPS and verifies `/health/live`, `/health/ready`, the
same-origin login cookie, a real WebSocket transport, and authorized `room.join`.
Run it once after deployment and again after a host reboot. Separately confirm
GPS permission and a private upload/download on a physical mobile browser.

## 7. Rollback

1. Stop writes or put the site in maintenance mode.
2. Restore the pre-deploy PostgreSQL snapshot if the new migration changed data
   or schema. Never point old code at an incompatible newer schema.
3. Check out the previously recorded Git revision.
4. Install immutable dependencies and rebuild both separated apps.
5. Run `pm2 startOrReload deploy/ecosystem.config.cjs --update-env`.
6. Repeat health, login, Socket, upload, and mobile smoke checks.

If only application code changed and the schema is backward compatible, the DB
restore may be unnecessary; record that decision in the deployment log.

## 8. Acceptance record

Record the domain, Git revision, migration output, snapshot identifier, PM2
status, certificate expiry, smoke output, reboot result, mobile browser/device,
and operator. Do not record JWTs, database URLs, passwords, exact GPS, or private
object keys.
