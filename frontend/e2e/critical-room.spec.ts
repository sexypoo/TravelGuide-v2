import { expect, test, type Page } from '@playwright/test';

const password = 'e2e-password123';

async function login(page: Page, email: string): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/app$/u, { timeout: 15_000 });
}

test('traveler and local exchange a topic and recover a missed answer', async ({
  browser,
}) => {
  test.setTimeout(60_000);
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
  const bubbleSurfaces = await traveler.evaluate(
    ({ ownText, receivedText }) => {
      const paragraphs = Array.from(
        document.querySelectorAll<HTMLElement>('.chatBubble p'),
      );
      const surface = (content: string) => {
        const paragraph = paragraphs.find(
          (candidate) => candidate.textContent === content,
        );
        const bubble = paragraph?.closest<HTMLElement>('.chatBubble');
        if (bubble === null || bubble === undefined) return null;
        const style = getComputedStyle(bubble);
        return {
          background: style.backgroundColor,
          border: style.borderColor,
        };
      };
      return {
        own: surface(ownText),
        received: surface(receivedText),
      };
    },
    { ownText: travelerMessage, receivedText: localMessage },
  );
  expect(bubbleSurfaces.own).not.toBeNull();
  expect(bubbleSurfaces.received).not.toBeNull();
  expect(bubbleSurfaces.own?.background).not.toBe(
    bubbleSurfaces.received?.background,
  );
  expect(bubbleSurfaces.own?.border).not.toBe(bubbleSurfaces.received?.border);
  const desktopRoom = await traveler
    .locator('.chatRoomExperience')
    .boundingBox();
  expect(desktopRoom).not.toBeNull();
  expect(desktopRoom?.y ?? -1).toBeGreaterThanOrEqual(0);
  expect(
    (desktopRoom?.y ?? 0) + (desktopRoom?.height ?? 0),
  ).toBeLessThanOrEqual(900);
  await expect(
    traveler.getByRole('heading', { name: '실시간 대화' }),
  ).toBeVisible();

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
  await expect(traveler.getByText(topicText)).toBeVisible();
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
  expect(layout.room.left).toBeLessThanOrEqual(0.5);
  expect(layout.room.right).toBeGreaterThanOrEqual(layout.viewport.width - 0.5);
  expect(layout.room.top).toBeGreaterThanOrEqual(0);
  expect(layout.room.bottom).toBeLessThanOrEqual(layout.viewport.height);
  expect(layout.timeline.clientHeight).toBeGreaterThan(200);
  expect(layout.timeline.scrollHeight).toBeGreaterThan(
    layout.timeline.clientHeight,
  );
  expect(layout.timeline.overflowY).toBe('auto');
  expect(layout.composer.top).toBeGreaterThanOrEqual(0);
  expect(layout.composer.bottom).toBeLessThanOrEqual(layout.viewport.height);

  const readability = await page.evaluate(() => {
    const message = document.querySelector<HTMLElement>('.chatBubble p');
    const metadata = document.querySelector<HTMLElement>(
      '.chatMessage__body > header time',
    );
    const textarea = document.querySelector<HTMLTextAreaElement>(
      '.messageComposer textarea',
    );
    const add = document.querySelector<HTMLButtonElement>('.messageAddButton');
    const send =
      document.querySelector<HTMLButtonElement>('.messageSendButton');
    const mode = document.querySelector<HTMLButtonElement>(
      '.mobileRoomSwitcher button',
    );
    if (
      message === null ||
      metadata === null ||
      textarea === null ||
      add === null ||
      send === null ||
      mode === null
    ) {
      return null;
    }
    const targetSize = (element: HTMLElement) => {
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height };
    };
    return {
      messageFont: Number.parseFloat(getComputedStyle(message).fontSize),
      messageLineHeight: Number.parseFloat(
        getComputedStyle(message).lineHeight,
      ),
      metadataFont: Number.parseFloat(getComputedStyle(metadata).fontSize),
      textareaFont: Number.parseFloat(getComputedStyle(textarea).fontSize),
      add: targetSize(add),
      send: targetSize(send),
      mode: targetSize(mode),
    };
  });
  expect(readability).not.toBeNull();
  if (readability === null)
    throw new Error('Readable room elements must exist');
  expect(readability.messageFont).toBeGreaterThanOrEqual(15);
  expect(readability.messageLineHeight).toBeGreaterThanOrEqual(24);
  expect(readability.metadataFont).toBeGreaterThanOrEqual(12);
  expect(readability.textareaFont).toBeGreaterThanOrEqual(16);
  expect(readability.add.width).toBeGreaterThanOrEqual(44);
  expect(readability.add.height).toBeGreaterThanOrEqual(44);
  expect(readability.send.width).toBeGreaterThanOrEqual(44);
  expect(readability.send.height).toBeGreaterThanOrEqual(44);
  expect(readability.mode.height).toBeGreaterThanOrEqual(44);
  expect(
    await page
      .getByRole('tab', { name: '대화' })
      .evaluate((element) => getComputedStyle(element, '::after').content),
  ).toBe('none');
  expect(
    await page
      .locator('.messageTimelineFrame')
      .evaluate((element) => getComputedStyle(element).backgroundImage),
  ).not.toContain('linear-gradient(90deg');
  await page.screenshot({
    path: 'test-results/chat-room-mobile.png',
    fullPage: false,
  });

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

  await page.getByRole('tab', { name: '실시간 토픽' }).click();
  await expect(page.locator('.topicRail')).toBeVisible();
  const topicModeViewport = await page.evaluate(() => ({
    windowScrollY: scrollY,
    header:
      document
        .querySelector<HTMLElement>('.conversationRoomHeader')
        ?.getBoundingClientRect()
        .toJSON() ?? null,
  }));
  expect(topicModeViewport.windowScrollY).toBe(0);
  expect(topicModeViewport.header).not.toBeNull();
  expect(topicModeViewport.header?.top ?? -1).toBeGreaterThanOrEqual(0);
  expect(
    await page
      .getByRole('tab', { name: '실시간 토픽' })
      .evaluate((element) => getComputedStyle(element, '::after').content),
  ).toBe('none');
  expect(
    await page
      .locator('.topicRail')
      .evaluate((element) => getComputedStyle(element).overflowY),
  ).toBe('auto');
  const topicCard = page.locator('.topicRail .signalQuestionCard').first();
  await expect(topicCard).toBeVisible();
  expect(
    await topicCard
      .locator('.questionCategory')
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe('rgba(0, 0, 0, 0)');
  expect(
    await topicCard
      .locator('.questionCardFooter')
      .evaluate((element) => getComputedStyle(element).flexDirection),
  ).toBe('row');
  await page.screenshot({
    path: 'test-results/chat-room-mobile-topics.png',
    fullPage: false,
  });

  await page.getByRole('tab', { name: '대화' }).click();
  await expect(page.locator('.messageComposer')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 640 });
  await expect(page.getByLabel('방에 메시지 보내기')).toBeVisible();
  const compactComposer = await page.locator('.messageComposer').boundingBox();
  expect(compactComposer).not.toBeNull();
  expect(compactComposer?.y ?? -1).toBeGreaterThanOrEqual(0);
  expect(
    (compactComposer?.y ?? 0) + (compactComposer?.height ?? 0),
  ).toBeLessThanOrEqual(640);
  await context.close();
});
