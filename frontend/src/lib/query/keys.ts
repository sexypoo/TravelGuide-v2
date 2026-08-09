import type { QuestionCategory, QuestionListStatus } from '../api/questions';

export const queryKeys = {
  roomRoot: ['room'] as const,
  room: (roomSlug: string) => ['room', roomSlug] as const,
  roomMessages: (roomSlug: string) => ['room', roomSlug, 'messages'] as const,
  roomQuestionsRoot: (roomSlug: string) =>
    ['room', roomSlug, 'questions'] as const,
  roomQuestions: (
    roomSlug: string,
    status: QuestionListStatus,
    category?: QuestionCategory,
  ) => ['room', roomSlug, 'questions', status, category ?? 'ALL'] as const,
  questionRoot: ['questions'] as const,
  question: (questionId: string) => ['questions', questionId] as const,
  placeFavorites: ['place-favorites'] as const,
};
