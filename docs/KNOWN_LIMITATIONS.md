# Known limitations

## Intentional MVP boundaries

- Responsive Korean web only; no native iOS/Android/Flutter application.
- One active verified destination room (Jeju); the general community is not
  destination locked.
- No 1:1 matching, payment, reward, ranking, AI answer generation, translation,
  typing indicator, presence, or read receipts.
- No external map SDK; place cards use user-confirmed names, addresses, and
  coordinates.
- No background Web Push. Browser notifications work only while the web app is
  open and connected.
- No question editing/deletion by authors; moderation uses audited soft removal.

## Operational constraints

- Rate limiting is process memory based and designed for the single API instance
  presentation deployment. It is not shared across horizontally scaled nodes.
- Socket delivery is best effort. PostgreSQL/REST is the source of truth and the
  client refetches after reconnect; there is no transactional outbox or replay.
- The private S3 implementation relies on bucket policy/IAM and server-side AES256
  encryption. Bucket creation, versioning, retention, backup, and credential
  rotation are external infrastructure responsibilities.
- Demo reset is an idempotent re-seed of known accounts and the canonical waiting
  topic, not a general-purpose production data deletion tool.

## Unverified release conditions

- Real Nginx/PM2 host, HTTPS certificate renewal, S3 IAM, production PostgreSQL,
  and firewall configuration.
- Physical Safari/Chrome geolocation and mobile keyboard behavior.
- Three consecutive manual four-account rehearsals on the deployed HTTPS origin.
- Process recovery and data persistence after an actual host reboot.
- Backup presentation video.

These conditions block the final release tag; they are not waived by local unit,
integration, or build success.
