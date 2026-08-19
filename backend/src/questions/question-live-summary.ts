import type { AnswerResponse } from '../answers/dto/answer.response';
import type { LiveStatusSummary } from './dto/question.response';

function mode<T extends string>(values: T[]): T | null {
  if (values.length === 0) return null;
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return (
    [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ??
    null
  );
}

export function buildLiveSummary(
  category: string,
  answers: AnswerResponse[],
  now = new Date(),
): LiveStatusSummary | null {
  if (category !== 'WAITING' && category !== 'CROWD') return null;
  const allObservations = answers
    .filter((answer) => !answer.removed && answer.observation !== null)
    .map((answer) => ({ authorId: answer.author.id, ...answer.observation! }))
    .sort(
      (left, right) =>
        new Date(right.observedAt).getTime() -
        new Date(left.observedAt).getTime(),
    );
  const seenAuthors = new Set<string>();
  const observations = allObservations.filter((observation) => {
    if (seenAuthors.has(observation.authorId)) return false;
    seenAuthors.add(observation.authorId);
    return true;
  });
  if (observations.length === 0) return null;
  const waits = observations
    .map((observation) => observation.waitMinutes)
    .filter((value): value is number => value !== null)
    .sort((left, right) => left - right);
  const median =
    waits.length === 0
      ? null
      : (waits[Math.floor((waits.length - 1) / 2)] ?? null);
  const waitRange =
    median === null
      ? null
      : {
          min: Math.max(0, Math.floor(median / 10) * 10),
          max: Math.max(10, Math.ceil(median / 10) * 10),
        };
  if (waitRange !== null && waitRange.min === waitRange.max) {
    waitRange.max += 10;
  }
  const agreementCount =
    median === null
      ? observations.length
      : waits.filter((value) => Math.abs(value - median) <= 10).length;
  const lastObserved = new Date(
    Math.max(
      ...observations.map((observation) =>
        new Date(observation.observedAt).getTime(),
      ),
    ),
  );
  const description =
    waitRange === null
      ? `현장 답변 ${observations.length}건을 기준으로 현재 상태를 정리했습니다.`
      : `현장 답변 기준 현재 대기는 약 ${waitRange.min}~${waitRange.max}분 수준입니다.`;
  return {
    freshness:
      now.getTime() - lastObserved.getTime() > 30 * 60 * 1000
        ? 'STALE'
        : 'LIVE',
    responseCount: observations.length,
    agreementCount,
    waitMinutes: waitRange,
    crowdLevel: mode(
      observations
        .map((observation) => observation.crowdLevel)
        .filter((value): value is NonNullable<typeof value> => value !== null),
    ),
    entryStatus: mode(
      observations
        .map((observation) => observation.entryStatus)
        .filter((value): value is NonNullable<typeof value> => value !== null),
    ),
    lastObservedAt: lastObserved.toISOString(),
    recommendedRecheckAt: new Date(
      lastObserved.getTime() + 10 * 60 * 1000,
    ).toISOString(),
    staleAfter: new Date(lastObserved.getTime() + 30 * 60 * 1000).toISOString(),
    description,
  };
}
