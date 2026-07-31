import type {
  LocalProofType,
  VerificationStatus,
  VerificationType,
} from '@prisma/client';

export interface VerificationResponse {
  id: string;
  destination: { id: string; slug: string; nameKo: string };
  type: VerificationType;
  status: VerificationStatus;
  startsAt: string | null;
  endsAt: string | null;
  localProofType: LocalProofType | null;
  note: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface VerificationForResponse {
  id: string;
  type: VerificationType;
  status: VerificationStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  localProofType: LocalProofType | null;
  submittedNote: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  destination: { id: string; slug: string; nameKo: string };
}

export function toVerificationResponse(
  verification: VerificationForResponse,
): VerificationResponse {
  return {
    id: verification.id,
    destination: verification.destination,
    type: verification.type,
    status: verification.status,
    startsAt: verification.startsAt?.toISOString() ?? null,
    endsAt: verification.endsAt?.toISOString() ?? null,
    localProofType: verification.localProofType,
    note: verification.submittedNote,
    reviewedAt: verification.reviewedAt?.toISOString() ?? null,
    rejectionReason:
      verification.status === 'REJECTED' ? verification.rejectionReason : null,
    expiresAt: verification.expiresAt?.toISOString() ?? null,
    createdAt: verification.createdAt.toISOString(),
  };
}
