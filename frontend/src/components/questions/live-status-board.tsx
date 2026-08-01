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

  return (
    <section className="liveStatusBoard" aria-labelledby="live-status-title">
      <header>
        <span className="liveStatusClock" aria-hidden="true">
          ◷
        </span>
        <div>
          <p>현장 답변을 종합한 최신 정보</p>
          <h2 id="live-status-title">{headline}</h2>
          <span>
            현장 확인 {summary.responseCount}명 중{' '}
            <strong>{summary.agreementCount}명</strong> 의견이 비슷해요 · 마지막
            확인 {formatDateTime(summary.lastObservedAt)}
          </span>
        </div>
      </header>
      <p className="liveStatusDescription">{summary.description}</p>
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
        <span>⌁ 실시간</span>
        <span>✓ 현장 답변 기반</span>
        <span>사진 답변은 채팅에서 공유할 수 있어요</span>
      </footer>
    </section>
  );
}
