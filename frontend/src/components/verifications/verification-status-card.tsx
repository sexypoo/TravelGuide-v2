import Link from 'next/link';
import type { Verification, VerificationStatus } from '@/lib/api/verifications';
import styles from './verification.module.css';

const labels = {
  PENDING: '심사 중',
  APPROVED: '승인 완료',
  REJECTED: '반려됨',
  REVOKED: '자격 회수',
  EXPIRED: '기간 만료',
} as const;

const tones: Readonly<Record<VerificationStatus, string>> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVOKED: 'inactive',
  EXPIRED: 'inactive',
};

type StepState = 'done' | 'current' | 'upcoming';

function date(value: string | null): string | null {
  if (value === null) return null;
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

function steps(
  status: VerificationStatus,
): ReadonlyArray<{ label: string; state: StepState }> {
  return [
    { label: '제출', state: 'done' },
    { label: '심사', state: status === 'PENDING' ? 'current' : 'done' },
    { label: '참여', state: status === 'APPROVED' ? 'done' : 'upcoming' },
  ];
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
    <article className={styles.status} data-status={verification.status}>
      <h3>
        {verification.destination.nameKo} {isTraveler ? '여행자' : '현지인'}{' '}
        인증
      </h3>
      <strong
        className={styles.statusLabel}
        data-tone={tones[verification.status]}
      >
        {labels[verification.status]}
      </strong>
      <p className={styles.validity}>{validity}</p>
      <ol className={styles.progress} aria-label="인증 진행 상태">
        {steps(verification.status).map((step) => (
          <li
            key={step.label}
            data-state={step.state}
            aria-current={step.state === 'current' ? 'step' : undefined}
          >
            <span aria-hidden="true" />
            {step.label}
          </li>
        ))}
      </ol>
      {verification.status === 'REJECTED' &&
        verification.rejectionReason !== null && (
          <div className={styles.reason}>
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
        <p className={styles.support}>자격 관련 문의는 운영팀에 알려 주세요.</p>
      )}
    </article>
  );
}
