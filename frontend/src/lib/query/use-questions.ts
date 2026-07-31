'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getQuestion,
  getQuestionPage,
  type Question,
  type QuestionListStatus,
} from '../api/questions';
import { queryKeys } from './keys';

export function useQuestions(roomSlug: string, status: QuestionListStatus) {
  return useInfiniteQuery({
    queryKey: queryKeys.roomQuestions(roomSlug, status),
    queryFn: ({ pageParam }) =>
      getQuestionPage(roomSlug, status, pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    select: (data) => {
      const seen = new Set<string>();
      const questions: Question[] = [];
      for (const page of data.pages) {
        for (const question of page.items) {
          if (!seen.has(question.id)) {
            seen.add(question.id);
            questions.push(question);
          }
        }
      }
      return { ...data, questions };
    },
  });
}

export function useQuestion(questionId: string) {
  return useQuery({
    queryKey: queryKeys.question(questionId),
    queryFn: () => getQuestion(questionId),
  });
}
