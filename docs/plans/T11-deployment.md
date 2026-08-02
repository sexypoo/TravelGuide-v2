# T11 HTTPS deployment and demo data

## Goal

Make the verified frontend and backend deployable behind one HTTPS origin with
private production storage, supervised processes, controlled demo data, and a
repeatable smoke/rollback procedure.

## Files and boundaries

- `backend/`: validate production S3 settings, implement private S3 streaming,
  harden demo-seed confirmation, and provide an authenticated production smoke
  command.
- `frontend/`: document the production-only internal API origin used at build
  time; no backend code or secrets enter the frontend bundle.
- `deploy/`: Nginx and PM2 templates only. Application source remains separated
  in `frontend/` and `backend/`.
- `docs/DEPLOYMENT.md`: install, migration, build, certificate, restart, smoke,
  backup, and rollback runbook.

## Storage contract

- Replace filesystem-path downloads with authenticated server-side streams so
  local and S3 storage share one private contract.
- Use AWS SDK v3 `PutObject`, `GetObject`, and `DeleteObject` commands.
- Require bucket and region for `STORAGE_DRIVER=s3`; credentials may come from an
  instance role or the standard AWS environment provider chain.
- Never return object keys or public bucket URLs to clients.

## Deployment flow

1. Snapshot PostgreSQL and record the current Git revision.
2. Install each app with immutable lockfiles and run verification.
3. Run `prisma migrate deploy`, then build backend and frontend.
4. Render the Nginx domain template, obtain a certificate, and start both apps
   through PM2.
5. Run HTTPS health, login, Socket connection, and authorized room-join smoke.
6. Reboot once and repeat smoke before accepting the deployment.

## Tests

- Environment rejects missing S3 configuration and incomplete static credentials.
- S3 adapter validates object keys and sends private put/get/delete commands.
- Demo seed requires the existing enable flag plus an explicit production-only
  confirmation phrase.
- Backend/frontend verify and production builds remain green.

## Risks

- Actual deployment requires a domain, host access, PostgreSQL endpoint, private
  bucket, and AWS credentials/role; repository work cannot assert those external
  conditions.
- Schema migrations are forward-only. Rollback restores the pre-deploy DB
  snapshot before starting the previous Git revision.
- Demo credentials remain environment supplied and must be stored outside Git.
