import { expect, type Page } from '@playwright/test';

export const e2ePassword = 'e2e-password123';

/**
 * Signs in through the API so tests never race hydration of the login form.
 * The session cookie lands in the page's browser context.
 */
export async function loginAs(
  page: Page,
  email = 'traveler@e2e.local',
): Promise<void> {
  const response = await page.request.post('/api/v1/auth/login', {
    data: { email, password: e2ePassword },
  });
  expect(response.ok()).toBe(true);
}
