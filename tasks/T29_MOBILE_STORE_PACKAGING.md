# T29 — Android and iOS store packaging

## Goal

Turn the existing deployed responsive web app into reviewable Android and iOS
native packages while keeping the web/API deployment unchanged.

## Required work

- Isolated Capacitor project under `mobile/`
- Android and iOS native projects
- Existing 여JJU mark converted to store icons and splash assets
- Native location permission descriptions
- Android debug APK and unsigned release AAB
- iOS simulator build and App Store archive instructions
- Signing secrets excluded from Git
- Store submission checklist and explicit remaining owner actions

## Acceptance

- Android debug APK installs on an emulator or device.
- Release AAB builds and is ready to sign with the owner's upload key.
- iOS simulator app builds with signing disabled.
- Xcode project can be archived after selecting an Apple Developer team.
- The packaged app loads the existing Vercel production domain over HTTPS.
- No new web deployment is created.
