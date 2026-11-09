'use client';

import {
  questionCategories,
  type QuestionCategory,
  type QuestionListStatus,
} from '@/lib/api/questions';
import { Button, EmptyState, Notice, uiStyles } from '@/components/ui';
import { useMessages } from '@/i18n/client';
import { useState } from 'react';
import { useQuestions } from '@/lib/query/use-questions';
import { QuestionCard } from './question-card';
import styles from './question-feed.module.css';

export function QuestionFeed({
  roomSlug,
  status,
  canShare = false,
}: {
  roomSlug: string;
  status: QuestionListStatus;
  canShare?: boolean;
}): React.JSX.Element {
  const messages = useMessages();
  const t = messages.topics.feed;
  const [category, setCategory] = useState<QuestionCategory>();
  const query = useQuestions(roomSlug, status, category);

  const filters = (
    <div
      className={`${uiStyles.filters} ${styles.filters}`}
      aria-label={t.filtersLabel}
    >
      <button
        type="button"
        aria-pressed={category === undefined}
        onClick={() => setCategory(undefined)}
      >
        {t.all}
      </button>
      {questionCategories.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={category === item}
          onClick={() => setCategory(item)}
        >
          {messages.topics.labels.category[item]}
        </button>
      ))}
    </div>
  );

  if (query.isPending) {
    return (
      <>
        {filters}
        <div className={styles.skeleton} aria-label={t.loadingLabel}>
          <span />
          <span />
          <span />
        </div>
      </>
    );
  }
  // Only replace the list when nothing has loaded yet. A failed refetch or
  // next-page fetch keeps the loaded topics and shows a retry row.
  const data = query.data;
  if (data === undefined) {
    return (
      <>
        {filters}
        <div className={styles.state} role="alert">
          <EmptyState
            icon="alert"
            title={messages.topics.shared.loadErrorTitle}
            description={t.loadErrorDescription}
            action={
              <Button
                variant="secondary"
                size="sm"
                icon="refresh"
                onClick={() => void query.refetch()}
              >
                {messages.topics.shared.reload}
              </Button>
            }
          />
        </div>
      </>
    );
  }

  const questions = data.questions;
  const refetchRetry = query.isRefetchError && (
    <div className={`${styles.retryTop} ${styles.retryRow}`}>
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
        {query.isFetching ? messages.common.loading : messages.common.retry}
      </Button>
    </div>
  );

  if (questions.length === 0) {
    return (
      <>
        {filters}
        {refetchRetry}
        <div className={styles.state}>
          <EmptyState
            icon="topic"
            tone="iris"
            title={status === 'OPEN' ? t.emptyOpenTitle : t.emptyResolvedTitle}
            description={
              status === 'OPEN'
                ? t.emptyOpenDescription
                : t.emptyResolvedDescription
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      {filters}
      {refetchRetry}
      <div className={styles.feed}>
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            roomSlug={roomSlug}
            canShare={canShare}
          />
        ))}
        {query.isFetchNextPageError && !query.isFetchingNextPage ? (
          <div className={styles.retryRow}>
            <Notice tone="warning" icon="alert" role="status">
              {t.moreFailed}
            </Notice>
            <Button
              variant="secondary"
              size="md"
              icon="refresh"
              onClick={() => void query.fetchNextPage()}
            >
              {messages.common.retry}
            </Button>
          </div>
        ) : (
          query.hasNextPage && (
            <Button
              variant="ghost"
              block
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              {query.isFetchingNextPage ? messages.common.loading : t.more}
            </Button>
          )
        )}
      </div>
    </>
  );
}
