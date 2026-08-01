import { defineConfig, devices } from '@playwright/test';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (testDatabaseUrl === undefined || testDatabaseUrl.length === 0) {
  throw new Error('TEST_DATABASE_URL is required for browser E2E');
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'corepack yarn test:e2e:serve',
      cwd: '../backend',
      url: 'http://127.0.0.1:3101/api/v1/health/ready',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        TEST_DATABASE_URL: testDatabaseUrl,
        DATABASE_URL: testDatabaseUrl,
        API_PORT: '3101',
        WEB_ORIGIN: 'http://127.0.0.1:3100',
        NODE_ENV: 'test',
      },
    },
    {
      command: 'corepack yarn dev --port 3100',
      url: 'http://127.0.0.1:3100',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        API_INTERNAL_URL: 'http://127.0.0.1:3101',
      },
    },
  ],
});
