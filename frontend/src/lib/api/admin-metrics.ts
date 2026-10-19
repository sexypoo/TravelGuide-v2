import { isRecord } from './runtime';

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isPercentage(value: unknown): value is number {
  return isNonNegativeNumber(value) && value <= 100;
}

const INVALID = '관리자 지표 응답 형식이 올바르지 않습니다.';

function isNullableNonNegative(value: unknown): value is number | null {
  return value === null || isNonNegativeNumber(value);
}

export interface AdminUserFunnel {
  signedUpCount: number;
  verificationAppliedCount: number;
  verificationAppliedRate: number;
  verificationApprovedCount: number;
  verificationApprovedRate: number;
  travelerApprovedCount: number;
  localApprovedCount: number;
  firstTopicCount: number;
  firstTopicRate: number;
  answerReceivedCount: number;
  answerReceivedRate: number;
  answerAcceptedCount: number;
  answerAcceptedRate: number;
}

export interface AdminSupply {
  unansweredExpiredQuestionCount: number;
  unansweredExpiredQuestionRate: number;
  averageAnswersPerAnsweredQuestion: number | null;
  medianFirstAnswerMinutes: number | null;
}

function parseUserFunnel(value: unknown): AdminUserFunnel {
  if (
    !isRecord(value) ||
    !isCount(value.signedUpCount) ||
    !isCount(value.verificationAppliedCount) ||
    !isPercentage(value.verificationAppliedRate) ||
    !isCount(value.verificationApprovedCount) ||
    !isPercentage(value.verificationApprovedRate) ||
    !isCount(value.travelerApprovedCount) ||
    !isCount(value.localApprovedCount) ||
    !isCount(value.firstTopicCount) ||
    !isPercentage(value.firstTopicRate) ||
    !isCount(value.answerReceivedCount) ||
    !isPercentage(value.answerReceivedRate) ||
    !isCount(value.answerAcceptedCount) ||
    !isPercentage(value.answerAcceptedRate)
  ) {
    throw new Error(INVALID);
  }
  return {
    signedUpCount: value.signedUpCount,
    verificationAppliedCount: value.verificationAppliedCount,
    verificationAppliedRate: value.verificationAppliedRate,
    verificationApprovedCount: value.verificationApprovedCount,
    verificationApprovedRate: value.verificationApprovedRate,
    travelerApprovedCount: value.travelerApprovedCount,
    localApprovedCount: value.localApprovedCount,
    firstTopicCount: value.firstTopicCount,
    firstTopicRate: value.firstTopicRate,
    answerReceivedCount: value.answerReceivedCount,
    answerReceivedRate: value.answerReceivedRate,
    answerAcceptedCount: value.answerAcceptedCount,
    answerAcceptedRate: value.answerAcceptedRate,
  };
}

function parseSupply(value: unknown): AdminSupply {
  if (
    !isRecord(value) ||
    !isCount(value.unansweredExpiredQuestionCount) ||
    !isPercentage(value.unansweredExpiredQuestionRate) ||
    !isNullableNonNegative(value.averageAnswersPerAnsweredQuestion) ||
    !isNullableNonNegative(value.medianFirstAnswerMinutes)
  ) {
    throw new Error(INVALID);
  }
  return {
    unansweredExpiredQuestionCount: value.unansweredExpiredQuestionCount,
    unansweredExpiredQuestionRate: value.unansweredExpiredQuestionRate,
    averageAnswersPerAnsweredQuestion: value.averageAnswersPerAnsweredQuestion,
    medianFirstAnswerMinutes: value.medianFirstAnswerMinutes,
  };
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
  userFunnel: AdminUserFunnel;
  supply: AdminSupply;
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
    throw new Error(INVALID);
  }
  const localContributors = value.localContributors.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.userId !== 'string' ||
      typeof item.nickname !== 'string' ||
      !isCount(item.answerCount)
    ) {
      throw new Error(INVALID);
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
    userFunnel: parseUserFunnel(value.userFunnel),
    supply: parseSupply(value.supply),
  };
}
