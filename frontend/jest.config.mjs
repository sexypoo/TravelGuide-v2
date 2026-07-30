import nextJest from 'next/jest.js';

process.env.API_INTERNAL_URL ??= 'http://localhost:3001';

const createJestConfig = nextJest({ dir: './' });

const config = {
  clearMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
};

export default createJestConfig(config);
