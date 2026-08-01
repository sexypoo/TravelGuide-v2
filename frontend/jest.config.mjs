import nextJest from 'next/jest.js';

process.env.API_INTERNAL_URL ??= 'http://localhost:3001';

const createJestConfig = nextJest({ dir: './' });

const config = {
  clearMocks: true,
  watchman: false,
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/page.tsx',
    '!src/app/**/layout.tsx',
  ],
  coverageDirectory: 'coverage/unit',
  coverageThreshold: {
    global: { statements: 55, branches: 59, functions: 57, lines: 56 },
  },
};

export default createJestConfig(config);
