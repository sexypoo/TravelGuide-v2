import Link from 'next/link';
import type { ChatMessage } from '@/lib/api/messages';
import { participantBadgeLabel } from '@/lib/api/participants';
import { formatChatTime } from '@/lib/questions/presentation';

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
    own && message.topicId === null && Array.from(message.content).length >= 20;
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
        <div className="chatBubble">
          <p>{message.content}</p>
        </div>
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
      </div>
    </article>
  );
}
