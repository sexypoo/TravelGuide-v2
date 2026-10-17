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
import styles from './messages.module.css';

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
    <article className={`${styles.message}${own ? ` ${styles.own}` : ''}`}>
      {!own && (
        <span
          className={`${styles.avatar} ${styles[`avatar--${badgeKind}`]}`}
          aria-hidden="true"
        >
          {Array.from(message.author.nickname)[0] ?? '제'}
        </span>
      )}
      <div className={styles.body}>
        <header className={styles.meta}>
          <strong>{own ? '나' : message.author.nickname}</strong>
          <span className={`${styles.badge} ${styles[`badge--${badgeKind}`]}`}>
            {participantBadgeLabel(message.author.badge)}
          </span>
          <time dateTime={message.createdAt}>
            {formatChatTime(message.createdAt)}
          </time>
        </header>
        {message.removed ? (
          <div className={`${styles.bubble} ${styles.removed}`}>
            <p>{message.content}</p>
          </div>
        ) : message.type === 'IMAGE' && message.image !== null ? (
          <div className={`${styles.bubble} ${styles.image}`}>
            {/* Protected room media is intentionally loaded from the authenticated API route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.image.url}
              alt={message.content || message.image.originalName}
            />
            {message.content && message.content !== '사진을 공유했습니다.' && (
              <p>{message.content}</p>
            )}
          </div>
        ) : message.type === 'PLACE' && message.place !== null ? (
          <div className={styles.attachment}>
            <div className={styles.attachmentKind}>
              <span>
                <AppIcon name="pin" />
                장소 추천
              </span>
            </div>
            <strong className={styles.attachmentTitle}>
              {message.place.name}
            </strong>
            {message.place.address && (
              <span className={styles.attachmentText}>
                {message.place.address}
              </span>
            )}
            {message.content && (
              <p className={styles.attachmentNote}>{message.content}</p>
            )}
            <footer className={styles.attachmentFooter}>
              <a href={placeMapUrl} target="_blank" rel="noopener noreferrer">
                지도에서 보기 <AppIcon name="external" />
              </a>
              <PlaceFavoriteButton
                messageId={message.id}
                placeName={message.place.name}
              />
            </footer>
          </div>
        ) : message.type === 'TOPIC_SHARE' && message.sharedTopic !== null ? (
          <Link
            className={styles.attachment}
            href={`/app/questions/${message.sharedTopic.id}`}
          >
            <span className={styles.attachmentKind}>
              <span>
                <AppIcon name="topic" />
                {categoryLabels[message.sharedTopic.category]} 토픽
              </span>
              <span
                className={`${styles.status} ${styles[`status--${message.sharedTopic.status.toLowerCase()}`]}`}
              >
                {statusLabels[message.sharedTopic.status]}
              </span>
            </span>
            <strong className={styles.attachmentTitle}>
              {message.sharedTopic.content}
            </strong>
            {message.sharedTopic.areaText && (
              <span className={styles.attachmentText}>
                <AppIcon name="pin" />
                {message.sharedTopic.areaText}
              </span>
            )}
            <span className={styles.attachmentFacts}>
              <span>
                답변<b>{message.sharedTopic.answerCount}개</b>
              </span>
              <span>
                요청<b>{urgencyLabels[message.sharedTopic.urgency]}</b>
              </span>
            </span>
            <span className={styles.attachmentFooter}>
              <span>답변과 현황 보기</span>
              <AppIcon name="chevron-right" />
            </span>
          </Link>
        ) : (
          <div className={styles.bubble}>
            <p>{message.content}</p>
          </div>
        )}
        {message.topicId !== null ? (
          <Link
            className={styles.followUp}
            href={`/app/questions/${message.topicId}`}
          >
            토픽으로 이어짐
          </Link>
        ) : canPromote ? (
          <button
            className={styles.followUp}
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
