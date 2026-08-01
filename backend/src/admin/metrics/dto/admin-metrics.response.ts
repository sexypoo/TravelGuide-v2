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
}
