import { expect, test } from '@playwright/test';
import { loginAs } from './helpers';

// App shell (#31): a fixed bottom tab bar below 1024px and a side
// navigation from 1024px. Content never slides under either, never scrolls
// sideways, and keeps readable text.

const appPages = [
  { path: '/app', title: '홈' },
  { path: '/app/community', title: '커뮤니티' },
  { path: '/app/nearby', title: '주변' },
  { path: '/app/profile', title: '내 정보' },
  { path: '/app/verifications', title: '참여 자격' },
  { path: '/app/saved-places', title: '찜한 장소' },
] as const;

const tabLabels = ['홈', '도움방', '커뮤니티', '주변', '내 정보'];

async function measure(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>(
      'nav[aria-label="앱 메뉴"]',
    );
    const main = document.querySelector<HTMLElement>('main');
    const heading = main?.querySelector<HTMLElement>('h1') ?? null;
    if (nav === null || main === null || heading === null) return null;
    const texts = Array.from(
      main.querySelectorAll<HTMLElement>('p, span, a, li, label'),
    )
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          element.closest('.srOnly') === null &&
          (element.textContent ?? '').trim().length > 0
        );
      })
      .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));
    const links = Array.from(nav.querySelectorAll<HTMLElement>('ul a'));
    return {
      viewport: { width: innerWidth, height: innerHeight },
      documentWidth: document.documentElement.scrollWidth,
      nav: nav.getBoundingClientRect().toJSON(),
      navPosition: getComputedStyle(nav).position,
      main: main.getBoundingClientRect().toJSON(),
      mainPaddingBottom: Number.parseFloat(
        getComputedStyle(main).paddingBottom,
      ),
      smallestText: Math.min(...texts),
      linkHeights: links.map((link) => link.getBoundingClientRect().height),
      linkLabels: links.map((link) => link.textContent?.trim() ?? ''),
    };
  });
}

test('mobile and tablet keep a fixed tab bar and readable pages', async ({
  browser,
}) => {
  test.setTimeout(180_000);
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
  });
  const page = await context.newPage();
  await loginAs(page);

  for (const width of [390, 768, 1000]) {
    await page.setViewportSize({ width, height: 844 });
    for (const appPage of appPages) {
      await page.goto(appPage.path);
      await expect(
        page
          .getByRole('main')
          .getByRole('heading', { level: 1, name: appPage.title }),
      ).toBeAttached();
      const layout = await measure(page);
      expect(layout, `${appPage.path} at ${width}px`).not.toBeNull();
      if (layout === null) throw new Error('App shell must be measurable');
      const label = `${appPage.path} at ${width}px`;
      expect(layout.documentWidth, label).toBeLessThanOrEqual(
        layout.viewport.width,
      );
      expect(layout.navPosition, label).toBe('fixed');
      expect(layout.nav.left, label).toBeCloseTo(0, 0);
      expect(layout.nav.right, label).toBeCloseTo(layout.viewport.width, 0);
      expect(layout.nav.bottom, label).toBeCloseTo(layout.viewport.height, 0);
      expect(layout.mainPaddingBottom, label).toBeGreaterThan(
        layout.nav.height,
      );
      expect(layout.linkLabels, label).toEqual(tabLabels);
      expect(Math.min(...layout.linkHeights), label).toBeGreaterThanOrEqual(44);
      expect(layout.smallestText, label).toBeGreaterThanOrEqual(12);
    }
  }

  await context.close();
});

test('desktop keeps the side navigation and content beside it', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
  });
  const page = await context.newPage();
  await loginAs(page);

  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const appPage of appPages) {
      await page.goto(appPage.path);
      const layout = await measure(page);
      expect(layout).not.toBeNull();
      if (layout === null) throw new Error('App shell must be measurable');
      const label = `${appPage.path} at ${width}px`;
      expect(layout.documentWidth, label).toBeLessThanOrEqual(
        layout.viewport.width,
      );
      expect(layout.nav.left, label).toBeCloseTo(0, 0);
      expect(layout.nav.height, label).toBeGreaterThanOrEqual(
        layout.viewport.height - 1,
      );
      expect(layout.main.left, label).toBeGreaterThanOrEqual(
        layout.nav.right - 1,
      );
      expect(layout.linkLabels, label).toEqual(tabLabels);
      expect(layout.smallestText, label).toBeGreaterThanOrEqual(12);
    }
    await expect(
      page.getByRole('link', { name: '내 정보', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
  }

  await context.close();
});
