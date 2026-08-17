import { expect, test, type Page } from '@playwright/test';

const password = 'e2e-password123';

async function login(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel('이메일').fill('traveler@e2e.local');
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/app$/u);
}

const mobilePages = [
  {
    name: 'home',
    path: '/app',
    heading: '.homeGreeting h1',
    body: '.roomCard__body > span',
  },
  {
    name: 'community',
    path: '/app/community',
    heading: '.communityHero h1',
    body: '.communityHero > div > span',
  },
  {
    name: 'nearby',
    path: '/app/nearby',
    heading: '.nearbyExplorer__hero h1',
    body: '.nearbyExplorer__hero > div > span',
  },
  {
    name: 'profile',
    path: '/app/profile',
    heading: '.pageHeading h1',
    body: '.pageHeading > span',
  },
  {
    name: 'verifications',
    path: '/app/verifications',
    heading: '.pageHeading h1',
    body: '.pageHeading > span',
  },
  {
    name: 'saved-places',
    path: '/app/saved-places',
    heading: '.pageHeading h1',
    body: '.pageHeading > span',
  },
] as const;

test('mobile app pages keep a fixed route deck and readable hierarchy', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await login(page);

  for (const appPage of mobilePages) {
    await page.goto(appPage.path);
    await expect(page.locator(appPage.heading)).toBeVisible();
    await expect(page.locator(appPage.body)).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    const navigation = page.getByRole('navigation', { name: '앱 메뉴' });
    await expect(navigation).toBeVisible();

    const before = await page.evaluate(
      ({ headingSelector, bodySelector }) => {
        const nav = document.querySelector<HTMLElement>('.appNavigation');
        const main = document.querySelector<HTMLElement>(
          '.appContent:not(.appContent--room)',
        );
        const heading = document.querySelector<HTMLElement>(headingSelector);
        const body = document.querySelector<HTMLElement>(bodySelector);
        const links = Array.from(
          document.querySelectorAll<HTMLElement>('.appNavigation a'),
        );
        if (
          nav === null ||
          main === null ||
          heading === null ||
          body === null
        ) {
          return null;
        }
        return {
          viewport: { width: innerWidth, height: innerHeight },
          documentWidth: document.documentElement.scrollWidth,
          nav: nav.getBoundingClientRect().toJSON(),
          navPosition: getComputedStyle(nav).position,
          mainPaddingBottom: Number.parseFloat(
            getComputedStyle(main).paddingBottom,
          ),
          headingFontSize: Number.parseFloat(
            getComputedStyle(heading).fontSize,
          ),
          bodyFontSize: Number.parseFloat(getComputedStyle(body).fontSize),
          linkHeights: links.map((link) => link.getBoundingClientRect().height),
        };
      },
      { headingSelector: appPage.heading, bodySelector: appPage.body },
    );

    expect(before).not.toBeNull();
    if (before === null) throw new Error('Mobile app shell must be measurable');
    expect(before.documentWidth).toBeLessThanOrEqual(before.viewport.width);
    expect(before.navPosition).toBe('fixed');
    expect(before.nav.left).toBeCloseTo(0, 1);
    expect(before.nav.right).toBeCloseTo(before.viewport.width, 1);
    expect(before.nav.bottom).toBeCloseTo(before.viewport.height, 1);
    expect(before.mainPaddingBottom).toBeGreaterThan(before.nav.height + 16);
    expect(before.headingFontSize).toBeGreaterThanOrEqual(32);
    expect(before.bodyFontSize).toBeGreaterThanOrEqual(15);
    expect(Math.min(...before.linkHeights)).toBeGreaterThanOrEqual(44);

    if (['home', 'community', 'nearby', 'profile'].includes(appPage.name)) {
      await page.screenshot({
        path: testInfo.outputPath(`${appPage.name}-390x844.png`),
      });
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(() => page.evaluate(() => Math.round(window.scrollY)))
      .toBeGreaterThanOrEqual(0);
    const after = await navigation.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        viewportHeight: innerHeight,
        documentWidth: document.documentElement.scrollWidth,
      };
    });
    expect(after.bottom).toBeCloseTo(after.viewportHeight, 1);
    expect(after.top).toBeCloseTo(before.nav.top, 1);
    expect(after.documentWidth).toBeLessThanOrEqual(before.viewport.width);
  }

  await context.close();
});

test('desktop shell keeps its vertical navigation and contained content', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await login(page);
  const shell = await page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>('.appNavigation');
    const main = document.querySelector<HTMLElement>('.appContent');
    if (nav === null || main === null) return null;
    return {
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      nav: nav.getBoundingClientRect().toJSON(),
      navColumns: getComputedStyle(nav).gridTemplateColumns,
      main: main.getBoundingClientRect().toJSON(),
    };
  });
  expect(shell).not.toBeNull();
  if (shell === null) throw new Error('Desktop app shell must be measurable');
  expect(shell.documentWidth).toBeLessThanOrEqual(shell.viewportWidth);
  expect(shell.nav.width).toBeLessThan(120);
  expect(shell.nav.height).toBeGreaterThan(300);
  expect(shell.navColumns.split(' ')).toHaveLength(1);
  expect(shell.main.width).toBeLessThanOrEqual(1180);
  await context.close();
});
