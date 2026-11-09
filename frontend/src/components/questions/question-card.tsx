import Link from 'next/link';
import { useLocale, useMessages } from '@/i18n/client';
import { participantBadgeLabel } from '@/lib/api/participants';
import type { Question } from '@/lib/api/questions';
import { formatRelativeTime } from '@/lib/questions/presentation';
import { TopicShareButton } from './topic-share-button';
import styles from './question-card.module.css';

export function QuestionCard({
  question,
  roomSlug,
  canShare = false,
}: {
  question: Question;
  roomSlug?: string;
  canShare?: boolean;
}): React.JSX.Element {
  const t = useMessages();
  const locale = useLocale();
  const labels = t.topics.labels;
  const showShare = canShare && roomSlug && question.status !== 'REMOVED';
  return (
    <article
      className={styles.card}
      data-status={question.status.toLowerCase()}
      data-urgent={question.urgency === 'URGENT' ? 'true' : undefined}
    >
      <Link className={styles.link} href={`/app/questions/${question.id}`}>
        <span className={styles.lead}>
          <span className={styles.category}>
            {labels.category[question.category]}
            {question.urgency === 'URGENT' && (
              <span className={styles.urgent}>{labels.urgency.URGENT}</span>
            )}
          </span>
          <span
            className={styles.status}
            data-status={question.status.toLowerCase()}
          >
            {labels.status[question.status]}
          </span>
        </span>
        <span className={styles.content}>
          {question.status === 'REMOVED'
            ? t.topics.hidden.topic
            : question.content}
        </span>
        {question.areaText !== null && (
          <span className={styles.area}>{question.areaText}</span>
        )}
        {question.image !== null && (
          <span className={styles.evidence}>
            {/* Protected room media is served by the authenticated API route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.image.url}
              alt={t.topics.shared.photoAlt(question.areaText)}
            />
            <span>{t.topics.shared.photo}</span>
          </span>
        )}
        <span
          className={styles.meta}
          data-share={showShare ? 'true' : undefined}
        >
          <span>
            {t.topics.card.answers} <strong>{question.answerCount}</strong>
          </span>
          <time dateTime={question.createdAt}>
            {formatRelativeTime(question.createdAt, undefined, locale)}
          </time>
          <span
            className={styles.author}
            aria-label={`${question.author.nickname} · ${participantBadgeLabel(question.author.badge, locale)}`}
          >
            {question.author.nickname}
          </span>
        </span>
      </Link>
      {showShare && (
        <div className={styles.share}>
          <TopicShareButton roomSlug={roomSlug} questionId={question.id} />
        </div>
      )}
    </article>
  );
}
