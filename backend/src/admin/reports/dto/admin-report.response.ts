import type {
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from '@prisma/client';

export interface AdminReportResponse {
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
