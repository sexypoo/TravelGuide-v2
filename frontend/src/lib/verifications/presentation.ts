import type { Verification, VerificationType } from '@/lib/api/verifications';

export interface QualificationPresentation {
  action: string;
  body: string;
  className?: string;
  href: string;
  title: string;
}

const labels: Readonly<Record<VerificationType, string>> = {
  TRAVELER: '여행자',
  LOCAL: '현지인',
};

export function getQualificationPresentation(
  verifications: readonly Verification[],
  type: VerificationType,
): QualificationPresentation {
  const approved = verifications.find(
    (verification) =>
      verification.type === type && verification.status === 'APPROVED',
  );
  if (approved !== undefined) {
    return {
      action: '인증 현황 보기',
      body: `${approved.destination.nameKo} 실시간 도움방에서 ${type === 'TRAVELER' ? '질문하고 현장 답변을 받을' : '현장 정보를 답변할'} 수 있어요.`,
      className: 'qualificationApproved',
      href: '/app/verifications',
      title: `${approved.destination.nameKo} ${labels[type]} 인증 완료`,
    };
  }

  const pending = verifications.find(
    (verification) =>
      verification.type === type && verification.status === 'PENDING',
  );
  if (pending !== undefined) {
    return {
      action: '인증 현황에서 확인',
      body: '같은 유형은 심사가 끝난 뒤 다시 신청할 수 있어요.',
      className: 'qualificationPending',
      href: '/app/verifications',
      title: `${labels[type]} 인증 심사 중`,
    };
  }

  return type === 'TRAVELER'
    ? {
        action: '여행자 인증 시작',
        body: '여행 일정과 증빙을 준비해 질문할 수 있어요.',
        href: '/app/verifications/traveler',
        title: '제주를 여행 중인가요?',
      }
    : {
        action: '현지인 인증 시작',
        body: '현재 위치와 거주 증빙을 준비해 답변할 수 있어요.',
        href: '/app/verifications/local',
        title: '제주에 살고 있나요?',
      };
}
