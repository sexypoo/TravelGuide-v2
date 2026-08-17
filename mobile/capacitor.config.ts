import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.yeojju.mobile',
  appName: '여쭈어',
  webDir: 'www',
  loggingBehavior: 'debug',
  backgroundColor: '#fff8fb',
  server: {
    url: 'https://www.travelguide.kr',
    cleartext: false,
  },
  android: {
    backgroundColor: '#fff8fb',
    webContentsDebuggingEnabled: false,
  },
  ios: {
    backgroundColor: '#fff8fb',
    contentInset: 'automatic',
  },
};

export default config;
