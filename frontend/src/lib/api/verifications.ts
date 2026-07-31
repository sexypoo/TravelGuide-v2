import { problemFromResponse } from './problem-details';

export type VerificationType = 'TRAVELER' | 'LOCAL';
export type VerificationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVOKED'
  | 'EXPIRED';
export type LocalProofType = 'RESIDENCE' | 'WORK' | 'STUDY' | 'OTHER';

export interface Verification {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function parseVerification(value: unknown): Verification {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !isRecord(value.destination) ||
    typeof value.destination.id !== 'string' ||
    typeof value.destination.slug !== 'string' ||
    typeof value.destination.nameKo !== 'string' ||
    (value.type !== 'TRAVELER' && value.type !== 'LOCAL') ||
    !['PENDING', 'APPROVED', 'REJECTED', 'REVOKED', 'EXPIRED'].includes(
      String(value.status),
    ) ||
    !optionalString(value.startsAt) ||
    !optionalString(value.endsAt) ||
    !optionalString(value.note) ||
    !optionalString(value.reviewedAt) ||
    !optionalString(value.rejectionReason) ||
    !optionalString(value.expiresAt) ||
    typeof value.createdAt !== 'string' ||
    (value.localProofType !== null &&
      !['RESIDENCE', 'WORK', 'STUDY', 'OTHER'].includes(
        String(value.localProofType),
      ))
  ) {
    throw new Error('인증 정보 형식이 올바르지 않습니다.');
  }

  return {
    id: value.id,
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
    note: value.note,
    reviewedAt: value.reviewedAt,
    rejectionReason: value.rejectionReason,
    expiresAt: value.expiresAt,
    createdAt: value.createdAt,
  };
}

export function parseVerifications(value: unknown): Verification[] {
  if (!Array.isArray(value)) {
    throw new Error('인증 목록 형식이 올바르지 않습니다.');
  }
  return value.map(parseVerification);
}

async function submit(
  path: 'traveler' | 'local',
  data: FormData,
): Promise<void> {
  const response = await fetch(`/api/v1/verifications/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    body: data,
  });
  if (!response.ok) {
    throw await problemFromResponse(response);
  }
}

export function submitTravelerVerification(data: FormData): Promise<void> {
  return submit('traveler', data);
}

export function submitLocalVerification(data: FormData): Promise<void> {
  return submit('local', data);
}
