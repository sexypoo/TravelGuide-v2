import Link from 'next/link';
import type { Verification } from '@/lib/api/verifications';

const labels = {
  PENDING: '심사 중',
  APPROVED: '승인 완료',
  REJECTED: '반려됨',
  REVOKED: '자격 회수',
  EXPIRED: '기간 만료',
} as const;

function date(value: string | null): string | null {
  if (value === null) return null;
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

export function VerificationStatusCard({
  verification,
}: {
  verification: Verification;
}): React.JSX.Element {
  const isTraveler = verification.type === 'TRAVELER';
  const validity = isTraveler
    ? `${date(verification.startsAt)} – ${date(verification.endsAt)}`
    : verification.expiresAt === null
      ? '승인 후 90일 동안 유효'
      : `${date(verification.expiresAt)}까지 유효`;

  return (
    <article
      className={`verificationPass verificationPass--${verification.status.toLowerCase()}`}
    >
      <div className="verificationPass__edge" aria-hidden="true" />
      <div className="verificationPass__top">
        <span>{isTraveler ? 'TRAVELER PASS' : 'LOCAL PASS'}</span>
        <strong>{labels[verification.status]}</strong>
      </div>
      <h2>
        {verification.destination.nameKo} {isTraveler ? '여행자' : '현지인'}{' '}
        인증
      </h2>
      <p>{validity}</p>
      <ol aria-label="인증 진행 상태">
        <li className="isDone">제출</li>
        <li
          className={verification.status !== 'PENDING' ? 'isDone' : 'isCurrent'}
        >
          심사
        </li>
        <li
          className={verification.status === 'APPROVED' ? 'isDone' : undefined}
        >
          참여
        </li>
      </ol>
      {verification.status === 'REJECTED' &&
        verification.rejectionReason !== null && (
          <div className="verificationPass__reason">
            <strong>다시 확인할 내용</strong>
            <p>{verification.rejectionReason}</p>
            <Link
              href={`/app/verifications/${isTraveler ? 'traveler' : 'local'}`}
            >
              새로 신청하기
            </Link>
          </div>
        )}
      {verification.status === 'REVOKED' && (
        <p className="verificationPass__support">
          자격 관련 문의는 운영팀에 알려 주세요.
        </p>
      )}
    </article>
  );
}
