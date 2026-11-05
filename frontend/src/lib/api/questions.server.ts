import 'server-only';

import { unstable_rethrow } from 'next/navigation';

import { fetchProtectedApi } from './protected-server';
import {
  parseQuestion,
  parseQuestionPage,
  type QuestionPage,
} from './questions';

export async function getOpenQuestions(
  roomSlug: string,
  limit = 3,
): Promise<QuestionPage> {
  const safeSlug = encodeURIComponent(roomSlug);
  const query = new URLSearchParams({ status: 'OPEN', limit: String(limit) });
  const response = await fetchProtectedApi(
    `/api/v1/rooms/${safeSlug}/questions?${query.toString()}`,
    '/app',
  );
  return parseQuestionPage(await response.json());
}

/** The room a question belongs to, or null when it can't be read (#68). */
export async function getQuestionRoomId(
  questionId: string,
): Promise<string | null> {
  const safeId = encodeURIComponent(questionId);
  try {
    const response = await fetchProtectedApi(
      `/api/v1/questions/${safeId}`,
      `/app/questions/${safeId}`,
    );
    return parseQuestion(await response.json()).roomId;
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
}
