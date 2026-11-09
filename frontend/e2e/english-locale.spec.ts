import { expect, test } from '@playwright/test';

// #80: an English browser lands in English, the API answers in English, and
// the switch goes back to Korean.
test('an English browser sees English and can switch to Korean', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
    locale: 'en-US',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('heading', { name: /When your trip goes sideways/ }),
  ).toBeVisible();

  await page.goto('/auth/login');
  await page.getByLabel('Email').fill('nobody@e2e.local');
  await page.getByLabel('Password').fill('wrong-password-1');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(
    page.getByText('The email or password is incorrect.'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'View in Korean' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
  await context.close();
});
