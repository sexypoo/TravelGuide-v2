function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isPercentage(value: unknown): value is number {
  return isNonNegativeNumber(value) && value <= 100;
}

export interface AdminMetrics {
  generatedAt: string;
  questionCount: number;
  answeredQuestionCount: number;
  answeredQuestionRate: number;
  averageFirstAnswerMinutes: number | null;
  answeredWithinTenMinutesRate: number;
  resolvedQuestionCount: number;
  resolutionRate: number;
  acceptedQuestionCount: number;
  acceptanceRate: number;
  localContributors: Array<{
    userId: string;
    nickname: string;
    answerCount: number;
  }>;
}

export function parseAdminMetrics(value: unknown): AdminMetrics {
  if (
    !isRecord(value) ||
    typeof value.generatedAt !== 'string' ||
    Number.isNaN(new Date(value.generatedAt).getTime()) ||
    !isCount(value.questionCount) ||
    !isCount(value.answeredQuestionCount) ||
    !isPercentage(value.answeredQuestionRate) ||
    (value.averageFirstAnswerMinutes !== null &&
      !isNonNegativeNumber(value.averageFirstAnswerMinutes)) ||
    !isPercentage(value.answeredWithinTenMinutesRate) ||
    !isCount(value.resolvedQuestionCount) ||
    !isPercentage(value.resolutionRate) ||
    !isCount(value.acceptedQuestionCount) ||
    !isPercentage(value.acceptanceRate) ||
    !Array.isArray(value.localContributors)
  ) {
    throw new Error('관리자 지표 응답 형식이 올바르지 않습니다.');
  }
  const localContributors = value.localContributors.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.userId !== 'string' ||
      typeof item.nickname !== 'string' ||
      !isCount(item.answerCount)
    ) {
      throw new Error('관리자 지표 응답 형식이 올바르지 않습니다.');
    }
    return {
      userId: item.userId,
      nickname: item.nickname,
      answerCount: Number(item.answerCount),
    };
  });

  return {
    generatedAt: value.generatedAt,
    questionCount: value.questionCount,
    answeredQuestionCount: value.answeredQuestionCount,
    answeredQuestionRate: value.answeredQuestionRate,
    averageFirstAnswerMinutes: value.averageFirstAnswerMinutes,
    answeredWithinTenMinutesRate: value.answeredWithinTenMinutesRate,
    resolvedQuestionCount: value.resolvedQuestionCount,
    resolutionRate: value.resolutionRate,
    acceptedQuestionCount: value.acceptedQuestionCount,
    acceptanceRate: value.acceptanceRate,
    localContributors,
  };
}
