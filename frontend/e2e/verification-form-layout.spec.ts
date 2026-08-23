import { expect, test } from '@playwright/test';

test('traveler verification form stays within a 390px viewport', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  await page.goto('/auth/login');
  await page.getByLabel('이메일').fill('traveler@e2e.local');
  await page.getByLabel('비밀번호').fill('e2e-password123');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/app$/u, { timeout: 30_000 });

  await page.goto('/app/verifications/traveler');
  await expect(
    page.getByRole('heading', { name: '여행 기간만큼 제주 도움방을 열어요' }),
  ).toBeVisible();

  const layout = await page.evaluate(() => {
    const form = document.querySelector<HTMLElement>('.verificationForm');
    const dateInputs = Array.from(
      document.querySelectorAll<HTMLInputElement>('.dateFieldGrid input'),
    );
    const dateFrames = Array.from(
      document.querySelectorAll<HTMLElement>('.dateInputFrame'),
    );
    if (form === null || dateInputs.length !== 2 || dateFrames.length !== 2)
      return null;
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      form: form.getBoundingClientRect().toJSON(),
      dates: dateInputs.map((input) => input.getBoundingClientRect().toJSON()),
      frames: dateFrames.map((frame) => ({
        bounds: frame.getBoundingClientRect().toJSON(),
        overflow: getComputedStyle(frame).overflow,
      })),
      dateTextAlignment: dateInputs.map(
        (input) => getComputedStyle(input).textAlign,
      ),
    };
  });

  expect(layout).not.toBeNull();
  if (layout === null) throw new Error('Traveler form must be measurable');
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.form.left).toBeGreaterThanOrEqual(0);
  expect(layout.form.right).toBeLessThanOrEqual(layout.viewportWidth);
  for (const frame of layout.frames) {
    expect(frame.bounds.left).toBeGreaterThanOrEqual(layout.form.left);
    expect(frame.bounds.right).toBeLessThanOrEqual(layout.form.right);
    expect(frame.overflow).toBe('hidden');
  }
  expect(layout.dateTextAlignment).toEqual(['left', 'left']);

  await context.close();
});
