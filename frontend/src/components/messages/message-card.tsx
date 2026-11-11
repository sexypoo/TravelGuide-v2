import Link from 'next/link';
import type { ChatMessage } from '@/lib/api/messages';
import { participantBadgeLabel } from '@/lib/api/participants';
import { formatChatTime, topicLabels } from '@/lib/questions/presentation';
import { ReportMenu } from '@/components/reports/report-menu';
import { PlaceFavoriteButton } from '@/components/places/place-favorite-button';
import { AppIcon } from '@/components/common';
import { useLocale, useMessages } from '@/i18n/client';
import styles from './messages.module.css';

// The API stores this caption when a photo is sent without one; it is data, not UI copy.
const DEFAULT_IMAGE_CAPTION = '사진을 공유했습니다.';

export function MessageCard({
  message,
  own,
  onPromote,
}: {
  message: ChatMessage;
  own: boolean;
  onPromote: (message: ChatMessage) => void;
}): React.JSX.Element {
  const t = useMessages().chat.card;
  const locale = useLocale();
  const labels = topicLabels(locale);
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
          {Array.from(message.author.nickname)[0] ?? t.avatarFallback}
        </span>
      )}
      <div className={styles.body}>
        <header className={styles.meta}>
          <strong>{own ? t.me : message.author.nickname}</strong>
          <span className={`${styles.badge} ${styles[`badge--${badgeKind}`]}`}>
            {participantBadgeLabel(message.author.badge, locale)}
          </span>
          <time dateTime={message.createdAt}>
            {formatChatTime(message.createdAt, locale)}
          </time>
        </header>
        {message.removed ? (
          <div className={`${styles.bubble} ${styles.removed}`}>
            <p>{t.removed}</p>
          </div>
        ) : message.type === 'IMAGE' && message.image !== null ? (
          <div className={`${styles.bubble} ${styles.image}`}>
            {/* Protected room media is intentionally loaded from the authenticated API route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.image.url}
              alt={message.content || message.image.originalName}
            />
            {message.content && message.content !== DEFAULT_IMAGE_CAPTION && (
              <p>{message.content}</p>
            )}
          </div>
        ) : message.type === 'PLACE' && message.place !== null ? (
          <div className={styles.attachment}>
            <div className={styles.attachmentKind}>
              <span>
                <AppIcon name="pin" />
                {t.placeKind}
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
                {t.openMap} <AppIcon name="external" />
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
                {t.topicKind(labels.category[message.sharedTopic.category])}
              </span>
              <span
                className={`${styles.status} ${styles[`status--${message.sharedTopic.status.toLowerCase()}`]}`}
              >
                {labels.status[message.sharedTopic.status]}
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
                {t.answersLabel}
                <b>{t.answerCount(message.sharedTopic.answerCount)}</b>
              </span>
              <span>
                {t.urgencyLabel}
                <b>{labels.urgency[message.sharedTopic.urgency]}</b>
              </span>
            </span>
            <span className={styles.attachmentFooter}>
              <span>{t.viewTopic}</span>
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
            {t.followUpLinked}
          </Link>
        ) : canPromote ? (
          <button
            className={styles.followUp}
            type="button"
            onClick={() => onPromote(message)}
          >
            {t.promote}
          </button>
        ) : null}
        {!own && !message.removed && (
          <ReportMenu
            targets={[
              { type: 'MESSAGE', id: message.id, label: t.reportMessage },
              {
                type: 'USER',
                id: message.author.id,
                label: t.reportUser(message.author.nickname),
              },
            ]}
          />
        )}
      </div>
    </article>
  );
}
