import { requestVoid } from './client';

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
export type ReportTargetType =
  | 'MESSAGE'
  | 'QUESTION'
  | 'ANSWER'
  | 'COMMUNITY_POST'
  | 'COMMUNITY_COMMENT'
  | 'USER';

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  detail?: string;
}

export async function createReport(input: CreateReportInput): Promise<void> {
  await requestVoid('/api/v1/reports', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
