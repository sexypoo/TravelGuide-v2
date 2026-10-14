# Presentation release checklist

## Candidate identity

- Candidate Git revision: `working tree based on fa79b0a; record T25 commit after review`
- Rollback Git revision: `755772e`
- Proposed final tag: `v0.1.0` (do not create before all required checks pass)
- Public HTTPS origin: `[not provided]`
- Database snapshot ID/time: `[not recorded]`
- Operator and rehearsal date: `[not recorded]`

## Secrets and accounts

- [ ] Backend/frontend production environment files are mode `600`.
- [ ] Database URL, JWT secret, S3 credentials/role, demo passwords, and smoke
      credentials are stored outside Git.
- [ ] Traveler, local A, local B, and admin credentials are available to the
      presenter without displaying the secret store on screen.
- [ ] S3 public access is blocked and IAM is prefix-scoped.

## Non-destructive demo reset (target: under 10 minutes)

The guarded seed refreshes known account passwords and verification windows,
reopens the canonical waiting topic, clears its accepted/resolved state, and
refreshes its two seeded local answers and three-message room scene. It removes
non-image room messages authored by the four managed demo participants and their
message reports; unrelated users' content outside the canonical demo topic is
preserved. Demo image messages are soft-removed so stored objects are not
orphaned.

```bash
cd backend
corepack yarn db:seed
NODE_ENV=production \
DEMO_SEED_ENABLED=true \
DEMO_SEED_CONFIRM_PRODUCTION=seed-travelguide-demo \
DEMO_USER_PASSWORD='from-secret-manager' \
DEMO_ADMIN_PASSWORD='from-secret-manager' \
corepack yarn db:seed:demo
```

- [x] Local reset duration recorded: `1.54s on 2026-08-15`.
- [ ] Production reset duration recorded: `[not run]`
- [ ] Correct database hostname/name was independently checked before seeding.
- [x] Local canonical Jeju waiting topic is OPEN with two current answers and
      one visible shared card.
- [ ] Production canonical Jeju waiting topic is confirmed after deployment.

## Automated gates

- [x] Backend `TEST_DATABASE_URL=... corepack yarn verify` passes from a clean
      checkout.
- [x] Frontend `corepack yarn verify` passes from a clean checkout.
- [x] Playwright run 1 passes without rerunning a failed test.
- [x] Playwright run 2 passes without rerunning a failed test.
- [x] Playwright run 3 passes without rerunning a failed test.
- [ ] `SMOKE_BASE_URL=... corepack yarn smoke:production` passes before reboot.
- [ ] The same production smoke passes after reboot and PM2 auto-start.

Automated run record (2026-08-15, Node 20.20.2): backend 33 suites/92 unit and
12 suites/40 PostgreSQL integration tests; frontend 50 suites/120 tests;
Playwright 2/2 passed in 36.4s, 38.0s, and 33.5s. Backend coverage is
85.85/64.73/85.19/86.55 and frontend coverage is
61.63/64.22/63.78/62.88 (statements/branches/functions/lines).

## Rehearsal scenario

For each run, use separate browser contexts for traveler, local A, local B, and
admin. A failed step resets the consecutive-success count.

| Step                                                                    | Run 1 | Run 2 | Run 3 |
| ----------------------------------------------------------------------- | :---: | :---: | :---: |
| Reset demo data and login all four accounts                             |   ☐   |   ☐   |   ☐   |
| Traveler opens Jeju room and sends text/image/place                     |   ☐   |   ☐   |   ☐   |
| Traveler creates a waiting topic and shares its card to chat            |   ☐   |   ☐   |   ☐   |
| Local A answer appears live without traveler refresh                    |   ☐   |   ☐   |   ☐   |
| Local B official-source answer appears with correct badge               |   ☐   |   ☐   |   ☐   |
| Disconnect/reconnect preserves and refetches missed content             |   ☐   |   ☐   |   ☐   |
| Traveler accepts one answer and resolved state persists on refresh      |   ☐   |   ☐   |   ☐   |
| Report reaches admin and soft removal hides original content            |   ☐   |   ☐   |   ☐   |
| Admin metrics and verification review load                              |   ☐   |   ☐   |   ☐   |
| `/health/ready` stays green and logs contain no secrets/GPS/object keys |   ☐   |   ☐   |   ☐   |

Run timestamps and notes:

- Run 1: `[not run]`
- Run 2: `[not run]`
- Run 3: `[not run]`

## Device and visual checks

- [ ] Physical iOS Safari or Android Chrome geolocation permission works on HTTPS.
- [x] 390x844 automated/in-app check: no horizontal scroll and composer visible.
- [ ] Physical mobile keyboard does not cover the composer.
- [ ] 768x1024: room/chat/topic split remains usable.
- [x] 1440x900 local content width and primary-navigation layout are correct.
- [ ] Long nickname/content, empty, loading, error, removed, expired, and resolved
      states were inspected.
- [ ] Private evidence/image endpoints return 403 to unauthorized users.

## Backup and rollback

- [ ] A backup screen recording covers login, chat, topic, two answers, live
      update, acceptance, resolution, report, and administrator handling.
- [ ] Video file opens with audio on the presentation laptop and one offline copy.
- [ ] Pre-deploy DB snapshot restore was rehearsed or provider restore timing is
      known.
- [ ] `docs/DEPLOYMENT.md` rollback steps were reviewed with the recorded revisions.

## Final sign-off

- [ ] No open critical/high authorization, privacy, integrity, upload, or Socket
      reconnect defect.
- [ ] `docs/KNOWN_LIMITATIONS.md` matches the spoken presentation claims.
- [ ] All checks above pass and an annotated `v0.1.0` tag is created on the exact
      candidate revision.

Release approver/time: `[not approved]`
