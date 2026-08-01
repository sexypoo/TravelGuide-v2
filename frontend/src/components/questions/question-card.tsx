import Link from 'next/link';
import { participantBadgeLabel } from '@/lib/api/participants';
import type { Question } from '@/lib/api/questions';
import {
  categoryLabels,
  formatDateTime,
  statusLabels,
  urgencyLabels,
} from '@/lib/questions/presentation';
import { TopicShareButton } from './topic-share-button';

export function QuestionCard({
  question,
  roomSlug,
  canShare = false,
}: {
  question: Question;
  roomSlug?: string;
  canShare?: boolean;
}): React.JSX.Element {
  const badgeKind =
    question.author.badge === 'VERIFIED_LOCAL'
      ? 'local'
      : question.author.badge === 'VERIFIED_BOTH'
        ? 'both'
        : 'traveler';
  return (
    <article
      className={`signalQuestionCard${question.urgency === 'URGENT' ? ' signalQuestionCard--urgent' : ''}`}
    >
      <span className="signalQuestionCard__node" aria-hidden="true" />
      <Link href={`/app/questions/${question.id}`}>
        <div className="questionMetaRow">
          <span className="questionCategory">
            {categoryLabels[question.category]}
          </span>
          <span
            className={`questionUrgency questionUrgency--${question.urgency.toLowerCase()}`}
          >
            {urgencyLabels[question.urgency]}
          </span>
          <span
            className={`questionStatus questionStatus--${question.status.toLowerCase()}`}
          >
            {statusLabels[question.status]}
          </span>
        </div>
        <p className="questionCardContent">{question.content}</p>
        {question.areaText !== null && (
          <span className="questionArea">⌖ {question.areaText}</span>
        )}
        {question.image !== null && (
          <div className="questionCardEvidence">
            {/* Protected room media is served by the authenticated API route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.image.url}
              alt={`${question.areaText ?? '현장'} 토픽 첨부 사진`}
            />
            <span>현장 사진</span>
          </div>
        )}
        <footer className="questionCardFooter">
          <span className={`publicBadge publicBadge--${badgeKind}`}>
            <span aria-hidden="true">↗</span>
            {question.author.nickname} ·{' '}
            {participantBadgeLabel(question.author.badge)}
          </span>
          <span>
            답변 {question.answerCount} · {formatDateTime(question.createdAt)}
          </span>
        </footer>
      </Link>
      {canShare && roomSlug && question.status !== 'REMOVED' && (
        <TopicShareButton roomSlug={roomSlug} questionId={question.id} />
      )}
    </article>
  );
}
