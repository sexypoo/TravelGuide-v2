'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppIcon } from '@/components/common';
import type { ChatMessage } from '@/lib/api/messages';
import { formatChatDate } from '@/lib/questions/presentation';
import { useMessages } from '@/lib/query/use-messages';
import { MessageCard } from './message-card';

function dateKey(value: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

const BOTTOM_THRESHOLD_PX = 80;
const EMPTY_MESSAGES: ChatMessage[] = [];

function isNearBottom(element: HTMLDivElement): boolean {
  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <=
    BOTTOM_THRESHOLD_PX
  );
}

function scrollBehavior(): ScrollBehavior {
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 'auto';
  }
  return 'smooth';
}

export function MessageTimeline({
  roomSlug,
  currentUserId,
  onPromote,
}: {
  roomSlug: string;
  currentUserId: string;
  onPromote: (message: ChatMessage) => void;
}): React.JSX.Element {
  const query = useMessages(roomSlug);
  const timelineRef = useRef<HTMLDivElement>(null);
  const previousLastId = useRef<string | undefined>(undefined);
  const followingLatest = useRef(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messages = query.data?.messages ?? EMPTY_MESSAGES;

  const moveToLatest = useCallback((behavior: ScrollBehavior): void => {
    const timeline = timelineRef.current;
    if (timeline === null) return;
    followingLatest.current = true;
    timeline.scrollTo({ top: timeline.scrollHeight, behavior });
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    const newest = messages.at(-1);
    if (newest === undefined) return;
    const previousId = previousLastId.current;
    previousLastId.current = newest.id;
    if (previousId === newest.id) return;

    if (previousId === undefined) {
      const frame = window.requestAnimationFrame(() => moveToLatest('auto'));
      return () => window.cancelAnimationFrame(frame);
    }

    const previousIndex = messages.findIndex(
      (message) => message.id === previousId,
    );
    const addedCount =
      previousIndex < 0 ? 1 : Math.max(1, messages.length - previousIndex - 1);
    if (!followingLatest.current) {
      setUnreadCount((current) => current + addedCount);
      return;
    }

    const frame = window.requestAnimationFrame(() =>
      moveToLatest(scrollBehavior()),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [messages, moveToLatest]);

  function handleScroll(): void {
    const timeline = timelineRef.current;
    if (timeline === null) return;
    const atBottom = isNearBottom(timeline);
    followingLatest.current = atBottom;
    if (atBottom) {
      setUnreadCount((current) => (current === 0 ? current : 0));
    }
  }

  if (query.isPending) {
    return (
      <div className="messageTimelineSkeleton" aria-label="대화를 불러오는 중">
        <span />
        <span />
        <span />
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="chatQueryState" role="alert">
        <strong>대화를 불러오지 못했어요</strong>
        <span>연결을 확인한 뒤 다시 시도해 주세요.</span>
        <button type="button" onClick={() => void query.refetch()}>
          다시 불러오기
        </button>
      </div>
    );
  }

  return (
    <div className="messageTimelineFrame">
      <div
        ref={timelineRef}
        className="messageTimeline"
        aria-label="제주방 대화"
        onScroll={handleScroll}
      >
        {query.hasNextPage && (
          <button
            className="olderMessagesButton"
            type="button"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage
              ? '이전 대화 불러오는 중'
              : '이전 대화 보기'}
          </button>
        )}
        {messages.length === 0 ? (
          <div className="chatEmptyState">
            <span aria-hidden="true">
              <AppIcon name="live" />
            </span>
            <strong>제주의 첫 대화를 시작해 보세요</strong>
            <p>
              지금 보고 들은 짧은 정보도 누군가의 다음 결정을 도울 수 있어요.
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1];
            const showDate =
              previous === undefined ||
              dateKey(previous.createdAt) !== dateKey(message.createdAt);
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="chatDateDivider">
                    <span>{formatChatDate(message.createdAt)}</span>
                  </div>
                )}
                <MessageCard
                  message={message}
                  own={message.author.id === currentUserId}
                  onPromote={onPromote}
                />
              </div>
            );
          })
        )}
      </div>
      {unreadCount > 0 && (
        <button
          className="newMessageShortcut"
          type="button"
          aria-label={`새 메시지 ${unreadCount}개, 최신 대화로 이동`}
          onClick={() => moveToLatest(scrollBehavior())}
        >
          <span aria-hidden="true">↓</span>새 메시지
          <strong>{unreadCount}</strong>
        </button>
      )}
    </div>
  );
}
