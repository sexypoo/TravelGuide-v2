import type { InfiniteData } from '@tanstack/react-query';
import type {
  Answer,
  Question,
  QuestionDetail,
  QuestionPage,
} from '../api/questions';

export function mergeQuestionIntoFeed(
  current: InfiniteData<QuestionPage> | undefined,
  question: Question,
): InfiniteData<QuestionPage> | undefined {
  if (
    current === undefined ||
    current.pages.some((page) =>
      page.items.some((item) => item.id === question.id),
    )
  ) {
    return current;
  }
  const first = current.pages[0];
  if (first === undefined) return current;
  return {
    ...current,
    pages: [
      { ...first, items: [question, ...first.items] },
      ...current.pages.slice(1),
    ],
  };
}

export function mergeAnswerIntoDetail(
  current: QuestionDetail | undefined,
  answer: Answer,
): QuestionDetail | undefined {
  if (
    current === undefined ||
    current.id !== answer.questionId ||
    current.answers.some((item) => item.id === answer.id)
  ) {
    return current;
  }
  const answers = [...current.answers, answer].sort(
    (left, right) =>
      left.createdAt.localeCompare(right.createdAt) ||
      left.id.localeCompare(right.id),
  );
  return { ...current, answers, answerCount: answers.length };
}

export function incrementFeedAnswerCount(
  current: InfiniteData<QuestionPage> | undefined,
  questionId: string,
): InfiniteData<QuestionPage> | undefined {
  if (current === undefined) return current;
  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.map((question) =>
        question.id === questionId
          ? { ...question, answerCount: question.answerCount + 1 }
          : question,
      ),
    })),
  };
}
