import type {
  LocalProofType,
  VerificationStatus,
  VerificationType,
} from '@prisma/client';

interface AdminVerificationRecord {
  id: string;
  type: VerificationType;
  status: VerificationStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  localProofType: LocalProofType | null;
  gpsAccuracyMeters: number | null;
  gpsCapturedAt: Date | null;
  submittedNote: string | null;
  reviewedAt: Date | null;
  reviewedById: string | null;
  rejectionReason: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  user: { id: string; nickname: string };
  destination: {
    id: string;
    slug: string;
    nameKo: string;
  };
}

export interface AdminVerificationResponse {
  id: string;
  applicant: { id: string; nickname: string };
  destination: { id: string; slug: string; nameKo: string };
  type: VerificationType;
  status: VerificationStatus;
  startsAt: string | null;
  endsAt: string | null;
  localProofType: LocalProofType | null;
  gpsSummary: {
    accuracyMeters: number;
    capturedAt: string;
    withinDestinationRadius: true;
  } | null;
  note: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export function toAdminVerificationResponse(
  item: AdminVerificationRecord,
): AdminVerificationResponse {
  return {
    id: item.id,
    applicant: item.user,
    destination: item.destination,
    type: item.type,
    status: item.status,
    startsAt: item.startsAt?.toISOString() ?? null,
    endsAt: item.endsAt?.toISOString() ?? null,
    localProofType: item.localProofType,
    gpsSummary:
      item.gpsAccuracyMeters === null || item.gpsCapturedAt === null
        ? null
        : {
            accuracyMeters: item.gpsAccuracyMeters,
            capturedAt: item.gpsCapturedAt.toISOString(),
            withinDestinationRadius: true,
          },
    note: item.submittedNote,
    reviewedById: item.reviewedById,
    reviewedAt: item.reviewedAt?.toISOString() ?? null,
    rejectionReason: item.rejectionReason,
    expiresAt: item.expiresAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
  };
}
