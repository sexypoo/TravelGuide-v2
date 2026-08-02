import { expect, test, type Page } from '@playwright/test';

const password = 'e2e-password123';

async function login(page: Page, email: string): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/app$/u);
}

test('traveler and local exchange a topic and recover a missed answer', async ({
  browser,
}) => {
  const travelerContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 1440, height: 900 },
  });
  const localContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 1440, height: 900 },
  });
  const traveler = await travelerContext.newPage();
  const local = await localContext.newPage();
  await login(traveler, 'traveler@e2e.local');
  await login(local, 'local-a@e2e.local');
  await Promise.all([
    traveler.goto('/app/rooms/jeju'),
    local.goto('/app/rooms/jeju'),
  ]);
  await Promise.all([
    expect(traveler.getByText('실시간 연결됨')).toBeVisible(),
    expect(local.getByText('실시간 연결됨')).toBeVisible(),
  ]);

  const topicText = `E2E 현재 제주공항 입장 대기 상황을 알려주세요 ${Date.now()}`;
  const topicResponse = await travelerContext.request.post(
    '/api/v1/rooms/jeju/questions',
    {
      data: { category: 'WAITING', urgency: 'NORMAL', content: topicText },
    },
  );
  expect(topicResponse.ok()).toBeTruthy();
  const topic = (await topicResponse.json()) as { id: string };
  await expect(local.getByText(topicText)).toBeVisible();

  await traveler.goto(`/app/questions/${topic.id}`);
  const firstAnswer = `현장 E2E 확인 답변 ${Date.now()}`;
  const firstResponse = await localContext.request.post(
    `/api/v1/questions/${topic.id}/answers`,
    {
      data: {
        content: firstAnswer,
        sourceType: 'ON_SITE_NOW',
        waitMinutes: 25,
        observedAt: new Date().toISOString(),
      },
    },
  );
  expect(firstResponse.ok()).toBeTruthy();
  await expect(traveler.getByText(firstAnswer)).toBeVisible();

  await travelerContext.setOffline(true);
  const missedAnswer = `재연결 중 작성한 E2E 답변 ${Date.now()}`;
  const missedResponse = await localContext.request.post(
    `/api/v1/questions/${topic.id}/answers`,
    {
      data: {
        content: missedAnswer,
        sourceType: 'RECENT_EXPERIENCE',
        waitMinutes: 30,
        observedAt: new Date().toISOString(),
      },
    },
  );
  expect(missedResponse.ok()).toBeTruthy();
  await travelerContext.setOffline(false);
  await expect(traveler.getByText(missedAnswer)).toBeVisible({
    timeout: 15_000,
  });

  await travelerContext.close();
  await localContext.close();
});

test('mobile room keeps the composer in the viewport without horizontal overflow', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await login(page, 'traveler@e2e.local');
  await page.goto('/app/rooms/jeju');
  await expect(page.getByLabel('방에 메시지 보내기')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByLabel('방에 메시지 보내기').scrollIntoViewIfNeeded();
  const composer = await page.getByLabel('방에 메시지 보내기').boundingBox();
  expect(composer).not.toBeNull();
  expect(composer?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((composer?.x ?? 0) + (composer?.width ?? 0)).toBeLessThanOrEqual(390);
  await context.close();
});
