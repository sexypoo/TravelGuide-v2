/**
 * @jest-environment node
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const appDirectory = __dirname;

function findPages(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findPages(path);
    return entry.name === 'page.tsx' ? [path] : [];
  });
}

describe('/app page guards', () => {
  const pages = findPages(appDirectory);

  it('finds the app pages', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages.map((path) => relative(appDirectory, path)))(
    '%s redirects signed-out visitors with its own next path',
    (page) => {
      const source = readFileSync(join(appDirectory, page), 'utf8');
      expect(source).toMatch(/\brequireUser\(/u);
    },
  );
});
