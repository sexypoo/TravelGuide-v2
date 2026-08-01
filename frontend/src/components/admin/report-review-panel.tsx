'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  reviewReport,
  type AdminReport,
  type ReportReviewDecision,
} from '@/lib/api/admin-reports';
import { actionableErrorMessage } from '@/lib/api/problem-details';

const decisionLabels: Record<ReportReviewDecision, string> = {
  KEEP: '콘텐츠 유지',
  REMOVE: '콘텐츠 숨김',
  DISMISS: '신고 기각',
};

export function ReportReviewPanel({
  report,
}: {
  report: AdminReport;
}): React.JSX.Element {
  const router = useRouter();
  const [decision, setDecision] = useState<ReportReviewDecision>();
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();

  async function confirm(): Promise<void> {
    if (decision === undefined) return;
    setPending(true);
    setMessage(undefined);
    try {
      await reviewReport(report.id, {
        decision,
        ...(note.trim().length === 0 ? {} : { note: note.trim() }),
      });
      setDecision(undefined);
      router.refresh();
    } catch (error: unknown) {
      setMessage(
        actionableErrorMessage(error, '신고 처리 결과를 저장하지 못했습니다.'),
      );
      setPending(false);
    }
  }

  return (
    <section className="reviewPanel reportReviewPanel" aria-label="신고 상세">
      <div className="reviewPanel__title">
        <div>
          <p>{report.targetType} REPORT</p>
          <h2>{report.target.author.nickname}</h2>
        </div>
        <span
          className={`adminStatus adminStatus--${report.status.toLowerCase()}`}
        >
          {report.status}
        </span>
      </div>
      <dl className="reviewFacts">
        <div>
          <dt>신고자</dt>
          <dd>{report.reporter.nickname}</dd>
        </div>
        <div>
          <dt>작성자</dt>
          <dd>{report.target.author.nickname}</dd>
        </div>
        <div>
          <dt>대상</dt>
          <dd>{report.targetType}</dd>
        </div>
        <div>
          <dt>사유</dt>
          <dd>{report.reason}</dd>
        </div>
      </dl>
      {report.target.content !== null && (
        <div className="reportedContent">
          <strong>신고된 원문</strong>
          <p>{report.target.content}</p>
          {report.target.removed && <span>현재 공개 화면에서 숨김 처리됨</span>}
        </div>
      )}
      {report.detail !== null && (
        <div className="reviewNote">
          <strong>신고 상세</strong>
          <p>{report.detail}</p>
        </div>
      )}
      {report.status === 'PENDING' ? (
        <div className="reviewActions reportReviewActions">
          <p>원문과 신고 사유를 비교한 뒤 한 가지 결정을 선택하세요.</p>
          {decision === undefined ? (
            <div>
              <button type="button" onClick={() => setDecision('KEEP')}>
                유지 검토
              </button>
              {report.targetType !== 'USER' && (
                <button type="button" onClick={() => setDecision('REMOVE')}>
                  숨김 검토
                </button>
              )}
              <button type="button" onClick={() => setDecision('DISMISS')}>
                기각 검토
              </button>
            </div>
          ) : (
            <div
              className={`reviewConfirm${decision === 'REMOVE' ? ' reviewConfirm--danger' : ''}`}
            >
              <strong>{decisionLabels[decision]}으로 처리할까요?</strong>
              <textarea
                rows={4}
                maxLength={300}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="처리 근거 메모 · 선택"
              />
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
                  {pending ? '처리 중…' : `${decisionLabels[decision]} 확정`}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="reviewComplete">
          {report.reviewedBy === null
            ? '처리 완료'
            : `${report.reviewedBy.nickname} 관리자가 처리함`}
          {report.resolutionNote !== null && <p>{report.resolutionNote}</p>}
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
