import { problemFromResponse } from './problem-details';

export const reportReasons = [
  'SPAM',
  'ABUSE',
  'FALSE_INFORMATION',
  'ADVERTISEMENT',
  'PRIVACY',
  'SAFETY',
  'OTHER',
] as const;
export type ReportReason = (typeof reportReasons)[number];
export type ReportTargetType = 'QUESTION' | 'ANSWER' | 'USER';

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  detail?: string;
}

export async function createReport(input: CreateReportInput): Promise<void> {
  const response = await fetch('/api/v1/reports', {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await problemFromResponse(response);
}
