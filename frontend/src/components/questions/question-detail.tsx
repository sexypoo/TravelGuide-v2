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
import type { Room } from '@/lib/api/rooms';
import {
  categoryLabels,
  formatDateTime,
  statusLabels,
  urgencyLabels,
} from '@/lib/questions/presentation';
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
  return (
    <Page>
      <div className={styles.frame}>
        <PageHeader
          title="토픽"
          backHref={`/app/rooms/${room.slug}`}
          backLabel={`${room.destination.nameKo} 도움방`}
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
  const connectionState = useRoomRealtime(room.slug, true);
  const query = useQuestion(questionId);

  if (query.isPending) {
    return (
      <DetailFrame room={room}>
        <div className={styles.skeleton} aria-label="토픽 상세를 불러오는 중">
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
              title="토픽을 불러오지 못했어요"
              description="토픽이 삭제되었거나 연결이 잠시 불안정할 수 있어요."
              action={
                <Button
                  variant="secondary"
                  icon="refresh"
                  onClick={() => void query.refetch()}
                >
                  다시 불러오기
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
          {connectionState === 'offline'
            ? '인터넷 연결을 확인해 주세요. 연결되면 이 토픽을 자동으로 다시 불러와요.'
            : '실시간 연결을 복구 중이에요. 연결되면 이 토픽을 자동으로 다시 불러와요.'}
        </Notice>
      )}
      {query.isRefetchError && (
        <div className={styles.retryRow}>
          <Notice tone="warning" icon="alert" role="status">
            토픽을 새로 불러오지 못했어요. 보이는 내용이 최신이 아닐 수 있어요.
          </Notice>
          <Button
            variant="secondary"
            size="md"
            icon="refresh"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            {query.isFetching ? '불러오는 중' : '다시 시도'}
          </Button>
        </div>
      )}
      <Card as="article" className={styles.question}>
        <div className={styles.lead}>
          <span className={styles.category}>
            {categoryLabels[question.category]}
          </span>
          <span className={styles.chips}>
            {question.urgency === 'URGENT' && (
              <Chip tone="traveler" icon="clock">
                {urgencyLabels.URGENT}
              </Chip>
            )}
            <Chip tone={statusTone}>{statusLabels[question.status]}</Chip>
          </span>
        </div>
        <h2 className={styles.content}>{question.content}</h2>
        {question.areaText !== null && (
          <p className={styles.area}>
            <AppIcon name="pin" /> {question.areaText}
          </p>
        )}
        {question.image !== null && (
          <figure className={styles.evidence}>
            {/* Protected room media is served by the authenticated API route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.image.url}
              alt={`${question.areaText ?? '현장'} 토픽 첨부 사진`}
            />
            <figcaption>
              <strong>현장 사진</strong>
              <span>{question.image.originalName}</span>
            </figcaption>
          </figure>
        )}
        {question.safetyNotice !== null && (
          <div className={styles.safety}>
            <strong>긴급 상황 안내</strong>
            <p>{question.safetyNotice}</p>
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
                  {formatDateTime(question.createdAt)}
                </time>{' '}
                ·{' '}
                <time dateTime={question.expiresAt}>
                  {formatDateTime(question.expiresAt)}
                </time>{' '}
                마감
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
                    { type: 'QUESTION', id: question.id, label: '이 토픽' },
                    {
                      type: 'USER',
                      id: question.author.id,
                      label: `${question.author.nickname} 사용자`,
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
                ? '작성자가 해결된 상황으로 확인했어요'
                : '작성자가 도움이 된 답변을 채택했어요'}
            </strong>
            <p>
              {question.resolvedAt === null
                ? '이 토픽은 해결됨으로 마무리되었어요.'
                : `${formatDateTime(question.resolvedAt)}에 해결되었어요.`}
            </p>
          </div>
        </div>
      )}

      <section className={styles.answers} aria-labelledby="answer-thread-title">
        <div className={styles.answersHead}>
          <h2 id="answer-thread-title">
            참여자 답변 {question.answers.length}
          </h2>
          <span>먼저 도착한 순서</span>
        </div>
        {question.answers.length === 0 ? (
          <Card>
            <EmptyState
              icon="live"
              tone="iris"
              title="아직 도착한 답변이 없어요"
              description="실시간 연결을 유지하고 있어요. 참여자의 첫 답변이 오면 바로 보여드릴게요."
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
