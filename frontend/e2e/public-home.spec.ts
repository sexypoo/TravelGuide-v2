import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

for (const viewport of viewports) {
  test(`signed-out ${viewport.name} home opens the app through login`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:3100',
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: '로그인하고, 여행지의 지금을 확인하세요.',
      }),
    ).toBeVisible();
    await expect(page.locator('.guestHome__primary')).toHaveAttribute(
      'href',
      '/auth/login',
    );
    await expect(
      page.getByRole('link', { name: /계정 만들기/ }),
    ).toHaveAttribute('href', '/auth/register');
    await expect(
      page.getByRole('link', { name: /제주 실시간 도움방/ }),
    ).toHaveAttribute('href', '/auth/login?next=%2Fapp%2Frooms%2Fjeju');
    await expect(page.locator('.landingHero')).toHaveCount(0);
    await expect(page.getByText('서비스 정상 연결')).toBeVisible();

    const layout = await page.evaluate(() => {
      const home = document.querySelector<HTMLElement>('.guestHome');
      const heading = document.querySelector<HTMLElement>('.guestHome h1');
      const primary = document.querySelector<HTMLElement>(
        '.guestHome__primary',
      );
      const entries = Array.from(
        document.querySelectorAll<HTMLElement>('.guestHome__entry'),
      );
      const footer = document.querySelector<HTMLElement>('.guestHome__footer');
      if (
        home === null ||
        heading === null ||
        primary === null ||
        entries.length !== 3 ||
        footer === null
      ) {
        return null;
      }
      return {
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        viewport: { width: innerWidth, height: innerHeight },
        headingFont: Number.parseFloat(getComputedStyle(heading).fontSize),
        primaryHeight: primary.getBoundingClientRect().height,
        entryHeights: entries.map(
          (entry) => entry.getBoundingClientRect().height,
        ),
        footer: footer.getBoundingClientRect().toJSON(),
        background: getComputedStyle(home).backgroundColor,
      };
    });

    expect(layout).not.toBeNull();
    if (layout === null) throw new Error('Public home must be measurable');
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport.width);
    expect(layout.documentHeight).toBeLessThanOrEqual(
      layout.viewport.height + 1,
    );
    expect(layout.headingFont).toBeGreaterThanOrEqual(32);
    expect(layout.headingFont).toBeLessThanOrEqual(45);
    expect(layout.primaryHeight).toBeGreaterThanOrEqual(48);
    expect(Math.min(...layout.entryHeights)).toBeGreaterThanOrEqual(64);
    expect(layout.footer.bottom).toBeLessThanOrEqual(layout.viewport.height);
    expect(layout.background).toBe('rgb(244, 246, 248)');

    await page.screenshot({
      path: `test-results/public-home-${viewport.name}.png`,
      fullPage: false,
    });
    await context.close();
  });
}
