'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { Button } from '@/components/ui';
import {
  acceptAnswer,
  resolveQuestion,
  type QuestionDetail,
  type QuestionPage,
} from '@/lib/api/questions';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import {
  mergeQuestionIntoFeed,
  removeQuestionFromFeed,
} from '@/lib/query/realtime-cache';
import styles from './topic-resolution-actions.module.css';

type Decision = { kind: 'ACCEPT'; answerId: string } | { kind: 'RESOLVE' };

export function TopicResolutionActions({
  question,
  roomSlug,
}: {
  question: QuestionDetail;
  roomSlug: string;
}): React.JSX.Element {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<Decision>();
  const mutation = useMutation({
    mutationFn: (next: Decision) =>
      next.kind === 'ACCEPT'
        ? acceptAnswer(question.id, next.answerId)
        : resolveQuestion(question.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.question(question.id), updated);
      queryClient.setQueryData<InfiniteData<QuestionPage>>(
        queryKeys.roomQuestions(roomSlug, 'OPEN'),
        (current) => removeQuestionFromFeed(current, question.id),
      );
      queryClient.setQueryData<InfiniteData<QuestionPage>>(
        queryKeys.roomQuestions(roomSlug, 'RESOLVED'),
        (current) => mergeQuestionIntoFeed(current, updated),
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.roomQuestionsRoot(roomSlug),
      });
      setDecision(undefined);
    },
  });
  const selectedAnswer =
    decision?.kind === 'ACCEPT'
      ? question.answers.find((answer) => answer.id === decision.answerId)
      : undefined;
  const error = mutation.isError
    ? actionableErrorMessage(
        mutation.error,
        '해결 상태를 저장하지 못했습니다. 연결을 확인해 주세요.',
      )
    : undefined;

  return (
    <section className={styles.panel} aria-label="토픽 해결 결정">
      <header className={styles.head}>
        <h2>도움이 됐다면 해결을 남겨주세요</h2>
        <p>채택은 한 번만 가능하며 이후에는 새 답변을 받을 수 없어요.</p>
      </header>
      {decision === undefined ? (
        <div className={styles.choices}>
          {question.answers
            .filter((answer) => !answer.removed)
            .map((answer) => (
              <button
                key={answer.id}
                className={styles.choice}
                type="button"
                onClick={() =>
                  setDecision({ kind: 'ACCEPT', answerId: answer.id })
                }
              >
                <AppIcon name="check" />
                <span>
                  <strong>{answer.author.nickname}</strong>이 답변 채택
                </span>
              </button>
            ))}
          <button
            className={`${styles.choice} ${styles.choiceQuiet}`}
            type="button"
            onClick={() => setDecision({ kind: 'RESOLVE' })}
          >
            <AppIcon name="minus" />
            <span>답변 없이 해결됨으로 표시</span>
          </button>
        </div>
      ) : (
        <div className={styles.confirm}>
          <strong>
            {decision.kind === 'ACCEPT'
              ? `${selectedAnswer?.author.nickname ?? '선택한 현지인'}님의 답변을 채택할까요?`
              : '답변 채택 없이 이 토픽을 해결할까요?'}
          </strong>
          <p>완료 후에는 채택을 바꾸거나 토픽을 다시 열 수 없어요.</p>
          {error !== undefined && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.confirmActions}>
            <Button
              variant="secondary"
              onClick={() => setDecision(undefined)}
              disabled={mutation.isPending}
            >
              취소
            </Button>
            <Button
              onClick={() => mutation.mutate(decision)}
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? '저장 중…'
                : decision.kind === 'ACCEPT'
                  ? '채택하고 해결'
                  : '해결 확정'}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
