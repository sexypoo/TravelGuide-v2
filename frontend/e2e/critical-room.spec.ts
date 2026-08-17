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
  for (let index = 1; index <= 14; index += 1) {
    const response = await context.request.post('/api/v1/rooms/jeju/messages', {
      data: {
        content: `모바일 스크롤 검증 메시지 ${index} — 긴 대화에서도 입력창은 화면 안에 유지됩니다.`,
      },
    });
    expect(response.ok()).toBeTruthy();
  }
  await page.goto('/app/rooms/jeju');
  await expect(page.getByLabel('방에 메시지 보내기')).toBeVisible();
  await expect(page.locator('.chatRoomExperience')).toBeVisible();
  await expect(page.locator('.messageTimeline')).toBeVisible();
  await expect(page.locator('.messageComposer')).toBeVisible();
  const layout = await page.evaluate(() => {
    const room = document.querySelector<HTMLElement>('.chatRoomExperience');
    const timeline = document.querySelector<HTMLElement>('.messageTimeline');
    const composer = document.querySelector<HTMLElement>('.messageComposer');
    if (room === null || timeline === null || composer === null) return null;
    return {
      viewport: { width: innerWidth, height: innerHeight },
      document: {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      },
      bodyHeight: document.body.scrollHeight,
      windowScrollY: scrollY,
      room: room.getBoundingClientRect().toJSON(),
      timeline: {
        ...timeline.getBoundingClientRect().toJSON(),
        clientHeight: timeline.clientHeight,
        scrollHeight: timeline.scrollHeight,
        overflowY: getComputedStyle(timeline).overflowY,
      },
      composer: composer.getBoundingClientRect().toJSON(),
    };
  });
  expect(layout).not.toBeNull();
  if (layout === null) throw new Error('Room layout elements must exist');
  expect(layout.document.width).toBeLessThanOrEqual(layout.viewport.width);
  expect(layout.document.height).toBeLessThanOrEqual(layout.viewport.height);
  expect(layout.bodyHeight).toBeLessThanOrEqual(layout.viewport.height);
  expect(layout.windowScrollY).toBe(0);
  expect(layout.room.top).toBeGreaterThanOrEqual(0);
  expect(layout.room.bottom).toBeLessThanOrEqual(layout.viewport.height);
  expect(layout.timeline.clientHeight).toBeGreaterThan(200);
  expect(layout.timeline.scrollHeight).toBeGreaterThan(
    layout.timeline.clientHeight,
  );
  expect(layout.timeline.overflowY).toBe('auto');
  expect(layout.composer.top).toBeGreaterThanOrEqual(0);
  expect(layout.composer.bottom).toBeLessThanOrEqual(layout.viewport.height);

  const initialComposerTop = layout.composer.top;
  await page.locator('.messageTimeline').evaluate((element) => {
    element.scrollTop = 0;
  });
  const afterHistoryScroll = await page.evaluate(() => ({
    composerTop:
      document
        .querySelector<HTMLElement>('.messageComposer')
        ?.getBoundingClientRect().top ?? -1,
    windowScrollY: scrollY,
  }));
  expect(afterHistoryScroll.windowScrollY).toBe(0);
  expect(afterHistoryScroll.composerTop).toBeCloseTo(initialComposerTop, 1);

  await page.setViewportSize({ width: 390, height: 640 });
  await expect(page.getByLabel('방에 메시지 보내기')).toBeVisible();
  const compactComposer = await page.locator('.messageComposer').boundingBox();
  expect(compactComposer).not.toBeNull();
  expect(compactComposer?.y ?? -1).toBeGreaterThanOrEqual(0);
  expect(
    (compactComposer?.y ?? 0) + (compactComposer?.height ?? 0),
  ).toBeLessThanOrEqual(640);

  await page.getByRole('tab', { name: '실시간 토픽' }).click();
  await expect(page.locator('.topicRail')).toBeVisible();
  expect(
    await page
      .locator('.topicRail')
      .evaluate((element) => getComputedStyle(element).overflowY),
  ).toBe('auto');
  await context.close();
});
