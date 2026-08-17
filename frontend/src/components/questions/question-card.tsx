import Link from 'next/link';
import { AppIcon } from '@/components/common';
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
      <Link href={`/app/questions/${question.id}`}>
        <div className="questionMetaRow">
          <span
            className={`questionStatus questionStatus--${question.status.toLowerCase()}`}
          >
            <i aria-hidden="true" />
            {statusLabels[question.status]}
          </span>
          <span className="questionAnswerCount">
            답변 <strong>{question.answerCount}</strong>
          </span>
        </div>
        <div className="questionContextRow">
          <span className="questionCategory">
            {categoryLabels[question.category]}
          </span>
          <span aria-hidden="true">·</span>
          <span
            className={`questionUrgency questionUrgency--${question.urgency.toLowerCase()}`}
          >
            {urgencyLabels[question.urgency]}
          </span>
        </div>
        <p className="questionCardContent">{question.content}</p>
        {question.areaText !== null && (
          <span className="questionArea">
            <AppIcon name="pin" /> {question.areaText}
          </span>
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
            {question.author.nickname} ·{' '}
            {participantBadgeLabel(question.author.badge)}
          </span>
          <time dateTime={question.createdAt}>
            {formatDateTime(question.createdAt)}
          </time>
        </footer>
      </Link>
      {canShare && roomSlug && question.status !== 'REMOVED' && (
        <TopicShareButton roomSlug={roomSlug} questionId={question.id} />
      )}
    </article>
  );
}
