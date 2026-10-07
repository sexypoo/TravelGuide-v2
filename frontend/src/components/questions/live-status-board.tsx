import type { QuestionDetail } from '@/lib/api/questions';
import {
  crowdLabels,
  entryLabels,
  formatDateTime,
} from '@/lib/questions/presentation';
import styles from './live-status-board.module.css';

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
      className={styles.board}
      data-freshness={stale ? 'stale' : 'live'}
      aria-labelledby="live-status-title"
    >
      <div className={styles.state}>
        <span className={styles.dot} aria-hidden="true" />
        {stale ? '지난 현장 정보' : '실시간 현장 정보'} ·{' '}
        {formatDateTime(summary.lastObservedAt)} 확인
      </div>
      <h2 id="live-status-title" className={styles.headline}>
        {headline}
      </h2>
      <div className={styles.description}>{summary.description}</div>
      <div className={styles.agreement}>
        현장 확인 {summary.responseCount}명 중{' '}
        <strong>{summary.agreementCount}명</strong>의 의견이 비슷해요
      </div>
      {stale && (
        <div className={styles.staleNotice} role="status">
          <strong>30분 이상 새 확인이 없어요.</strong> 아래 답변에서 지금 상태를
          새로 알려주세요.
        </div>
      )}
      <dl className={styles.facts}>
        {wait === null && (
          <div>
            <dt>현재 대기</dt>
            <dd>확인 중</dd>
          </div>
        )}
        <div>
          <dt>현장 혼잡</dt>
          <dd>
            {summary.crowdLevel ? crowdLabels[summary.crowdLevel] : '확인 중'}
          </dd>
        </div>
        <div>
          <dt>입장 상태</dt>
          <dd>
            {summary.entryStatus ? entryLabels[summary.entryStatus] : '확인 중'}
          </dd>
        </div>
        <div>
          <dt>다시 확인</dt>
          <dd>{formatDateTime(summary.recommendedRecheckAt)}</dd>
        </div>
      </dl>
    </section>
  );
}
