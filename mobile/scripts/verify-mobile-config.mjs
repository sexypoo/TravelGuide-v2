import { readFile } from 'node:fs/promises';

const config = await readFile(new URL('../capacitor.config.ts', import.meta.url), 'utf8');
const gitignore = await readFile(new URL('../.gitignore', import.meta.url), 'utf8');
const androidManifest = await readFile(
  new URL('../android/app/src/main/AndroidManifest.xml', import.meta.url),
  'utf8',
);
const iosInfo = await readFile(new URL('../ios/App/App/Info.plist', import.meta.url), 'utf8');
const iosPrivacyManifest = await readFile(
  new URL('../ios/App/App/PrivacyInfo.xcprivacy', import.meta.url),
  'utf8',
);

const required = [
  "appId: 'app.yeojju.mobile'",
  "appName: '여쭈어'",
  "url: 'https://www.travelguide.kr'",
  'cleartext: false',
  'webContentsDebuggingEnabled: false',
];

for (const fragment of required) {
  if (!config.includes(fragment)) {
    throw new Error(`Missing mobile config requirement: ${fragment}`);
  }
}

for (const secretPattern of ['*.jks', '*.keystore', '*.p12', '/android/keystore.properties']) {
  if (!gitignore.includes(secretPattern)) {
    throw new Error(`Signing material is not ignored: ${secretPattern}`);
  }
}

if (/http:\/\//u.test(config)) {
  throw new Error('Insecure HTTP origin is not allowed in the mobile config');
}

for (const permission of ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION']) {
  if (!androidManifest.includes(permission)) {
    throw new Error(`Missing Android permission: ${permission}`);
  }
}

if (!androidManifest.includes('android:usesCleartextTraffic="false"')) {
  throw new Error('Android cleartext traffic must remain disabled');
}

if (!iosInfo.includes('NSLocationWhenInUseUsageDescription')) {
  throw new Error('Missing iOS location permission description');
}

for (const privacyDeclaration of [
  'NSPrivacyTracking',
  'NSPrivacyCollectedDataTypeEmailAddress',
  'NSPrivacyCollectedDataTypePreciseLocation',
  'NSPrivacyCollectedDataTypePhotosorVideos',
]) {
  if (!iosPrivacyManifest.includes(privacyDeclaration)) {
    throw new Error(`Missing iOS privacy declaration: ${privacyDeclaration}`);
  }
}

process.stdout.write('Mobile configuration verified.\n');
