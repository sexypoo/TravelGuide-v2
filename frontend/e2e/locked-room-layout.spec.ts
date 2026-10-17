import { expect, test } from '@playwright/test';

// Locked room introduction (#27, #31): an unverified visitor sees why the
// room is closed and how to get in, with gutters at every width.
test('locked room introduction keeps gutters from phone to desktop', async ({
  browser,
}) => {
  test.setTimeout(60_000);
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
  });
  const page = await context.newPage();
  const suffix = Date.now().toString().slice(-8);
  const registration = await page.request.post('/api/v1/auth/register', {
    data: {
      email: `locked-${suffix}@e2e.local`,
      nickname: `잠긴방${suffix}`,
      password: 'locked-room-pass123',
      termsAgreed: true,
    },
  });
  expect(registration.ok()).toBe(true);

  for (const width of [390, 680, 760, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/app/rooms/jeju');
    const heading = page.getByRole('heading', {
      level: 1,
      name: '제주 도움방',
    });
    await expect(heading).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '인증하면 제주 도움방이 열려요' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '인증 방법 확인하기' }),
    ).toHaveAttribute('href', '/app/verifications');
    // The chat itself is not rendered for a locked visitor.
    await expect(page.locator('#room-message')).toHaveCount(0);

    const layout = await page.evaluate(() => {
      const title = Array.from(
        document.querySelectorAll<HTMLElement>('h1'),
      ).find((element) => element.textContent === '제주 도움방');
      const card = Array.from(document.querySelectorAll<HTMLElement>('h2'))
        .find(
          (element) => element.textContent === '인증하면 제주 도움방이 열려요',
        )
        ?.closest('section');
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        title: title?.getBoundingClientRect().toJSON() ?? null,
        card: card?.getBoundingClientRect().toJSON() ?? null,
        titleSize:
          title === undefined
            ? 0
            : Number.parseFloat(getComputedStyle(title).fontSize),
      };
    });
    const label = `${width}px`;
    expect(layout.documentWidth, label).toBeLessThanOrEqual(layout.viewport);
    expect(layout.card, label).not.toBeNull();
    expect(layout.card?.left ?? 0, label).toBeGreaterThanOrEqual(12);
    expect(
      layout.viewport - (layout.card?.right ?? layout.viewport),
      label,
    ).toBeGreaterThanOrEqual(12);
    expect(layout.titleSize, label).toBeLessThanOrEqual(40);
  }

  await context.close();
});
