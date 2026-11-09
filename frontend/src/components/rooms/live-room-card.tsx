'use client';

import Link from 'next/link';
import { useLocale, useMessages } from '@/i18n/client';
import type { Messages } from '@/i18n/messages';
import type { QuestionPage } from '@/lib/api/questions';
import type { Room } from '@/lib/api/rooms';
import { formatRelativeTime } from '@/lib/questions/presentation';
import { destinationName } from '@/lib/rooms/presentation';
import { ButtonLink } from '@/components/ui';
import styles from './live-room-card.module.css';

function openCountLabel(
  page: QuestionPage,
  t: Messages['rooms']['card'],
): string {
  if (page.items.length === 0) return t.noTopics;
  return t.openTopics(page.items.length, page.nextCursor !== null);
}

/**
 * The home's one dark surface: what is happening in a destination room right
 * now, or what the visitor needs to do to join it.
 */
export function LiveRoomCard({
  room,
  openQuestions,
  now = new Date(),
}: {
  room: Room;
  openQuestions: QuestionPage | null;
  now?: Date;
}): React.JSX.Element {
  const messages = useMessages();
  const locale = useLocale();
  const t = messages.rooms.card;
  const name = messages.rooms.roomName(
    destinationName(room.destination, locale),
  );
  const href = `/app/rooms/${room.slug}`;
  const { access } = room;

  if (!access.canViewContent) {
    const pending =
      access.status === 'TRAVELER_PENDING' || access.status === 'LOCAL_PENDING';
    return (
      <section className={styles.card} aria-labelledby={`room-${room.id}`}>
        <p className={styles.status}>
          <span className={styles.dotIdle} aria-hidden="true" />
          {messages.rooms.access[access.status]}
        </p>
        <h2 className={styles.title} id={`room-${room.id}`}>
          {name}
        </h2>
        <p className={styles.sub}>{pending ? t.pendingSub : t.lockedSub}</p>
        <div className={styles.actions}>
          <ButtonLink href="/app/verifications" variant="light" size="lg">
            {pending ? t.viewReview : t.verifyAndJoin}
          </ButtonLink>
          <Link className={styles.secondary} href={href}>
            {t.viewIntro}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-labelledby={`room-${room.id}`}>
      <p className={styles.status}>
        <span className={styles.dotLive} aria-hidden="true" />
        {openQuestions === null ? t.live : openCountLabel(openQuestions, t)}
      </p>
      <h2 className={styles.title} id={`room-${room.id}`}>
        {name}
      </h2>
      <p className={styles.sub}>{t.liveSub}</p>

      {openQuestions !== null && openQuestions.items.length > 0 && (
        <ul className={styles.feed} aria-label={t.feedLabel}>
          {openQuestions.items.map((question) => (
            <li key={question.id}>
              <Link
                className={styles.question}
                href={`/app/questions/${question.id}`}
              >
                <span className={styles.questionText}>
                  <span className={styles.questionTitle}>
                    {question.content}
                  </span>
                  <span className={styles.questionMeta}>
                    {t.postedAt(
                      formatRelativeTime(question.createdAt, now, locale),
                    )}
                  </span>
                </span>
                <span
                  className={styles.answers}
                  aria-label={t.answersLabel(question.answerCount)}
                >
                  {t.answersShort(question.answerCount)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <ButtonLink href={href} variant="light" size="lg">
          {t.enter}
        </ButtonLink>
      </div>
    </section>
  );
}
