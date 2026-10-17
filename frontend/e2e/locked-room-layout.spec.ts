import { expect, test } from '@playwright/test';

test('locked room introduction keeps mobile gutters at 390px', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 390, height: 844 },
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

  await page.goto('/app/rooms/jeju');
  await expect(
    page.getByRole('heading', { name: '제주 실시간 여행 도움방' }),
  ).toBeVisible();

  const layout = await page.evaluate(() => {
    const main = document.querySelector<HTMLElement>('.appContent--room');
    const pageContent = document.querySelector<HTMLElement>('.lockedRoomPage');
    const heading = document.querySelector<HTMLElement>('.roomHeader h1');
    const contextCard = document.querySelector<HTMLElement>('.roomContext');
    if (
      main === null ||
      pageContent === null ||
      heading === null ||
      contextCard === null
    ) {
      return null;
    }
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      main: main.getBoundingClientRect().toJSON(),
      page: pageContent.getBoundingClientRect().toJSON(),
      heading: heading.getBoundingClientRect().toJSON(),
      contextCard: contextCard.getBoundingClientRect().toJSON(),
      headingFontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
    };
  });

  expect(layout).not.toBeNull();
  if (layout === null) throw new Error('Locked room must be measurable');
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.main.left).toBeGreaterThanOrEqual(15);
  expect(layout.main.right).toBeLessThanOrEqual(layout.viewportWidth - 15);
  expect(layout.page.left).toBeGreaterThanOrEqual(layout.main.left);
  expect(layout.page.right).toBeLessThanOrEqual(layout.main.right);
  expect(layout.heading.right).toBeLessThanOrEqual(layout.main.right);
  expect(layout.contextCard.right).toBeLessThanOrEqual(layout.main.right);
  expect(layout.headingFontSize).toBeLessThanOrEqual(36);

  await context.close();
});

// Regression for #27: the live room's full-bleed phone layout must not apply
// to the locked introduction between 601px and 760px, and the room canvas
// must not draw a grey box behind it on desktop.
test('locked room introduction keeps gutters on tablet and no grey box on desktop', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
  });
  const page = await context.newPage();
  const suffix = Date.now().toString().slice(-8);
  const registration = await page.request.post('/api/v1/auth/register', {
    data: {
      email: `locked-wide-${suffix}@e2e.local`,
      nickname: `잠긴넓은${suffix}`,
      password: 'locked-room-pass123',
      termsAgreed: true,
    },
  });
  expect(registration.ok()).toBe(true);

  for (const width of [680, 760, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/app/rooms/jeju');
    await expect(
      page.getByRole('heading', { name: '제주 실시간 여행 도움방' }),
    ).toBeVisible();
    const layout = await page.evaluate(() => {
      const main = document.querySelector<HTMLElement>('.appContent--room');
      const heading = document.querySelector<HTMLElement>('.roomHeader h1');
      if (main === null || heading === null) return null;
      return {
        viewportWidth: innerWidth,
        heading: heading.getBoundingClientRect().toJSON(),
        mainBackground: getComputedStyle(main).backgroundColor,
      };
    });
    expect(layout).not.toBeNull();
    if (layout === null) throw new Error('Locked room must be measurable');
    expect(
      layout.heading.left,
      `${width}px left gutter`,
    ).toBeGreaterThanOrEqual(11.5);
    expect(
      layout.viewportWidth - layout.heading.right,
      `${width}px right gutter`,
    ).toBeGreaterThanOrEqual(11.5);
    expect(layout.mainBackground, `${width}px canvas`).not.toBe(
      'rgb(242, 244, 246)',
    );
  }

  await context.close();
});
