import { expect, test } from '@playwright/test';

// #42: the travel type test works without an account and lands on a
// shareable result page with a link preview image.
test('a signed-out visitor finishes the travel type test and sees a result', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: '여행자 유형 테스트' }).click();
  await expect(page).toHaveURL(/\/test$/);

  await page.getByRole('button', { name: '시작하기' }).click();
  for (let index = 1; index <= 10; index += 1) {
    await expect(page.getByText(`${index} / 10`)).toBeVisible();
    await page.locator('button[aria-pressed]').first().click();
  }

  await expect(page).toHaveURL(/\/test\/[a-z]+$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(
    page.getByRole('button', { name: '결과 공유하기' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: '계정 만들기' })).toHaveAttribute(
    'href',
    '/auth/register',
  );

  const ogImage = await page
    .locator('meta[property="og:image"]')
    .getAttribute('content');
  expect(ogImage).toMatch(/\/test\/og\/[a-z]+\.png$/);
  const response = await page.request.get(new URL(ogImage ?? '').pathname);
  expect(response.status()).toBe(200);
});
