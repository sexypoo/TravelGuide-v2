# 여쭈어 mobile packaging

This directory packages the existing production web application for Android and
iOS. It does not deploy or duplicate the web service.

## Runtime contract

- App / bundle ID: `app.yeojju.mobile`
- Display name: `여쭈어`
- Hosted origin: `https://www.travelguide.kr`
- Capacitor: 8.5.0
- Android: min SDK 24, target/compile SDK 36
- iOS: deployment target 15.0

The hosted origin is the canonical custom domain of the existing Vercel
deployment because the Next.js application depends on server rendering and
same-origin API/Socket proxies. Capacitor's local `www` folder is only a startup
fallback. Any production-domain change requires a new native release and a
review of `capacitor.config.ts`.

## Prerequisites

- Node 22 or later (the existing web/API projects remain on Node 20)
- JDK 21 for Android builds
- Android SDK 36 and build tools
- Xcode 26 or later for iOS

Install and validate:

```bash
corepack yarn install --immutable
corepack yarn verify
corepack yarn sync
```

## Android

Build an installable debug APK:

```bash
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home \
  corepack yarn android:apk
```

For Google Play, create an upload key in a password manager-backed location,
copy `android/keystore.properties.example` to `android/keystore.properties`, and
replace all four values. Neither file nor password may be committed. Then run:

```bash
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home \
  corepack yarn android:bundle
```

Confirm that `android/app/build/outputs/bundle/release/app-release.aab` is signed
before uploading it to Play Console. Increment `versionCode` for every upload.
The first production upload key must be kept for future updates; enable Play App
Signing in Play Console.

## iOS

The simulator build does not need signing:

```bash
corepack yarn ios:simulator
```

Validate an unsigned generic-device Release archive before configuring the
owner's signing team:

```bash
corepack yarn ios:archive:unsigned
```

For TestFlight or the App Store:

1. Enroll in the Apple Developer Program and create the app record in App Store
   Connect.
2. Open `ios/App/App.xcodeproj` in Xcode.
3. Select the `App` target, choose the owner's Team under Signing & Capabilities,
   and confirm the final Bundle Identifier.
4. Set the version/build number, choose `Any iOS Device (arm64)`, then use
   Product → Archive.
5. In Organizer, choose Distribute App → App Store Connect → Upload.
6. Supply a review account, privacy-policy URL, app privacy answers, screenshots,
   support URL, and review notes explaining the authenticated traveler/local
   flows and location use.

No valid Apple code-signing identity is installed on this Mac at the time of the
first build, so a distributable IPA cannot be produced until the owner selects
an enrolled team.

## Review risk

Apple App Review guideline 4.2 requires the app to provide value beyond a
repackaged website. The native container declares and uses location access for
nearby discovery and local verification, but approval is never guaranteed.
Before submission, test on physical iOS and Android devices and consider native
push notifications, universal/app links, and resilient offline/error UI if the
review build still feels like a website in a shell.

The current product supports account creation but does not yet expose account
deletion. Apple requires an in-app deletion path, and Google Play requires both
an in-app path and an external deletion-request URL. Production submission is
blocked until that product flow and its retention policy are implemented.

The App Store privacy answers must cover data collected through the WebView,
including account identifiers, precise verification location, evidence/images,
and user-generated messages. Keep them aligned with `PrivacyInfo.xcprivacy` and
the production privacy policy.
