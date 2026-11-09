import Link from 'next/link';
import { AppIcon, type AppIconName } from '@/components/common';
import {
  ParticipantChip,
  participantAvatarTone,
} from '@/components/questions/participant-chip';
import { ReportMenu } from '@/components/reports/report-menu';
import { Avatar, Chip } from '@/components/ui';
import { useLocale, useMessages } from '@/i18n/client';
import type { Answer, AnswerSourceType } from '@/lib/api/questions';
import {
  formatDateTime,
  formatVerifiedDate,
} from '@/lib/questions/presentation';
import styles from './answer-card.module.css';

const sourceIcons: Record<AnswerSourceType, AppIconName> = {
  ON_SITE_NOW: 'pin',
  RECENT_EXPERIENCE: 'clock',
  OFFICIAL_SOURCE: 'shield',
  PERSONAL_OPINION: 'info',
};

export function AnswerCard({
  answer,
  accepted,
  currentUserId,
}: {
  answer: Answer;
  accepted: boolean;
  currentUserId: string;
}): React.JSX.Element {
  const messages = useMessages();
  const locale = useLocale();
  const t = messages.topics.answerCard;
  const labels = messages.topics.labels;
  return (
    <article
      className={styles.card}
      data-accepted={accepted ? 'true' : undefined}
      data-removed={answer.removed ? 'true' : undefined}
    >
      {accepted && (
        <div className={styles.accepted}>
          <Chip tone="success" icon="check">
            {t.accepted}
          </Chip>
        </div>
      )}
      <header className={styles.head}>
        {answer.removed ? (
          <span className={styles.removedLabel}>
            <AppIcon name="minus" />
            {t.removed}
          </span>
        ) : (
          <>
            <Avatar
              name={answer.author.nickname}
              tone={participantAvatarTone(answer.author.badge)}
            />
            <div className={styles.who}>
              <span className={styles.whoLine}>
                <Link
                  className={styles.name}
                  href={`/app/users/${encodeURIComponent(answer.author.id)}`}
                  aria-label={t.profileLabel(answer.author.nickname)}
                >
                  {answer.author.nickname}
                </Link>
                <ParticipantChip badge={answer.author.badge} />
              </span>
              <span className={styles.sub}>
                <time dateTime={answer.createdAt}>
                  {formatDateTime(answer.createdAt, locale)}
                </time>
                <span aria-hidden="true">·</span>
                <span>
                  {t.verifiedOn(
                    formatVerifiedDate(answer.author.verifiedAt, locale),
                  )}
                </span>
              </span>
            </div>
          </>
        )}
      </header>
      <p className={styles.content}>
        {answer.removed ? messages.topics.hidden.answer : answer.content}
      </p>
      {/* The realtime cache keeps media on hidden answers until refetch. */}
      {!answer.removed && answer.image && (
        <figure className={styles.evidence}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={answer.image.url} alt={answer.image.originalName} />
          <figcaption>{t.photoCaption}</figcaption>
        </figure>
      )}
      {!answer.removed && answer.observation && (
        <div className={styles.observation} aria-label={t.observationLabel}>
          {answer.observation.waitMinutes !== null && (
            <span>
              <small>{t.wait}</small>
              <strong>{t.waitValue(answer.observation.waitMinutes)}</strong>
            </span>
          )}
          {answer.observation.crowdLevel !== null && (
            <span>
              <small>{t.crowd}</small>
              <strong>{labels.crowd[answer.observation.crowdLevel]}</strong>
            </span>
          )}
          {answer.observation.entryStatus !== null && (
            <span>
              <small>{t.entry}</small>
              <strong>{labels.entry[answer.observation.entryStatus]}</strong>
            </span>
          )}
          <time dateTime={answer.observation.observedAt}>
            {messages.topics.shared.checkedAt(
              formatDateTime(answer.observation.observedAt, locale),
            )}
          </time>
        </div>
      )}
      {(!answer.removed || answer.sourceUrl !== null) && (
        <footer className={styles.footer}>
          {!answer.removed && (
            <Chip icon={sourceIcons[answer.sourceType]}>
              {labels.source[answer.sourceType]}
            </Chip>
          )}
          {answer.sourceUrl !== null && (
            <a
              className={styles.source}
              href={answer.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.openSource} <AppIcon name="external" />
            </a>
          )}
          {answer.author.id !== currentUserId && !answer.removed && (
            <span className={styles.report}>
              <ReportMenu
                targets={[
                  { type: 'ANSWER', id: answer.id, label: t.reportAnswer },
                  {
                    type: 'USER',
                    id: answer.author.id,
                    label: messages.topics.shared.reportUser(
                      answer.author.nickname,
                    ),
                  },
                ]}
              />
            </span>
          )}
        </footer>
      )}
    </article>
  );
}
