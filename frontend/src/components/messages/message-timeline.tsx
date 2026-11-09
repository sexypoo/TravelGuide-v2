'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppIcon } from '@/components/common';
import { Button, Notice } from '@/components/ui';
import styles from './messages.module.css';
import type { ChatMessage } from '@/lib/api/messages';
import { formatChatDate } from '@/lib/questions/presentation';
import { useMessages } from '@/lib/query/use-messages';
import { MessageCard } from './message-card';
import { useLocale, useMessages as useDictionary } from '@/i18n/client';

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
  const dictionary = useDictionary();
  const t = dictionary.chat.timeline;
  const common = dictionary.common;
  const locale = useLocale();
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
    const timeline = timelineRef.current;
    if (timeline === null || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    let frame: number | undefined;
    const observer = new ResizeObserver(() => {
      if (!followingLatest.current) return;
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => moveToLatest('auto'));
    });
    observer.observe(timeline);
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [moveToLatest]);

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
      <div className={styles.skeleton} aria-label={t.loading}>
        <span />
        <span />
        <span />
      </div>
    );
  }
  // Only replace the timeline when nothing has loaded yet. A failed refetch or
  // older-page fetch keeps the loaded conversation and shows a retry row.
  if (query.isError && query.data === undefined) {
    return (
      <div className={styles.state} role="alert">
        <strong>{t.loadFailedTitle}</strong>
        <span>{t.loadFailedBody}</span>
        <button type="button" onClick={() => void query.refetch()}>
          {t.reload}
        </button>
      </div>
    );
  }

  const showOlderRetry =
    query.isFetchNextPageError && !query.isFetchingNextPage;

  return (
    <div className={styles.frame}>
      {query.isRefetchError && (
        <div className={styles.retryBar}>
          <div className={styles.retryRow}>
            <Notice tone="warning" icon="alert" role="status">
              {t.refetchFailed}
            </Notice>
            <Button
              variant="secondary"
              size="md"
              icon="refresh"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              {query.isFetching ? common.loading : common.retry}
            </Button>
          </div>
        </div>
      )}
      <div
        ref={timelineRef}
        className={styles.timeline}
        aria-label={t.label}
        onScroll={handleScroll}
      >
        <div className={styles.content}>
          {showOlderRetry ? (
            <div className={`${styles.olderRetry} ${styles.retryRow}`}>
              <Notice tone="warning" icon="alert" role="status">
                {t.olderFailed}
              </Notice>
              <Button
                variant="secondary"
                size="md"
                icon="refresh"
                onClick={() => void query.fetchNextPage()}
              >
                {common.retry}
              </Button>
            </div>
          ) : (
            query.hasNextPage && (
              <button
                className={styles.older}
                type="button"
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {query.isFetchingNextPage ? t.olderLoading : t.olderShow}
              </button>
            )
          )}
          {messages.length === 0 ? (
            <div className={styles.state}>
              <span className={styles.stateIcon} aria-hidden="true">
                <AppIcon name="live" />
              </span>
              <strong>{t.emptyTitle}</strong>
              <p>{t.emptyBody}</p>
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
                    <div className={styles.dateDivider}>
                      <span>{formatChatDate(message.createdAt, locale)}</span>
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
      </div>
      {unreadCount > 0 && (
        <button
          className={styles.newMessages}
          type="button"
          aria-label={t.newMessagesLabel(unreadCount)}
          onClick={() => moveToLatest(scrollBehavior())}
        >
          <AppIcon name="arrow-right" className={styles.down} />
          {t.newMessages}
          <strong>{unreadCount}</strong>
        </button>
      )}
    </div>
  );
}
