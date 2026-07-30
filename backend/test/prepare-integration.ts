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
const migration = spawnSync(
  process.execPath,
  [prismaCli, 'migrate', 'deploy'],
  {
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
    stdio: 'inherit',
  },
);

if (migration.error !== undefined) {
  throw migration.error;
}

if (migration.status !== 0) {
  throw new Error(`Integration database migration exited ${migration.status}`);
}
