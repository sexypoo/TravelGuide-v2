import { fireEvent, render, screen } from '@testing-library/react';
import type { ChatMessage } from '@/lib/api/messages';
import { MessageTimeline } from './message-timeline';

const mockUseMessages = jest.fn();
jest.mock('../../lib/query/use-messages', () => ({
  useMessages: () => mockUseMessages(),
}));

function message(id: string, minute: number): ChatMessage {
  const timestamp = `2026-08-01T12:${String(minute).padStart(2, '0')}:00.000Z`;
  return {
    id,
    roomId: 'room-1',
    author: {
      id: `author-${id}`,
      nickname: `여행자 ${id}`,
      badge: 'VERIFIED_TRAVELER',
    },
    type: 'TEXT',
    content: `${id} 번째 실시간 메시지입니다.`,
    contentFormat: 'PLAIN_TEXT',
    removed: false,
    topicId: null,
    image: null,
    place: null,
    sharedTopic: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function dimensions(
  element: HTMLElement,
  values: { scrollHeight: number; clientHeight: number; scrollTop: number },
): void {
  Object.defineProperties(element, {
    scrollHeight: { configurable: true, value: values.scrollHeight },
    clientHeight: { configurable: true, value: values.clientHeight },
    scrollTop: { configurable: true, writable: true, value: values.scrollTop },
  });
}

describe('MessageTimeline live follow behavior', () => {
  let messages: ChatMessage[];
  let scrollTo: jest.Mock;
  let notifyResize: () => void;
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    messages = [message('one', 0)];
    scrollTo = jest.fn();
    notifyResize = () => {};
    class MockResizeObserver implements ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        notifyResize = () => callback([], this);
      }

      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: MockResizeObserver,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    });
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 1;
      });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    mockUseMessages.mockImplementation(() => ({
      isPending: false,
      isError: false,
      data: { messages },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalResizeObserver === undefined) {
      Reflect.deleteProperty(globalThis, 'ResizeObserver');
    } else {
      Object.defineProperty(globalThis, 'ResizeObserver', {
        configurable: true,
        value: originalResizeObserver,
      });
    }
  });

  it('opens at the newest message and follows live messages from the bottom', () => {
    const view = render(
      <MessageTimeline
        roomSlug="jeju"
        currentUserId="current-user"
        onPromote={jest.fn()}
      />,
    );
    const timeline = screen.getByLabelText('제주방 대화');
    expect(timeline.querySelector('.content')).toBeInTheDocument();
    dimensions(timeline, {
      scrollHeight: 1000,
      clientHeight: 400,
      scrollTop: 600,
    });
    fireEvent.scroll(timeline);
    scrollTo.mockClear();

    messages = [...messages, message('two', 1)];
    view.rerender(
      <MessageTimeline
        roomSlug="jeju"
        currentUserId="current-user"
        onPromote={jest.fn()}
      />,
    );

    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' });
    expect(
      screen.queryByRole('button', { name: /최신 대화로 이동/ }),
    ).not.toBeInTheDocument();
  });

  it('preserves history position and accumulates a new-message shortcut', () => {
    const view = render(
      <MessageTimeline
        roomSlug="jeju"
        currentUserId="current-user"
        onPromote={jest.fn()}
      />,
    );
    const timeline = screen.getByLabelText('제주방 대화');
    dimensions(timeline, {
      scrollHeight: 1000,
      clientHeight: 400,
      scrollTop: 240,
    });
    fireEvent.scroll(timeline);
    scrollTo.mockClear();

    messages = [...messages, message('two', 1)];
    view.rerender(
      <MessageTimeline
        roomSlug="jeju"
        currentUserId="current-user"
        onPromote={jest.fn()}
      />,
    );
    messages = [...messages, message('three', 2)];
    view.rerender(
      <MessageTimeline
        roomSlug="jeju"
        currentUserId="current-user"
        onPromote={jest.fn()}
      />,
    );

    expect(timeline.scrollTop).toBe(240);
    expect(scrollTo).not.toHaveBeenCalled();
    const shortcut = screen.getByRole('button', {
      name: '새 메시지 2개, 최신 대화로 이동',
    });
    fireEvent.click(shortcut);
    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' });
    expect(shortcut).not.toBeInTheDocument();
  });

  it('clears the shortcut when the reader scrolls back to the bottom', () => {
    const view = render(
      <MessageTimeline
        roomSlug="jeju"
        currentUserId="current-user"
        onPromote={jest.fn()}
      />,
    );
    const timeline = screen.getByLabelText('제주방 대화');
    dimensions(timeline, {
      scrollHeight: 1000,
      clientHeight: 400,
      scrollTop: 200,
    });
    fireEvent.scroll(timeline);
    messages = [...messages, message('two', 1)];
    view.rerender(
      <MessageTimeline
        roomSlug="jeju"
        currentUserId="current-user"
        onPromote={jest.fn()}
      />,
    );
    expect(
      screen.getByRole('button', { name: /최신 대화로 이동/ }),
    ).toBeInTheDocument();

    timeline.scrollTop = 600;
    fireEvent.scroll(timeline);
    expect(
      screen.queryByRole('button', { name: /최신 대화로 이동/ }),
    ).not.toBeInTheDocument();
  });

  it('follows viewport resizes only while the reader is at the latest message', () => {
    render(
      <MessageTimeline
        roomSlug="jeju"
        currentUserId="current-user"
        onPromote={jest.fn()}
      />,
    );
    const timeline = screen.getByLabelText('제주방 대화');
    dimensions(timeline, {
      scrollHeight: 1000,
      clientHeight: 400,
      scrollTop: 600,
    });
    fireEvent.scroll(timeline);
    scrollTo.mockClear();

    notifyResize();
    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'auto' });

    timeline.scrollTop = 180;
    fireEvent.scroll(timeline);
    scrollTo.mockClear();
    notifyResize();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(timeline.scrollTop).toBe(180);
  });
});

describe('MessageTimeline fetch errors', () => {
  let scrollTo: jest.Mock;
  const messages = [message('one', 0), message('two', 1)];

  function queryResult(
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      isPending: false,
      isError: false,
      isFetching: false,
      isRefetchError: false,
      isFetchNextPageError: false,
      data: { messages },
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      ...overrides,
    };
  }

  function renderTimeline(): ReturnType<typeof render> {
    return render(
      <MessageTimeline
        roomSlug="jeju"
        currentUserId="current-user"
        onPromote={jest.fn()}
      />,
    );
  }

  beforeEach(() => {
    scrollTo = jest.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    });
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 1;
      });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the full error card when the first load fails', () => {
    const refetch = jest.fn();
    mockUseMessages.mockReturnValue(
      queryResult({ isError: true, data: undefined, refetch }),
    );
    renderTimeline();

    expect(screen.getByRole('alert')).toHaveTextContent(
      '대화를 불러오지 못했어요',
    );
    expect(screen.queryByLabelText('제주방 대화')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps loaded messages when a refetch fails and retries with refetch', () => {
    const refetch = jest.fn();
    const fetchNextPage = jest.fn();
    mockUseMessages.mockReturnValue(
      queryResult({
        isError: true,
        isRefetchError: true,
        refetch,
        fetchNextPage,
      }),
    );
    const view = renderTimeline();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByText('one 번째 실시간 메시지입니다.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('two 번째 실시간 메시지입니다.'),
    ).toBeInTheDocument();
    const notice = screen.getByText(
      '최신 대화를 불러오지 못했어요. 보이는 대화가 최신이 아닐 수 있어요.',
    );
    expect(notice.closest('[role="status"]')).not.toBeNull();
    // The row sits above the scrolling timeline, not inside it.
    expect(screen.getByLabelText('제주방 대화')).not.toContainElement(notice);

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(fetchNextPage).not.toHaveBeenCalled();

    mockUseMessages.mockReturnValue(
      queryResult({
        isError: true,
        isRefetchError: true,
        isFetching: true,
        refetch,
      }),
    );
    view.rerender(
      <MessageTimeline
        roomSlug="jeju"
        currentUserId="current-user"
        onPromote={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '불러오는 중' })).toBeDisabled();
  });

  it('replaces the older-messages pill with a retry row when the older page fails', () => {
    const refetch = jest.fn();
    const fetchNextPage = jest.fn();
    mockUseMessages.mockReturnValue(
      queryResult({
        isError: true,
        isFetchNextPageError: true,
        refetch,
        fetchNextPage,
      }),
    );
    const view = renderTimeline();
    scrollTo.mockClear();

    expect(
      screen.getByText('one 번째 실시간 메시지입니다.'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByText('이전 대화를 불러오지 못했어요.')
        .closest('[role="status"]'),
    ).not.toBeNull();
    expect(
      screen.queryByRole('button', { name: '이전 대화 보기' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    expect(refetch).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();

    // While the retry is in flight the row hides and the pill shows progress.
    mockUseMessages.mockReturnValue(
      queryResult({
        isError: true,
        isFetchNextPageError: true,
        isFetchingNextPage: true,
        isFetching: true,
        fetchNextPage,
      }),
    );
    view.rerender(
      <MessageTimeline
        roomSlug="jeju"
        currentUserId="current-user"
        onPromote={jest.fn()}
      />,
    );
    expect(
      screen.queryByText('이전 대화를 불러오지 못했어요.'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '이전 대화 불러오는 중' }),
    ).toBeDisabled();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
