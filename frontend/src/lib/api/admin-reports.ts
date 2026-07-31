import { problemFromResponse } from './problem-details';
import type { ReportReason, ReportTargetType } from './reports';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
export type ReportReviewDecision = 'KEEP' | 'REMOVE' | 'DISMISS';

export interface AdminReport {
  id: string;
  reporter: { id: string; nickname: string };
  targetType: ReportTargetType;
  targetId: string;
  target: {
    author: { id: string; nickname: string };
    content: string | null;
    removed: boolean;
    roomSlug: string | null;
    questionId: string | null;
  };
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  reviewedBy: { id: string; nickname: string } | null;
  reviewedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function nullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}
function person(value: unknown): value is { id: string; nickname: string } {
  return (
    record(value) &&
    typeof value.id === 'string' &&
    typeof value.nickname === 'string'
  );
}

export function parseAdminReport(value: unknown): AdminReport {
  if (
    !record(value) ||
    typeof value.id !== 'string' ||
    !person(value.reporter) ||
    !['QUESTION', 'ANSWER', 'USER'].includes(String(value.targetType)) ||
    typeof value.targetId !== 'string' ||
    !record(value.target) ||
    !person(value.target.author) ||
    !nullableString(value.target.content) ||
    typeof value.target.removed !== 'boolean' ||
    !nullableString(value.target.roomSlug) ||
    !nullableString(value.target.questionId) ||
    ![
      'SPAM',
      'ABUSE',
      'FALSE_INFORMATION',
      'ADVERTISEMENT',
      'PRIVACY',
      'SAFETY',
      'OTHER',
    ].includes(String(value.reason)) ||
    !nullableString(value.detail) ||
    !['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].includes(
      String(value.status),
    ) ||
    (value.reviewedBy !== null && !person(value.reviewedBy)) ||
    !nullableString(value.reviewedAt) ||
    !nullableString(value.resolutionNote) ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string'
  ) {
    throw new Error('관리자 신고 정보 형식이 올바르지 않습니다.');
  }
  return {
    id: value.id,
    reporter: value.reporter,
    targetType: value.targetType as ReportTargetType,
    targetId: value.targetId,
    target: {
      author: value.target.author,
      content: value.target.content,
      removed: value.target.removed,
      roomSlug: value.target.roomSlug,
      questionId: value.target.questionId,
    },
    reason: value.reason as ReportReason,
    detail: value.detail,
    status: value.status as ReportStatus,
    reviewedBy: value.reviewedBy,
    reviewedAt: value.reviewedAt,
    resolutionNote: value.resolutionNote,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function parseAdminReports(value: unknown): AdminReport[] {
  if (!Array.isArray(value))
    throw new Error('관리자 신고 목록 형식이 올바르지 않습니다.');
  return value.map(parseAdminReport);
}

export async function reviewReport(
  id: string,
  input: { decision: ReportReviewDecision; note?: string },
): Promise<void> {
  const response = await fetch(
    `/api/v1/admin/reports/${encodeURIComponent(id)}/review`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  );
  if (!response.ok) throw await problemFromResponse(response);
}
