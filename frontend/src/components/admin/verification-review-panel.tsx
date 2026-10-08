'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  openVerificationEvidence,
  reviewVerification,
  type AdminVerification,
} from '@/lib/api/admin-verifications';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import {
  localProofTypeLabels,
  verificationStatusLabels,
  verificationStatusTones,
  verificationTypeLabels,
} from './admin-labels';
import styles from './admin.module.css';

function formatDate(value: string | null): string {
  return value === null
    ? '—'
    : new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value));
}

export function VerificationReviewPanel({
  verification,
}: {
  verification: AdminVerification;
}): React.JSX.Element {
  const router = useRouter();
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>();
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();

  async function evidence(): Promise<void> {
    setMessage(undefined);
    try {
      await openVerificationEvidence(verification.id);
    } catch (error: unknown) {
      setMessage(actionableErrorMessage(error, '증빙을 열지 못했습니다.'));
    }
  }

  async function confirm(): Promise<void> {
    if (decision === undefined) return;
    if (decision === 'REJECT' && reason.trim().length < 10) {
      setMessage('반려 사유를 10자 이상 입력해 주세요.');
      return;
    }
    setPending(true);
    setMessage(undefined);
    try {
      await reviewVerification(verification.id, {
        decision,
        reason: decision === 'REJECT' ? reason.trim() : null,
      });
      setDecision(undefined);
      router.refresh();
    } catch (error: unknown) {
      setMessage(
        actionableErrorMessage(error, '심사 결과를 저장하지 못했습니다.'),
      );
      setPending(false);
    }
  }

  return (
    <section className={styles.panel} aria-label="인증 신청 상세">
      <header className={styles.panelTitle}>
        <p>{verificationTypeLabels[verification.type]} 신청</p>
        <h2>{verification.applicant.nickname}</h2>
        <span
          className={styles.status}
          data-tone={verificationStatusTones[verification.status]}
        >
          {verificationStatusLabels[verification.status]}
        </span>
      </header>
      <dl className={styles.facts}>
        <div>
          <dt>여행지</dt>
          <dd>{verification.destination.nameKo}</dd>
        </div>
        <div>
          <dt>제출 시각</dt>
          <dd>{formatDate(verification.createdAt)}</dd>
        </div>
        {verification.type === 'TRAVELER' ? (
          <>
            <div>
              <dt>여행 시작</dt>
              <dd>{formatDate(verification.startsAt)}</dd>
            </div>
            <div>
              <dt>여행 종료</dt>
              <dd>{formatDate(verification.endsAt)}</dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt>연고 유형</dt>
              <dd>
                {verification.localProofType === null
                  ? '—'
                  : localProofTypeLabels[verification.localProofType]}
              </dd>
            </div>
            <div>
              <dt>위치 확인</dt>
              <dd>
                {verification.gpsSummary === null
                  ? '—'
                  : `${verification.destination.nameKo} 안, 정확도 ${verification.gpsSummary.accuracyMeters}m`}
              </dd>
            </div>
          </>
        )}
      </dl>
      {verification.note !== null && (
        <div className={styles.block}>
          <strong>신청 메모</strong>
          <p>{verification.note}</p>
        </div>
      )}
      <div>
        <button
          className={styles.button}
          type="button"
          onClick={() => void evidence()}
        >
          비공개 증빙 다운로드
        </button>
      </div>
      {verification.status === 'PENDING' ? (
        <div className={styles.decision}>
          <p>처리 후에는 되돌릴 수 없습니다.</p>
          {decision === undefined ? (
            <div className={styles.actions}>
              <button
                className={styles.button}
                type="button"
                onClick={() => setDecision('APPROVE')}
              >
                승인 검토
              </button>
              <button
                className={styles.button}
                type="button"
                onClick={() => setDecision('REJECT')}
              >
                반려 검토
              </button>
            </div>
          ) : (
            <>
              <strong>
                {decision === 'APPROVE'
                  ? '이 신청을 승인할까요?'
                  : '반려 사유를 확인해 주세요.'}
              </strong>
              {decision === 'REJECT' && (
                <textarea
                  className={styles.textarea}
                  rows={4}
                  maxLength={300}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="신청자에게 보일 사유를 10자 이상 입력해 주세요."
                  aria-label="반려 사유"
                />
              )}
              <div className={styles.confirmActions}>
                <button
                  className={styles.cancel}
                  type="button"
                  onClick={() => setDecision(undefined)}
                  disabled={pending}
                >
                  취소
                </button>
                <button
                  className={
                    decision === 'APPROVE'
                      ? styles.confirm
                      : styles.confirmDanger
                  }
                  type="button"
                  onClick={() => void confirm()}
                  disabled={pending}
                >
                  {pending
                    ? '처리 중…'
                    : decision === 'APPROVE'
                      ? '승인 확정'
                      : '반려 확정'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <p className={styles.done}>
          {verification.reviewedAt === null
            ? '처리 완료'
            : `${formatDate(verification.reviewedAt)} 처리됨`}
        </p>
      )}
      {message !== undefined && (
        <p className={styles.message} role="alert">
          {message}
        </p>
      )}
    </section>
  );
}
