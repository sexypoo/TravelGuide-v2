'use client';

import {
  questionCategories,
  type QuestionCategory,
  type QuestionListStatus,
} from '@/lib/api/questions';
import { Button, EmptyState, uiStyles } from '@/components/ui';
import { categoryLabels } from '@/lib/questions/presentation';
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
  const [category, setCategory] = useState<QuestionCategory>();
  const query = useQuestions(roomSlug, status, category);

  const filters = (
    <div
      className={`${uiStyles.filters} ${styles.filters}`}
      aria-label="토픽 종류 필터"
    >
      <button
        type="button"
        aria-pressed={category === undefined}
        onClick={() => setCategory(undefined)}
      >
        전체
      </button>
      {questionCategories.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={category === item}
          onClick={() => setCategory(item)}
        >
          {categoryLabels[item]}
        </button>
      ))}
    </div>
  );

  if (query.isPending) {
    return (
      <>
        {filters}
        <div className={styles.skeleton} aria-label="토픽을 불러오는 중">
          <span />
          <span />
          <span />
        </div>
      </>
    );
  }
  if (query.isError) {
    return (
      <>
        {filters}
        <div className={styles.state} role="alert">
          <EmptyState
            icon="alert"
            title="토픽을 불러오지 못했어요"
            description="연결을 확인한 뒤 다시 시도해 주세요."
            action={
              <Button
                variant="secondary"
                size="sm"
                icon="refresh"
                onClick={() => void query.refetch()}
              >
                다시 불러오기
              </Button>
            }
          />
        </div>
      </>
    );
  }

  const questions = query.data.questions;
  if (questions.length === 0) {
    return (
      <>
        {filters}
        <div className={styles.state}>
          <EmptyState
            icon="topic"
            tone="iris"
            title={
              status === 'OPEN'
                ? '아직 진행 중인 토픽이 없어요'
                : '아직 해결된 토픽이 없어요'
            }
            description={
              status === 'OPEN'
                ? '대화에서 중요한 상황을 토픽으로 이어가 보세요.'
                : '답변을 통해 해결된 토픽이 이곳에 모여요.'
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      {filters}
      <div className={styles.feed}>
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            roomSlug={roomSlug}
            canShare={canShare}
          />
        ))}
        {query.hasNextPage && (
          <Button
            variant="ghost"
            block
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? '불러오는 중' : '토픽 더 보기'}
          </Button>
        )}
      </div>
    </>
  );
}
