import Link from 'next/link';
import type { ChatMessage } from '@/lib/api/messages';
import { participantBadgeLabel } from '@/lib/api/participants';
import { formatChatTime } from '@/lib/questions/presentation';
import { categoryLabels, statusLabels } from '@/lib/questions/presentation';
import { ReportMenu } from '@/components/reports/report-menu';

export function MessageCard({
  message,
  own,
  onPromote,
}: {
  message: ChatMessage;
  own: boolean;
  onPromote: (message: ChatMessage) => void;
}): React.JSX.Element {
  const canPromote =
    message.type === 'TEXT' &&
    own &&
    message.topicId === null &&
    Array.from(message.content).length >= 20;
  const badgeKind =
    message.author.badge === 'VERIFIED_LOCAL'
      ? 'local'
      : message.author.badge === 'VERIFIED_BOTH'
        ? 'both'
        : 'traveler';

  return (
    <article className={`chatMessage${own ? ' chatMessage--own' : ''}`}>
      {!own && (
        <span className="chatMessage__avatar" aria-hidden="true">
          {Array.from(message.author.nickname)[0] ?? '제'}
        </span>
      )}
      <div className="chatMessage__body">
        <header>
          <strong>{own ? '나' : message.author.nickname}</strong>
          <span className={`miniVerifiedBadge miniVerifiedBadge--${badgeKind}`}>
            {participantBadgeLabel(message.author.badge)}
          </span>
          <time dateTime={message.createdAt}>
            {formatChatTime(message.createdAt)}
          </time>
        </header>
        {message.removed ? (
          <div className="chatBubble chatBubble--removed">
            <p>{message.content}</p>
          </div>
        ) : message.type === 'IMAGE' && message.image !== null ? (
          <div className="chatBubble chatBubble--image">
            {/* Protected room media is intentionally loaded from the authenticated API route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.image.url}
              alt={message.content || message.image.originalName}
            />
            {message.content && <p>{message.content}</p>}
          </div>
        ) : message.type === 'PLACE' && message.place !== null ? (
          <div className="chatBubble chatBubble--place">
            <span className="placeMessageIcon" aria-hidden="true">
              ⌖
            </span>
            <div>
              <small>공유된 장소</small>
              <strong>{message.place.name}</strong>
              {message.place.address && <span>{message.place.address}</span>}
              {message.content && <p>{message.content}</p>}
              <a
                href={`https://maps.google.com/?q=${message.place.latitude},${message.place.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                지도에서 보기 ↗
              </a>
            </div>
          </div>
        ) : message.type === 'TOPIC_SHARE' && message.sharedTopic !== null ? (
          <Link
            className="chatBubble chatBubble--topic"
            href={`/app/questions/${message.sharedTopic.id}`}
          >
            <span className="sharedTopicEyebrow">
              LIVE TOPIC · {categoryLabels[message.sharedTopic.category]}
            </span>
            <strong>{message.sharedTopic.content}</strong>
            {message.sharedTopic.areaText && (
              <span>⌖ {message.sharedTopic.areaText}</span>
            )}
            <footer>
              <span>
                {statusLabels[message.sharedTopic.status]} · 답변{' '}
                {message.sharedTopic.answerCount}
              </span>
              <b>자세히 보기 →</b>
            </footer>
          </Link>
        ) : (
          <div className="chatBubble">
            <p>{message.content}</p>
          </div>
        )}
        {message.topicId !== null ? (
          <Link
            className="messageTopicLink"
            href={`/app/questions/${message.topicId}`}
          >
            <span aria-hidden="true" /> 토픽으로 이어짐
          </Link>
        ) : canPromote ? (
          <button
            className="messagePromoteButton"
            type="button"
            onClick={() => onPromote(message)}
          >
            이 메시지를 토픽으로 만들기
          </button>
        ) : null}
        {!own && !message.removed && (
          <ReportMenu
            targets={[
              { type: 'MESSAGE', id: message.id, label: '이 메시지' },
              {
                type: 'USER',
                id: message.author.id,
                label: `${message.author.nickname} 사용자`,
              },
            ]}
          />
        )}
      </div>
    </article>
  );
}
