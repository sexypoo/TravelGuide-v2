import 'server-only';

import { fetchProtectedApi } from './protected-server';
import { parseQuestionPage, type QuestionPage } from './questions';

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
