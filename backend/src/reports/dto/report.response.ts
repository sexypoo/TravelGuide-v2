import type {
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from '@prisma/client';

export interface ReportResponse {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export function toReportResponse(report: {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}): ReportResponse {
  return {
    ...report,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  };
}
