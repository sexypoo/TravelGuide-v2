import Link from 'next/link';
import type { ChatMessage } from '@/lib/api/messages';
import { participantBadgeLabel } from '@/lib/api/participants';
import { formatChatTime } from '@/lib/questions/presentation';
import {
  categoryLabels,
  statusLabels,
  urgencyLabels,
} from '@/lib/questions/presentation';
import { ReportMenu } from '@/components/reports/report-menu';
import { PlaceFavoriteButton } from '@/components/places/place-favorite-button';
import { AppIcon } from '@/components/common';

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
  const placeMapUrl =
    message.place === null
      ? ''
      : message.place.googlePlaceId === null
        ? `https://www.google.com/maps/search/?api=1&query=${message.place.latitude},${message.place.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(message.place.name)}&query_place_id=${encodeURIComponent(message.place.googlePlaceId)}`;

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
          <div className="chatBubble chatBubble--place placeTicket">
            <div className="placeTicket__rail" aria-hidden="true">
              <span>
                <AppIcon name="pin" />
              </span>
              <i />
            </div>
            <div className="placeTicket__content">
              <header className="placeTicket__eyebrow">
                <span>PLACE</span>
                <small>공유된 장소</small>
              </header>
              <strong className="placeTicket__name">
                {message.place.name}
              </strong>
              {message.place.address && (
                <span className="placeTicket__address">
                  {message.place.address}
                </span>
              )}
              {message.content && (
                <p className="placeTicket__note">“{message.content}”</p>
              )}
              <span className="placeMessageActions placeTicket__actions">
                <a href={placeMapUrl} target="_blank" rel="noopener noreferrer">
                  지도 보기 <AppIcon name="external" />
                </a>
                <PlaceFavoriteButton
                  messageId={message.id}
                  placeName={message.place.name}
                />
              </span>
            </div>
          </div>
        ) : message.type === 'TOPIC_SHARE' && message.sharedTopic !== null ? (
          <Link
            className="chatBubble chatBubble--topic"
            href={`/app/questions/${message.sharedTopic.id}`}
          >
            <header className="sharedTopicHeader">
              <span className="sharedTopicCategory">
                <i aria-hidden="true" />
                {categoryLabels[message.sharedTopic.category]}
              </span>
              <span
                className={`sharedTopicStatus sharedTopicStatus--${message.sharedTopic.status.toLowerCase()}`}
              >
                {statusLabels[message.sharedTopic.status]}
              </span>
            </header>
            <strong>{message.sharedTopic.content}</strong>
            {message.sharedTopic.areaText && (
              <span className="sharedTopicPlace">
                <AppIcon name="pin" />
                {message.sharedTopic.areaText}
              </span>
            )}
            <div className="sharedTopicMeta">
              <span>
                <small>도착한 답변</small>
                <b>{message.sharedTopic.answerCount}개</b>
              </span>
              <span>
                <small>답변 요청</small>
                <b>{urgencyLabels[message.sharedTopic.urgency]}</b>
              </span>
            </div>
            <footer>
              <span>현장 답변과 최신 현황 보기</span>
              <b aria-hidden="true">
                <AppIcon name="arrow-right" />
              </b>
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
