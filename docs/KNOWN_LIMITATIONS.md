# Known limitations

## Intentional MVP boundaries

- Responsive Korean web only; no native iOS/Android/Flutter application.
- One active verified destination room (Jeju); the general community is not
  destination locked.
- No 1:1 matching, payment, reward, ranking, AI answer generation, translation,
  typing indicator, presence, or read receipts.
- Optional place sharing and nearby discovery use Google Maps/Places when keys
  are configured; route guidance and destination-wide map exploration are not
  provided.
- No background Web Push. Browser notifications work only while the web app is
  open and connected.
- No question editing/deletion by authors; moderation uses audited soft removal.

## Operational constraints

- Rate limiting is process memory based and designed for the single API instance
  presentation deployment. It is not shared across horizontally scaled nodes.
- Socket delivery is best effort. PostgreSQL/REST is the source of truth and the
  client refetches after reconnect; there is no transactional outbox or replay.
- The private S3 implementation relies on bucket policy/IAM. Standard AWS S3
  uploads request server-side AES256 encryption; custom S3-compatible providers
  such as Railway use the provider's storage encryption because Railway rejects
  the per-request S3 encryption option. Custom endpoints also use AWS SDK
  checksums only when an operation requires them; standard AWS endpoints retain
  the SDK defaults. Bucket creation, versioning, retention, backup, and
  credential rotation are external infrastructure responsibilities.
- Demo reset is an idempotent refresh of managed accounts, their non-image Jeju
  room messages, and the canonical waiting topic. It is not a general-purpose
  production data deletion tool and preserves unrelated users' content outside
  the canonical managed demo topic.

## Unverified release conditions

- Real Nginx/PM2 host, HTTPS certificate renewal, S3 IAM, production PostgreSQL,
  and firewall configuration.
- Physical Safari/Chrome geolocation and mobile keyboard behavior.
- Three consecutive manual four-account rehearsals on the deployed HTTPS origin.
- Process recovery and data persistence after an actual host reboot.
- Backup presentation video.

These conditions block the final release tag; they are not waived by local unit,
integration, or build success.
