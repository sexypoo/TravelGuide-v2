'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  openVerificationEvidence,
  reviewVerification,
  type AdminVerification,
} from '@/lib/api/admin-verifications';
import { actionableErrorMessage } from '@/lib/api/problem-details';

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
    <section className="reviewPanel" aria-label="인증 신청 상세">
      <div className="reviewPanel__title">
        <div>
          <p>
            {verification.type === 'TRAVELER' ? '여행자 신청' : '현지인 신청'}
          </p>
          <h2>{verification.applicant.nickname}</h2>
        </div>
        <span
          className={`adminStatus adminStatus--${verification.status.toLowerCase()}`}
        >
          {verification.status}
        </span>
      </div>
      <dl className="reviewFacts">
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
              <dd>{verification.localProofType}</dd>
            </div>
            <div>
              <dt>GPS 요약</dt>
              <dd>
                {verification.gpsSummary === null
                  ? '—'
                  : `제주 내부 · 정확도 ${verification.gpsSummary.accuracyMeters}m`}
              </dd>
            </div>
          </>
        )}
      </dl>
      {verification.note !== null && (
        <div className="reviewNote">
          <strong>신청 메모</strong>
          <p>{verification.note}</p>
        </div>
      )}
      <button
        className="evidenceButton"
        type="button"
        onClick={() => void evidence()}
      >
        비공개 증빙 다운로드 ↓
      </button>
      {verification.status === 'PENDING' ? (
        <div className="reviewActions">
          <p>처리 후에는 되돌릴 수 없습니다.</p>
          {decision === undefined ? (
            <div>
              <button type="button" onClick={() => setDecision('APPROVE')}>
                승인 검토
              </button>
              <button type="button" onClick={() => setDecision('REJECT')}>
                반려 검토
              </button>
            </div>
          ) : (
            <div className="reviewConfirm">
              <strong>
                {decision === 'APPROVE'
                  ? '이 신청을 승인할까요?'
                  : '반려 사유를 확인해 주세요.'}
              </strong>
              {decision === 'REJECT' && (
                <textarea
                  rows={4}
                  maxLength={300}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="신청자에게 보일 사유를 10자 이상 입력"
                />
              )}
              <div>
                <button
                  type="button"
                  onClick={() => setDecision(undefined)}
                  disabled={pending}
                >
                  취소
                </button>
                <button
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
            </div>
          )}
        </div>
      ) : (
        <div className="reviewComplete">
          {verification.reviewedAt === null
            ? '처리 완료'
            : `${formatDate(verification.reviewedAt)} 처리됨`}
        </div>
      )}
      {message !== undefined && (
        <p className="adminMessage" role="alert">
          {message}
        </p>
      )}
    </section>
  );
}
