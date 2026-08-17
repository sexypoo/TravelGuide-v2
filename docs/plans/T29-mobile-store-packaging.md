# T29 Mobile store packaging

## Goal

Package the already deployed TravelGuide web application as installable Android
and iOS applications without creating another web deployment. Produce a locally
installable Android APK, an unsigned Play Store AAB, and an iOS project that can
be archived once an Apple Developer signing team is selected.

## Scope and files

- `mobile/`: isolated Capacitor 8 project, configuration, native Android/iOS
  projects, deterministic branded icon/splash assets, build scripts, and release
  instructions.
- `docs/DECISIONS.md`: record the native-shell boundary, fixed hosted origin,
  versioning, signing, and App Store review risk.
- `docs/RELEASE_NOTES.md`: record generated mobile deliverables and remaining
  account-owned release steps.
- No frontend, backend, database, auth, or deployment changes.

## Dependencies

- Add pinned Capacitor 8 packages only inside `mobile/`. This is a separate
  packaging toolchain because Capacitor 8 requires Node 22+, while the existing
  web/API applications remain pinned to Node 20.
- Use the official Capacitor Android and iOS runtimes and the geolocation plugin
  so device location permission is represented in native manifests.

## Native identity and runtime

- Initial application/bundle ID: `app.yeojju.mobile`. It is isolated in one
  configuration file so the final ID can be changed before the first store
  submission if the developer account requires another owned identifier.
- App name: `여쭈어`.
- Hosted origin: `https://www.travelguide.kr`, the canonical custom domain of
  the existing Vercel production deployment.
- HTTPS only; mixed content and arbitrary navigation remain disabled.
- Release builds disable WebView debugging and production bridge logging.

## Build and verification

1. Install mobile dependencies immutably.
2. Generate Android and iOS native projects and synchronize the Capacitor config.
3. Generate platform icons/splash assets from the existing SVG brand mark.
4. Build and inspect an Android debug APK.
5. Build an unsigned release AAB; do not create or commit an upload keystore.
6. Build the iOS app for a simulator with code signing disabled.
7. Run configuration checks that assert the fixed HTTPS origin, native IDs,
   permissions, and absence of committed signing secrets.

## Risks

- Apple may reject an app that is only a repackaged website under App Review
  Guideline 4.2. Native geolocation integration improves platform fit but does
  not guarantee approval; real push/deep-link/offline behavior may be needed.
- A signed Play AAB requires an owner-managed upload keystore. The keystore and
  passwords must never enter Git.
- An App Store archive/IPA requires an enrolled Apple Developer team,
  distribution signing, provisioning, and an App Store Connect app record.
- Cookies, file upload, camera/photo selection, Socket.io reconnect, and location
  permission must be exercised on physical Android and iOS devices before
  submission.
