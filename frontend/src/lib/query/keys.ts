import type { QuestionListStatus } from '../api/questions';

export const queryKeys = {
  roomRoot: ['room'] as const,
  room: (roomSlug: string) => ['room', roomSlug] as const,
  roomMessages: (roomSlug: string) => ['room', roomSlug, 'messages'] as const,
  roomQuestionsRoot: (roomSlug: string) =>
    ['room', roomSlug, 'questions'] as const,
  roomQuestions: (roomSlug: string, status: QuestionListStatus) =>
    ['room', roomSlug, 'questions', status] as const,
  questionRoot: ['questions'] as const,
  question: (questionId: string) => ['questions', questionId] as const,
};
