import type { QuestionDetail } from '@/lib/api/questions';
import {
  crowdLabels,
  entryLabels,
  formatDateTime,
} from '@/lib/questions/presentation';

export function LiveStatusBoard({
  question,
}: {
  question: QuestionDetail;
}): React.JSX.Element | null {
  const summary = question.liveSummary;
  if (summary === null) return null;
  const wait = summary.waitMinutes;
  const headline = wait
    ? `대기 ${wait.min}~${wait.max}분`
    : '현장 상태 업데이트';
  const stale = summary.freshness === 'STALE';

  return (
    <section
      className={`liveStatusBoard${stale ? ' liveStatusBoard--stale' : ''}`}
      aria-labelledby="live-status-title"
    >
      <header>
        <span className="liveStatusClock" aria-hidden="true">
          ◷
        </span>
        <div>
          <p>
            {stale
              ? '마지막 현장 정보 · 업데이트 필요'
              : '현장 답변을 종합한 최신 정보'}
          </p>
          <h2 id="live-status-title">{headline}</h2>
          <span>
            현장 확인 {summary.responseCount}명 중{' '}
            <strong>{summary.agreementCount}명</strong> 의견이 비슷해요 · 마지막
            확인 {formatDateTime(summary.lastObservedAt)}
          </span>
        </div>
      </header>
      <p className="liveStatusDescription">{summary.description}</p>
      {stale && (
        <div className="liveStatusStaleNotice" role="status">
          <strong>30분 이상 새 확인이 없어요</strong>
          <span>아래 답변에서 지금 상태를 새로 알려주세요.</span>
        </div>
      )}
      <div className="liveStatusMetrics">
        <div>
          <span aria-hidden="true">♟</span>
          <small>현재 대기</small>
          <strong>{wait ? `${wait.min}~${wait.max}분` : '확인 중'}</strong>
        </div>
        <div>
          <span aria-hidden="true">●●●</span>
          <small>현장 혼잡</small>
          <strong>
            {summary.crowdLevel ? crowdLabels[summary.crowdLevel] : '확인 중'}
          </strong>
        </div>
        <div>
          <span aria-hidden="true">▯</span>
          <small>입장 상태</small>
          <strong>
            {summary.entryStatus ? entryLabels[summary.entryStatus] : '확인 중'}
          </strong>
        </div>
        <div>
          <span aria-hidden="true">↻</span>
          <small>다시 확인</small>
          <strong>{formatDateTime(summary.recommendedRecheckAt)}</strong>
        </div>
      </div>
      <footer>
        <span>{stale ? '◷ 지난 정보' : '⌁ 실시간'}</span>
        <span>✓ 현장 답변 기반</span>
        <span>답변에 현장 사진을 바로 첨부할 수 있어요</span>
      </footer>
    </section>
  );
}
