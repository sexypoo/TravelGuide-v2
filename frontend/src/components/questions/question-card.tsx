import Link from 'next/link';
import { participantBadgeLabel } from '@/lib/api/participants';
import type { Question } from '@/lib/api/questions';
import {
  categoryLabels,
  formatRelativeTime,
  statusLabels,
  urgencyLabels,
} from '@/lib/questions/presentation';
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
            {categoryLabels[question.category]}
            {question.urgency === 'URGENT' && (
              <span className={styles.urgent}>{urgencyLabels.URGENT}</span>
            )}
          </span>
          <span
            className={styles.status}
            data-status={question.status.toLowerCase()}
          >
            {statusLabels[question.status]}
          </span>
        </span>
        <span className={styles.content}>{question.content}</span>
        {question.areaText !== null && (
          <span className={styles.area}>{question.areaText}</span>
        )}
        {question.image !== null && (
          <span className={styles.evidence}>
            {/* Protected room media is served by the authenticated API route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.image.url}
              alt={`${question.areaText ?? '현장'} 토픽 첨부 사진`}
            />
            <span>현장 사진</span>
          </span>
        )}
        <span
          className={styles.meta}
          data-share={showShare ? 'true' : undefined}
        >
          <span>
            답변 <strong>{question.answerCount}</strong>
          </span>
          <time dateTime={question.createdAt}>
            {formatRelativeTime(question.createdAt)}
          </time>
          <span
            className={styles.author}
            aria-label={`${question.author.nickname} · ${participantBadgeLabel(question.author.badge)}`}
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
