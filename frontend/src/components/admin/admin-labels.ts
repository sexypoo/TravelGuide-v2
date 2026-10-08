import type { ReportStatus } from '@/lib/api/admin-reports';
import type { ReportTargetType } from '@/lib/api/reports';
import type {
  LocalProofType,
  VerificationStatus,
  VerificationType,
} from '@/lib/api/verifications';

export const verificationStatusLabels: Readonly<
  Record<VerificationStatus, string>
> = {
  PENDING: '심사 중',
  APPROVED: '승인',
  REJECTED: '반려',
  REVOKED: '자격 회수',
  EXPIRED: '기간 만료',
};

export const verificationTypeLabels: Readonly<
  Record<VerificationType, string>
> = {
  TRAVELER: '여행자',
  LOCAL: '현지인',
};

export const localProofTypeLabels: Readonly<Record<LocalProofType, string>> = {
  RESIDENCE: '거주',
  WORK: '근무',
  STUDY: '학업',
  OTHER: '기타',
};

export const reportStatusLabels: Readonly<Record<ReportStatus, string>> = {
  PENDING: '대기',
  REVIEWED: '유지',
  RESOLVED: '숨김 완료',
  DISMISSED: '기각',
};

export const reportTargetLabels: Readonly<Record<ReportTargetType, string>> = {
  MESSAGE: '채팅 메시지',
  QUESTION: '토픽',
  ANSWER: '답변',
  COMMUNITY_POST: '커뮤니티 글',
  COMMUNITY_COMMENT: '커뮤니티 댓글',
  USER: '사용자',
};

export type StatusTone = 'pending' | 'positive' | 'negative' | 'neutral';

export const verificationStatusTones: Readonly<
  Record<VerificationStatus, StatusTone>
> = {
  PENDING: 'pending',
  APPROVED: 'positive',
  REJECTED: 'negative',
  REVOKED: 'neutral',
  EXPIRED: 'neutral',
};

export const reportStatusTones: Readonly<Record<ReportStatus, StatusTone>> = {
  PENDING: 'pending',
  REVIEWED: 'neutral',
  RESOLVED: 'negative',
  DISMISSED: 'neutral',
};
