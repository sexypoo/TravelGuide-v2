import { expect, test, type Page } from '@playwright/test';
import { loginAs } from './helpers';

async function waitForLive(page: Page): Promise<void> {
  await expect(page.locator('[data-state="connected"]').first()).toBeAttached({
    timeout: 20_000,
  });
}

function backgroundOf(page: Page, text: string): Promise<string> {
  return page.getByText(text, { exact: true }).evaluate((element) => {
    let node: HTMLElement | null = element as HTMLElement;
    while (node !== null) {
      const color = getComputedStyle(node).backgroundColor;
      if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
      node = node.parentElement;
    }
    return '';
  });
}

test('traveler and local exchange a topic and recover a missed answer', async ({
  browser,
}) => {
  test.setTimeout(120_000);
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
  await loginAs(traveler, 'traveler@e2e.local');
  await loginAs(local, 'local-a@e2e.local');
  await Promise.all([
    traveler.goto('/app/rooms/jeju'),
    local.goto('/app/rooms/jeju'),
  ]);
  await Promise.all([waitForLive(traveler), waitForLive(local)]);

  const travelerMessage = `여행자 E2E 현장 질문 ${Date.now()}`;
  const localMessage = `현지인 E2E 안내 답변 ${Date.now()}`;
  const [travelerMessageResponse, localMessageResponse] = await Promise.all([
    travelerContext.request.post('/api/v1/rooms/jeju/messages', {
      data: { content: travelerMessage },
    }),
    localContext.request.post('/api/v1/rooms/jeju/messages', {
      data: { content: localMessage },
    }),
  ]);
  expect(travelerMessageResponse.ok()).toBeTruthy();
  expect(localMessageResponse.ok()).toBeTruthy();
  await expect(traveler.getByText(travelerMessage)).toBeVisible();
  await expect(traveler.getByText(localMessage)).toBeVisible();

  // Own and received messages read as different surfaces.
  expect(await backgroundOf(traveler, travelerMessage)).not.toBe(
    await backgroundOf(traveler, localMessage),
  );

  // Web: conversation and topic rail sit side by side inside an 80rem room,
  // and the conversation keeps a readable measure.
  const layout = await traveler.evaluate(() => {
    const stage = document.querySelector<HTMLElement>(
      'section[aria-label="제주 대화"]',
    );
    const rail = document.querySelector<HTMLElement>(
      'aside[aria-labelledby="topic-rail-title"]',
    );
    const input = document.querySelector<HTMLElement>('#room-message');
    if (stage === null || rail === null || input === null) return null;
    return {
      documentWidth: document.documentElement.scrollWidth,
      stage: stage.getBoundingClientRect().toJSON(),
      rail: rail.getBoundingClientRect().toJSON(),
      input: input.getBoundingClientRect().toJSON(),
    };
  });
  expect(layout).not.toBeNull();
  if (layout === null) throw new Error('Room must be measurable');
  expect(layout.documentWidth).toBeLessThanOrEqual(1440);
  expect(layout.rail.left).toBeGreaterThan(layout.stage.right);
  expect(layout.rail.right - layout.stage.left).toBeLessThanOrEqual(1280);
  expect(layout.input.width).toBeLessThanOrEqual(720);
  expect(layout.input.bottom).toBeLessThanOrEqual(900);

  await traveler
    .getByRole('button', { name: '사진, 장소 또는 토픽 추가' })
    .click();
  await traveler.getByRole('menuitem', { name: /장소/ }).click();
  const placeDialog = traveler.getByRole('dialog', { name: '장소 보내기' });
  await expect(placeDialog).toBeVisible();
  const modal = await placeDialog.evaluate((dialog) => {
    const bounds = dialog.getBoundingClientRect();
    return {
      insideForm: dialog.closest('form') !== null,
      top: bounds.top,
      bottom: bounds.bottom,
      bodyOverflow: document.body.style.overflow,
    };
  });
  expect(modal.insideForm).toBe(false);
  expect(modal.top).toBeGreaterThanOrEqual(0);
  expect(modal.bottom).toBeLessThanOrEqual(900);
  expect(modal.bodyOverflow).toBe('hidden');
  await traveler.keyboard.press('Escape');
  await expect(placeDialog).toBeHidden();

  const topicText = `E2E 현재 제주공항 입장 대기 상황을 알려주세요 ${Date.now()}`;
  const topicResponse = await travelerContext.request.post(
    '/api/v1/rooms/jeju/questions',
    {
      data: { category: 'WAITING', urgency: 'NORMAL', content: topicText },
    },
  );
  expect(topicResponse.ok()).toBeTruthy();
  const topic = (await topicResponse.json()) as { id: string };
  await expect(local.getByText(topicText).first()).toBeVisible();
  await expect(traveler.getByText(topicText).first()).toBeVisible();
  const sharedTopicResponse = await travelerContext.request.post(
    '/api/v1/rooms/jeju/messages/topics',
    { data: { questionId: topic.id } },
  );
  expect(sharedTopicResponse.ok()).toBeTruthy();
  await expect(
    traveler
      .getByRole('link', { name: new RegExp(topicText) })
      .filter({ hasText: '답변과 현황 보기' }),
  ).toBeVisible();
  await traveler.screenshot({
    path: 'test-results/chat-room-desktop.png',
    fullPage: false,
  });

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
  test.setTimeout(90_000);
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await loginAs(page, 'traveler@e2e.local');
  const mobileTopicText = `모바일 토픽 카드 검증 ${Date.now()}`;
  const mobileTopicResponse = await context.request.post(
    '/api/v1/rooms/jeju/questions',
    {
      data: {
        category: 'WAITING',
        urgency: 'NORMAL',
        content: mobileTopicText,
      },
    },
  );
  expect(mobileTopicResponse.ok()).toBeTruthy();
  const mobileTopic = (await mobileTopicResponse.json()) as { id: string };
  for (let index = 1; index <= 14; index += 1) {
    const response = await context.request.post('/api/v1/rooms/jeju/messages', {
      data: {
        content: `모바일 스크롤 검증 메시지 ${index} — 긴 대화에서도 입력창은 화면 안에 유지됩니다.`,
      },
    });
    expect(response.ok()).toBeTruthy();
  }
  const sharedTopic = await context.request.post(
    '/api/v1/rooms/jeju/messages/topics',
    { data: { questionId: mobileTopic.id } },
  );
  expect(sharedTopic.ok()).toBeTruthy();
  const mobilePlaceName = `모바일 동백식당 ${Date.now()}`;
  const place = await context.request.post(
    '/api/v1/rooms/jeju/messages/places',
    {
      data: {
        googlePlaceId: 'e2e-mobile-dongbaek-place',
        placeName: mobilePlaceName,
        address: '제주시 바다로 1',
        latitude: 33.5,
        longitude: 126.5,
        note: '고등어구이가 좋아요.',
      },
    },
  );
  expect(place.ok()).toBeTruthy();

  await page.goto('/app/rooms/jeju');
  await waitForLive(page);
  await expect(page.getByText(mobilePlaceName)).toBeVisible();
  await expect(
    page.getByRole('link', { name: /지도에서 보기/ }).last(),
  ).toBeVisible();

  const layout = await page.evaluate(() => {
    const input = document.querySelector<HTMLElement>('#room-message');
    const send = document.querySelector<HTMLElement>('button[type="submit"]');
    const tabs = document.querySelector<HTMLElement>(
      '[role="tablist"][aria-label="방 보기"]',
    );
    return {
      viewport: { width: innerWidth, height: innerHeight },
      documentWidth: document.documentElement.scrollWidth,
      bodyScroll: document.scrollingElement?.scrollHeight ?? 0,
      input: input?.getBoundingClientRect().toJSON() ?? null,
      send: send?.getBoundingClientRect().toJSON() ?? null,
      tabs: tabs?.getBoundingClientRect().toJSON() ?? null,
      inputFont:
        input === null
          ? 0
          : Number.parseFloat(getComputedStyle(input).fontSize),
    };
  });
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport.width);
  expect(layout.input).not.toBeNull();
  expect(layout.input?.bottom ?? 9999).toBeLessThanOrEqual(
    layout.viewport.height,
  );
  expect(layout.send?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(layout.tabs?.top ?? 9999).toBeLessThan(200);
  // 16px input font avoids iOS zoom on focus.
  expect(layout.inputFont).toBeGreaterThanOrEqual(16);
  await page.screenshot({ path: 'test-results/chat-room-mobile.png' });

  await page.getByRole('tab', { name: '실시간 토픽' }).click();
  const rail = page.locator('aside[aria-labelledby="topic-rail-title"]');
  await expect(rail).toBeVisible();
  await expect(rail.getByText(mobileTopicText)).toBeVisible();
  await expect(page.locator('#room-message')).toBeHidden();
  await page.getByRole('tab', { name: '대화' }).click();
  await expect(page.locator('#room-message')).toBeVisible();

  await context.close();
});
