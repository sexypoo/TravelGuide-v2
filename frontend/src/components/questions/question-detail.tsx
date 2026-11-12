'use client';

import { Page, PageHeader } from '@/components/app/page';
import { AppIcon } from '@/components/common';
import { AnswerCard } from '@/components/answers/answer-card';
import { AnswerForm } from '@/components/answers/answer-form';
import { useRoomRealtime } from '@/components/providers/realtime-provider';
import { ReportMenu } from '@/components/reports/report-menu';
import { TopicResolutionActions } from '@/components/questions/topic-resolution-actions';
import { TopicShareButton } from '@/components/questions/topic-share-button';
import { LiveStatusBoard } from '@/components/questions/live-status-board';
import {
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  Notice,
} from '@/components/ui';
import { useLocale, useMessages } from '@/i18n/client';
import type { Room } from '@/lib/api/rooms';
import { formatDateTime } from '@/lib/questions/presentation';
import { useQuestion } from '@/lib/query/use-questions';
import { ParticipantChip, participantAvatarTone } from './participant-chip';
import styles from './question-detail.module.css';

function DetailFrame({
  room,
  children,
}: {
  room: Room;
  children: React.ReactNode;
}): React.JSX.Element {
  const t = useMessages().topics.detail;
  return (
    <Page>
      <div className={styles.frame}>
        <PageHeader
          title={t.title}
          backHref={`/app/rooms/${room.slug}`}
          backLabel={t.backLabel(room.destination.nameKo)}
        />
        <div className={styles.column}>{children}</div>
      </div>
    </Page>
  );
}

export function QuestionDetailView({
  questionId,
  room,
  currentUserId,
}: {
  questionId: string;
  room: Room;
  currentUserId: string;
}): React.JSX.Element {
  const messages = useMessages();
  const locale = useLocale();
  const t = messages.topics.detail;
  const shared = messages.topics.shared;
  const labels = messages.topics.labels;
  const connectionState = useRoomRealtime(room.slug, true);
  const query = useQuestion(questionId);

  if (query.isPending) {
    return (
      <DetailFrame room={room}>
        <div className={styles.skeleton} aria-label={t.loadingLabel}>
          <span />
          <span />
          <span />
        </div>
      </DetailFrame>
    );
  }
  // Only replace the page when nothing has loaded yet. A failed refetch keeps
  // the topic and the answer form (with its draft) mounted and shows a retry row.
  const question = query.data;
  if (question === undefined) {
    return (
      <DetailFrame room={room}>
        <Card>
          <div role="alert">
            <EmptyState
              icon="alert"
              title={shared.loadErrorTitle}
              description={t.loadErrorDescription}
              action={
                <Button
                  variant="secondary"
                  icon="refresh"
                  onClick={() => void query.refetch()}
                >
                  {shared.reload}
                </Button>
              }
            />
          </div>
        </Card>
      </DetailFrame>
    );
  }

  const canAnswer =
    room.access.canAnswer &&
    question.author.id !== currentUserId &&
    question.status === 'OPEN' &&
    new Date(question.expiresAt).getTime() > Date.now();
  const isOwner = question.author.id === currentUserId;
  const canResolve =
    isOwner &&
    question.status === 'OPEN' &&
    new Date(question.expiresAt).getTime() > Date.now();
  const canShare = room.access.canChat && question.status !== 'REMOVED';
  const statusTone =
    question.status === 'OPEN'
      ? 'success'
      : question.status === 'REMOVED'
        ? 'danger'
        : 'neutral';

  return (
    <DetailFrame room={room}>
      {connectionState !== 'connected' && (
        <Notice tone="warning" icon="refresh" role="status">
          {connectionState === 'offline' ? t.offline : t.reconnecting}
        </Notice>
      )}
      {query.isRefetchError && (
        <div className={styles.retryRow}>
          <Notice tone="warning" icon="alert" role="status">
            {t.refetchFailed}
          </Notice>
          <Button
            variant="secondary"
            size="md"
            icon="refresh"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            {query.isFetching ? messages.common.loading : messages.common.retry}
          </Button>
        </div>
      )}
      <Card as="article" className={styles.question}>
        <div className={styles.lead}>
          <span className={styles.category}>
            {labels.category[question.category]}
          </span>
          <span className={styles.chips}>
            {question.urgency === 'URGENT' && (
              <Chip tone="traveler" icon="clock">
                {labels.urgency.URGENT}
              </Chip>
            )}
            <Chip tone={statusTone}>{labels.status[question.status]}</Chip>
          </span>
        </div>
        <h2 className={styles.content}>
          {question.status === 'REMOVED'
            ? messages.topics.hidden.topic
            : question.content}
        </h2>
        {question.areaText !== null && (
          <p className={styles.area}>
            <AppIcon name="pin" /> {question.areaText}
          </p>
        )}
        {/* The realtime cache keeps media on hidden topics until refetch. */}
        {question.status !== 'REMOVED' && question.image !== null && (
          <figure className={styles.evidence}>
            {/* Protected room media is served by the authenticated API route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.image.url}
              alt={shared.photoAlt(question.areaText)}
            />
            <figcaption>
              <strong>{shared.photo}</strong>
              <span>{question.image.originalName}</span>
            </figcaption>
          </figure>
        )}
        {/* The API sends safetyNotice in Korean only; it just flags a
            SAFETY topic, so show the localized copy instead. */}
        {question.safetyNotice !== null && (
          <div className={styles.safety}>
            <strong>{t.safetyTitle}</strong>
            <p>{messages.topics.composer.safetyHelp}</p>
          </div>
        )}
        <footer className={styles.footer}>
          <div className={styles.author}>
            <Avatar
              name={question.author.nickname}
              tone={participantAvatarTone(question.author.badge)}
            />
            <div className={styles.authorText}>
              <span className={styles.authorName}>
                {question.author.nickname}
                <ParticipantChip badge={question.author.badge} />
              </span>
              <span className={styles.time}>
                <time dateTime={question.createdAt}>
                  {formatDateTime(question.createdAt, locale)}
                </time>{' '}
                · {t.closesBefore}
                <time dateTime={question.expiresAt}>
                  {formatDateTime(question.expiresAt, locale)}
                </time>
                {t.closesAfter}
              </span>
            </div>
          </div>
          {(canShare || (!isOwner && question.status !== 'REMOVED')) && (
            <div className={styles.actions}>
              {canShare && (
                <TopicShareButton
                  roomSlug={room.slug}
                  questionId={question.id}
                />
              )}
              {!isOwner && question.status !== 'REMOVED' && (
                <ReportMenu
                  targets={[
                    {
                      type: 'QUESTION',
                      id: question.id,
                      label: t.reportQuestion,
                    },
                    {
                      type: 'USER',
                      id: question.author.id,
                      label: shared.reportUser(question.author.nickname),
                    },
                  ]}
                />
              )}
            </div>
          )}
        </footer>
      </Card>

      <LiveStatusBoard question={question} />

      {question.status === 'RESOLVED' && (
        <div className={styles.resolved} role="status">
          <span className={styles.resolvedIcon} aria-hidden="true">
            <AppIcon name="check" />
          </span>
          <div>
            <strong>
              {question.acceptedAnswerId === null
                ? t.resolvedWithoutAnswer
                : t.resolvedAccepted}
            </strong>
            <p>
              {question.resolvedAt === null
                ? t.resolvedDefault
                : t.resolvedAt(formatDateTime(question.resolvedAt, locale))}
            </p>
          </div>
        </div>
      )}

      <section className={styles.answers} aria-labelledby="answer-thread-title">
        <div className={styles.answersHead}>
          <h2 id="answer-thread-title">
            {t.answersTitle(question.answers.length)}
          </h2>
          <span>{t.answersOrder}</span>
        </div>
        {question.answers.length === 0 ? (
          <Card>
            <EmptyState
              icon="live"
              tone="iris"
              title={t.emptyTitle}
              description={t.emptyDescription}
            />
          </Card>
        ) : (
          <div className={styles.answerList}>
            {question.answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                accepted={question.acceptedAnswerId === answer.id}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </section>

      {canResolve && (
        <TopicResolutionActions question={question} roomSlug={room.slug} />
      )}

      {canAnswer && (
        <AnswerForm
          questionId={question.id}
          roomSlug={room.slug}
          category={question.category}
        />
      )}
    </DetailFrame>
  );
}
