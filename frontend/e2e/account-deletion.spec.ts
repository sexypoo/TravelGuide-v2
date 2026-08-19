import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

for (const viewport of viewports) {
  test(`${viewport.name} exposes privacy and completes account deletion`, async ({
    browser,
  }, testInfo) => {
    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:3100',
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();

    await page.goto('/privacy');
    await expect(
      page.getByRole('heading', { name: '개인정보 처리방침', level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText(/정확한 GPS 좌표와 원본 인증 증빙/),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '계정 삭제' }).first(),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(viewport.width);

    await page.goto('/account-deletion');
    await expect(
      page.getByRole('heading', { name: '여쭈어 계정 삭제', level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '로그인하고 계정 삭제하기' }),
    ).toHaveAttribute('href', '/auth/login?next=%2Fapp%2Fprofile');
    await page.screenshot({
      path: testInfo.outputPath(`account-deletion-${viewport.name}.png`),
      fullPage: true,
    });

    const email = `delete-${viewport.name}@e2e.local`;
    const password = 'delete-e2e-pass123';
    const registration = await page.request.post('/api/v1/auth/register', {
      data: {
        email,
        nickname: `삭제검수${viewport.name}`,
        password,
        termsAgreed: true,
      },
    });
    expect(registration.ok()).toBe(true);

    await page.goto('/app/profile');
    await expect(
      page.getByRole('heading', { name: '계정 관리' }),
    ).toBeVisible();
    await page.getByRole('button', { name: '계정 삭제 살펴보기' }).click();
    await expect(page.getByText('삭제하면 되돌릴 수 없습니다.')).toBeVisible();
    await page.getByLabel('현재 비밀번호').fill(password);
    await page
      .getByLabel(/확인을 위해 계정 삭제를 입력해 주세요/)
      .fill('계정 삭제');
    await page.getByRole('button', { name: '계정 영구 삭제' }).click();

    await expect(page).toHaveURL(/\/account-deletion\?deleted=true$/u);
    await expect(
      page.getByRole('heading', { name: '계정 삭제가 완료되었습니다.' }),
    ).toBeVisible();
    await context.close();
  });
}
