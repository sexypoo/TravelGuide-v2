import { expect, test } from '@playwright/test';

// Regression for #29: submitting before hydration (or without JavaScript)
// must never put credentials into the URL.
test('auth forms submitted without JavaScript keep credentials out of the URL', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  const secret = 'no-js-secret-pass123';

  for (const path of ['/auth/login', '/auth/register']) {
    await page.goto(path);
    await page.fill('input[name="email"]', 'no-js@e2e.local');
    await page.fill('input[name="password"]', secret);
    const [request] = await Promise.all([
      page.waitForRequest(
        (candidate) =>
          candidate.isNavigationRequest() &&
          new URL(candidate.url()).pathname === path,
      ),
      page.locator('form[method="post"] button[type="submit"]').click(),
    ]);
    expect(request.method(), path).toBe('POST');
    expect(request.url(), path).not.toContain(secret);
    await page.waitForLoadState();
    expect(page.url(), path).not.toContain(secret);
    expect(page.url(), path).not.toContain('password=');
  }

  await context.close();
});
