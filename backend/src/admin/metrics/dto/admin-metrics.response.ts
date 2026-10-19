/**
 * Unique non-admin user counts per funnel step. Each rate compares a step with
 * the step right before it and is capped at 100 (ADR-051). Counts only — never
 * add identifiers, emails, GPS, or evidence fields here.
 */
export interface AdminUserFunnelResponse {
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

export interface AdminSupplyResponse {
  unansweredExpiredQuestionCount: number;
  unansweredExpiredQuestionRate: number;
  averageAnswersPerAnsweredQuestion: number | null;
  medianFirstAnswerMinutes: number | null;
}

export interface AdminMetricsResponse {
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
  userFunnel: AdminUserFunnelResponse;
  supply: AdminSupplyResponse;
}
