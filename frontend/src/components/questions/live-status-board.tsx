import { useLocale, useMessages } from '@/i18n/client';
import type { QuestionDetail } from '@/lib/api/questions';
import { formatDateTime } from '@/lib/questions/presentation';
import styles from './live-status-board.module.css';

export function LiveStatusBoard({
  question,
}: {
  question: QuestionDetail;
}): React.JSX.Element | null {
  const messages = useMessages();
  const locale = useLocale();
  const t = messages.topics.live;
  const labels = messages.topics.labels;
  const summary = question.liveSummary;
  if (summary === null) return null;
  const wait = summary.waitMinutes;
  const headline = wait ? t.headlineWait(wait.min, wait.max) : t.headlineUpdate;
  const stale = summary.freshness === 'STALE';

  return (
    <section
      className={styles.board}
      data-freshness={stale ? 'stale' : 'live'}
      aria-labelledby="live-status-title"
    >
      <div className={styles.state}>
        <span className={styles.dot} aria-hidden="true" />
        {stale ? t.stale : t.live} ·{' '}
        {messages.topics.shared.checkedAt(
          formatDateTime(summary.lastObservedAt, locale),
        )}
      </div>
      <h2 id="live-status-title" className={styles.headline}>
        {headline}
      </h2>
      <div className={styles.agreement}>
        {t.agreementBefore(summary.responseCount)}
        <strong>{t.agreementCount(summary.agreementCount)}</strong>
        {t.agreementAfter(summary.responseCount)}
      </div>
      {stale && (
        <div className={styles.staleNotice} role="status">
          <strong>{t.staleStrong}</strong>
          {t.staleRest}
        </div>
      )}
      <dl className={styles.facts}>
        {wait === null && (
          <div>
            <dt>{t.currentWait}</dt>
            <dd>{t.checking}</dd>
          </div>
        )}
        <div>
          <dt>{t.crowd}</dt>
          <dd>
            {summary.crowdLevel ? labels.crowd[summary.crowdLevel] : t.checking}
          </dd>
        </div>
        <div>
          <dt>{t.entry}</dt>
          <dd>
            {summary.entryStatus
              ? labels.entry[summary.entryStatus]
              : t.checking}
          </dd>
        </div>
        <div>
          <dt>{t.recheck}</dt>
          <dd>{formatDateTime(summary.recommendedRecheckAt, locale)}</dd>
        </div>
      </dl>
    </section>
  );
}
