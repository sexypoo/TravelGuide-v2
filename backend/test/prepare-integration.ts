import 'dotenv/config';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (testDatabaseUrl === undefined || testDatabaseUrl.length === 0) {
  throw new Error('TEST_DATABASE_URL is required for integration tests');
}

const prismaCli = join(
  process.cwd(),
  'node_modules',
  'prisma',
  'build',
  'index.js',
);
function runPrisma(arguments_: string[], label: string): void {
  const result = spawnSync(process.execPath, [prismaCli, ...arguments_], {
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
    stdio: 'inherit',
  });

  if (result.error !== undefined) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${label} exited ${result.status}`);
  }
}

runPrisma(['migrate', 'deploy'], 'Integration database migration');
runPrisma(['db', 'seed'], 'First integration seed');
runPrisma(['db', 'seed'], 'Second integration seed');
