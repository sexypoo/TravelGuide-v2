'use client';

import {
  questionCategories,
  type QuestionCategory,
  type QuestionListStatus,
} from '@/lib/api/questions';
import { categoryLabels } from '@/lib/questions/presentation';
import { useState } from 'react';
import { useQuestions } from '@/lib/query/use-questions';
import { QuestionCard } from './question-card';

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
    <div className="topicCategoryFilters" aria-label="토픽 종류 필터">
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
        <div className="questionFeedSkeleton" aria-label="토픽을 불러오는 중">
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
        <div className="roomQueryState roomQueryState--error" role="alert">
          <span aria-hidden="true">!</span>
          <h2>토픽을 불러오지 못했어요</h2>
          <p>연결을 확인한 뒤 다시 시도해 주세요.</p>
          <button type="button" onClick={() => void query.refetch()}>
            다시 불러오기
          </button>
        </div>
      </>
    );
  }

  const questions = query.data.questions;
  if (questions.length === 0) {
    return (
      <>
        {filters}
        <div className="roomQueryState">
          <span aria-hidden="true">⌁</span>
          <h2>
            {status === 'OPEN'
              ? '아직 진행 중인 토픽이 없어요'
              : '아직 해결된 토픽이 없어요'}
          </h2>
          <p>
            {status === 'OPEN'
              ? '대화에서 중요한 상황을 토픽으로 이어가 보세요.'
              : '답변을 통해 해결된 토픽이 이곳에 모입니다.'}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="questionFeedFilterWrap">{filters}</div>
      <div className="questionFeed">
        <div className="questionSignalRail" aria-hidden="true" />
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            roomSlug={roomSlug}
            canShare={canShare}
          />
        ))}
        {query.hasNextPage && (
          <button
            className="loadMoreButton"
            type="button"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? '불러오는 중' : '토픽 더 보기'}
          </button>
        )}
      </div>
    </>
  );
}
