import 'dotenv/config';

process.env.NODE_ENV = 'test';
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (testDatabaseUrl === undefined || testDatabaseUrl.length === 0) {
  throw new Error('TEST_DATABASE_URL is required for integration tests');
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.API_PORT ??= '3001';
process.env.WEB_ORIGIN ??= 'http://localhost:3000';
process.env.JWT_SECRET ??= 'integration-test-secret-not-for-production';
process.env.JWT_EXPIRES_IN ??= '24h';
