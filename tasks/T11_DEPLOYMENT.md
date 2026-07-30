# T11 — HTTPS deployment and demo data

## Goal

Deploy the verified MVP to a stable same-origin HTTPS environment.

## Read first

- Deployment sections of functional spec and architecture
- E2E-028
- Seed section 16

## Required work

- Production environment template and validation
- Next.js and NestJS production builds
- Nginx routes for web, `/api/v1`, `/socket.io`
- HTTPS certificate and redirect
- WebSocket upgrade headers
- PostgreSQL production migration using `prisma migrate deploy`
- Private production storage configuration
- PM2 or equivalent process definitions
- Idempotent demo seed with env-supplied credentials
- Deployment and rollback instructions
- Smoke test script or documented command set

## Constraints

- Never commit production secrets.
- Do not use `prisma db push`.
- Do not expose database or storage publicly.
- Do not change auth from same-origin cookie to localStorage bearer as a deployment shortcut.

## Acceptance

- HTTPS login, cookie, GPS, upload, API, and Socket work.
- `/health/ready` is green.
- Server restart preserves data and processes return automatically.
- Demo seed/reset is controlled and cannot run accidentally in production.

