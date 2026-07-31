import { problemFromResponse } from './problem-details';
import type {
  LocalProofType,
  VerificationStatus,
  VerificationType,
} from './verifications';

export interface AdminVerification {
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

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function nullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

export function parseAdminVerification(value: unknown): AdminVerification {
  if (
    !record(value) ||
    typeof value.id !== 'string' ||
    !record(value.applicant) ||
    typeof value.applicant.id !== 'string' ||
    typeof value.applicant.nickname !== 'string' ||
    !record(value.destination) ||
    typeof value.destination.id !== 'string' ||
    typeof value.destination.slug !== 'string' ||
    typeof value.destination.nameKo !== 'string' ||
    (value.type !== 'TRAVELER' && value.type !== 'LOCAL') ||
    !['PENDING', 'APPROVED', 'REJECTED', 'REVOKED', 'EXPIRED'].includes(
      String(value.status),
    ) ||
    !nullableString(value.startsAt) ||
    !nullableString(value.endsAt) ||
    !nullableString(value.note) ||
    !nullableString(value.reviewedById) ||
    !nullableString(value.reviewedAt) ||
    !nullableString(value.rejectionReason) ||
    !nullableString(value.expiresAt) ||
    typeof value.createdAt !== 'string' ||
    (value.localProofType !== null &&
      !['RESIDENCE', 'WORK', 'STUDY', 'OTHER'].includes(
        String(value.localProofType),
      ))
  )
    throw new Error('관리자 인증 정보 형식이 올바르지 않습니다.');
  let gpsSummary: AdminVerification['gpsSummary'] = null;
  if (value.gpsSummary !== null) {
    if (
      !record(value.gpsSummary) ||
      typeof value.gpsSummary.accuracyMeters !== 'number' ||
      typeof value.gpsSummary.capturedAt !== 'string' ||
      value.gpsSummary.withinDestinationRadius !== true
    )
      throw new Error('GPS 요약 형식이 올바르지 않습니다.');
    gpsSummary = {
      accuracyMeters: value.gpsSummary.accuracyMeters,
      capturedAt: value.gpsSummary.capturedAt,
      withinDestinationRadius: true,
    };
  }
  return {
    id: value.id,
    applicant: { id: value.applicant.id, nickname: value.applicant.nickname },
    destination: {
      id: value.destination.id,
      slug: value.destination.slug,
      nameKo: value.destination.nameKo,
    },
    type: value.type,
    status: value.status as VerificationStatus,
    startsAt: value.startsAt,
    endsAt: value.endsAt,
    localProofType: value.localProofType as LocalProofType | null,
    gpsSummary,
    note: value.note,
    reviewedById: value.reviewedById,
    reviewedAt: value.reviewedAt,
    rejectionReason: value.rejectionReason,
    expiresAt: value.expiresAt,
    createdAt: value.createdAt,
  };
}

export function parseAdminVerifications(value: unknown): AdminVerification[] {
  if (!Array.isArray(value))
    throw new Error('관리자 인증 목록 형식이 올바르지 않습니다.');
  return value.map(parseAdminVerification);
}

export async function reviewVerification(
  id: string,
  input: { decision: 'APPROVE' | 'REJECT'; reason: string | null },
): Promise<void> {
  const response = await fetch(
    `/api/v1/admin/verifications/${encodeURIComponent(id)}/review`,
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

export async function openVerificationEvidence(id: string): Promise<void> {
  const response = await fetch(
    `/api/v1/admin/verifications/${encodeURIComponent(id)}/evidence`,
    {
      credentials: 'include',
      headers: { Accept: 'image/jpeg,image/png,application/pdf' },
      cache: 'no-store',
    },
  );
  if (!response.ok) throw await problemFromResponse(response);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const extension =
    blob.type === 'application/pdf'
      ? 'pdf'
      : blob.type === 'image/png'
        ? 'png'
        : 'jpg';
  const link = document.createElement('a');
  link.href = url;
  link.download = `verification-evidence.${extension}`;
  link.rel = 'noopener noreferrer';
  try {
    link.click();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
