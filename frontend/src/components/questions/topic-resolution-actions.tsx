'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { Button } from '@/components/ui';
import { useMessages } from '@/i18n/client';
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
  const messages = useMessages();
  const t = messages.topics.resolution;
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
    ? actionableErrorMessage(mutation.error, t.failed)
    : undefined;

  return (
    <section className={styles.panel} aria-label={t.panelLabel}>
      <header className={styles.head}>
        <h2>{t.title}</h2>
        <p>{t.description}</p>
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
                  {t.acceptBefore}
                  <strong>{answer.author.nickname}</strong>
                  {t.acceptAfter}
                </span>
              </button>
            ))}
          <button
            className={`${styles.choice} ${styles.choiceQuiet}`}
            type="button"
            onClick={() => setDecision({ kind: 'RESOLVE' })}
          >
            <AppIcon name="minus" />
            <span>{t.resolveWithout}</span>
          </button>
        </div>
      ) : (
        <div className={styles.confirm}>
          <strong>
            {decision.kind === 'ACCEPT'
              ? t.confirmAccept(
                  selectedAnswer?.author.nickname ?? t.selectedFallback,
                )
              : t.confirmResolve}
          </strong>
          <p>{t.irreversible}</p>
          {error !== undefined && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.confirmActions}>
            <Button
              variant="secondary"
              onClick={() => {
                mutation.reset();
                setDecision(undefined);
              }}
              disabled={mutation.isPending}
            >
              {messages.common.cancel}
            </Button>
            <Button
              onClick={() => mutation.mutate(decision)}
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? t.saving
                : decision.kind === 'ACCEPT'
                  ? t.acceptAndResolve
                  : t.resolve}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
