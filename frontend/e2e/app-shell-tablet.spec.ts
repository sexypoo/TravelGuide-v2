import { expect, test, type Page } from '@playwright/test';

// Regression for #12: between the mobile bottom bar (<= 760px) and wide
// desktop, the /app body must never slide under the fixed left navigation.

const password = 'e2e-password123';
const navGap = 16;
const tolerance = 1;
const widths = [761, 800, 900, 1000, 1050, 1051, 1100, 1280, 1440] as const;

async function login(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel('이메일').fill('traveler@e2e.local');
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/app$/u, { timeout: 30_000 });
}

const appPages = [
  { name: 'home', path: '/app', heading: '#welcome-title' },
  { name: 'community', path: '/app/community', heading: '.communityHero h1' },
  { name: 'nearby', path: '/app/nearby', heading: '#nearby-title' },
  { name: 'profile', path: '/app/profile', heading: '#profile-title' },
  {
    name: 'verifications',
    path: '/app/verifications',
    heading: '#verifications-title',
  },
  {
    name: 'saved-places',
    path: '/app/saved-places',
    heading: '#saved-places-title',
  },
] as const;

test('app content stays clear of the side navigation on tablet and desktop', async ({
  browser,
}) => {
  test.setTimeout(180_000);
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  await login(page);

  for (const appPage of appPages) {
    await page.goto(appPage.path);
    await expect(page.locator(appPage.heading)).toBeVisible();

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(
        page.getByRole('navigation', { name: '앱 메뉴' }),
      ).toBeVisible();

      const layout = await page.evaluate((headingSelector) => {
        const nav = document.querySelector<HTMLElement>('.appNavigation');
        const main = document.querySelector<HTMLElement>(
          'main.appContent:not(.appContent--room)',
        );
        const heading = document.querySelector<HTMLElement>(headingSelector);
        if (nav === null || main === null || heading === null) return null;
        return {
          viewportWidth: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          navRight: nav.getBoundingClientRect().right,
          mainLeft: main.getBoundingClientRect().left,
          mainRight: main.getBoundingClientRect().right,
          headingLeft: heading.getBoundingClientRect().left,
        };
      }, appPage.heading);

      expect(layout, `${appPage.name} @ ${width}px`).not.toBeNull();
      if (layout === null) throw new Error('App shell must be measurable');
      const label = `${appPage.name} @ ${width}px`;
      expect(layout.navRight + navGap, label).toBeLessThanOrEqual(
        layout.mainLeft + tolerance,
      );
      expect(layout.headingLeft, label).toBeGreaterThanOrEqual(layout.navRight);
      expect(layout.mainRight, label).toBeLessThanOrEqual(
        layout.viewportWidth + tolerance,
      );
      expect(layout.documentWidth, label).toBeLessThanOrEqual(
        layout.viewportWidth,
      );
    }
  }

  await context.close();
});
