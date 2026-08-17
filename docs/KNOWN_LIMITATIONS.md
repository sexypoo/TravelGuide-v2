# Known limitations

## Mobile store submission

- `mobile/` produces an installable Android debug APK, an unsigned Play AAB, and
  a verified iOS Simulator app. Production Android/iOS artifacts remain blocked
  on owner-controlled signing credentials and developer-console accounts.
- The product allows in-app account creation but does not yet provide account
  deletion. Apple requires deletion initiation in-app; Google Play additionally
  requires an external account-deletion request URL. Store production submission
  must not proceed until both paths and the retention policy are implemented.
- The Capacitor client uses the existing hosted Next.js origin. Apple may reject
  a remote-content wrapper under minimum-functionality guideline 4.2; physical
  device testing and additional native value remain release gates.
- A public privacy-policy URL, support URL, store privacy/data-safety answers,
  review/demo credentials, listing copy, and store screenshots are still owned
  release inputs.

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
