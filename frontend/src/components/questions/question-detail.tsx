'use client';

import Link from 'next/link';
import { AppIcon } from '@/components/common';
import { AnswerCard } from '@/components/answers/answer-card';
import { AnswerForm } from '@/components/answers/answer-form';
import { useRoomRealtime } from '@/components/providers/realtime-provider';
import { ReportMenu } from '@/components/reports/report-menu';
import { TopicResolutionActions } from '@/components/questions/topic-resolution-actions';
import { TopicShareButton } from '@/components/questions/topic-share-button';
import { LiveStatusBoard } from '@/components/questions/live-status-board';
import { participantBadgeLabel } from '@/lib/api/participants';
import type { Room } from '@/lib/api/rooms';
import {
  categoryLabels,
  formatDateTime,
  statusLabels,
  urgencyLabels,
} from '@/lib/questions/presentation';
import { useQuestion } from '@/lib/query/use-questions';

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
      <div
        className="questionDetailSkeleton"
        aria-label="토픽 상세를 불러오는 중"
      >
        <span />
        <span />
        <span />
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="questionDetailPage">
        <Link className="appBackLink" href={`/app/rooms/${room.slug}`}>
          <AppIcon name="arrow-left" /> {room.destination.nameKo} 도움방
        </Link>
        <div className="roomQueryState roomQueryState--error" role="alert">
          <span aria-hidden="true">
            <AppIcon name="alert" />
          </span>
          <h1>토픽을 불러오지 못했어요</h1>
          <p>토픽이 삭제되었거나 연결이 잠시 불안정할 수 있어요.</p>
          <button type="button" onClick={() => void query.refetch()}>
            다시 불러오기
          </button>
        </div>
      </div>
    );
  }

  const question = query.data;
  const canAnswer =
    room.access.canAnswer &&
    question.author.id !== currentUserId &&
    question.status === 'OPEN' &&
    new Date(question.expiresAt).getTime() > Date.now();
  const badgeKind =
    question.author.badge === 'VERIFIED_LOCAL'
      ? 'local'
      : question.author.badge === 'VERIFIED_BOTH'
        ? 'both'
        : 'traveler';
  const isOwner = question.author.id === currentUserId;
  const canResolve =
    isOwner &&
    question.status === 'OPEN' &&
    new Date(question.expiresAt).getTime() > Date.now();

  return (
    <div className="questionDetailPage">
      <Link className="appBackLink" href={`/app/rooms/${room.slug}`}>
        <AppIcon name="arrow-left" /> {room.destination.nameKo} 도움방
      </Link>
      {connectionState !== 'connected' && (
        <div className="connectionNotice" role="status" aria-live="polite">
          {connectionState === 'offline'
            ? '인터넷 연결을 확인해 주세요. 연결되면 이 토픽을 자동으로 다시 불러옵니다.'
            : '실시간 연결을 복구 중입니다. 연결되면 이 토픽을 자동으로 다시 불러옵니다.'}
        </div>
      )}
      <article className="fullQuestionCard">
        <div className="questionMetaRow">
          <span className="questionCategory">
            {categoryLabels[question.category]}
          </span>
          <span
            className={`questionUrgency questionUrgency--${question.urgency.toLowerCase()}`}
          >
            {urgencyLabels[question.urgency]}
          </span>
          <span
            className={`questionStatus questionStatus--${question.status.toLowerCase()}`}
          >
            {statusLabels[question.status]}
          </span>
        </div>
        <h1>{question.content}</h1>
        {question.areaText !== null && (
          <p className="questionArea">
            <AppIcon name="pin" /> {question.areaText}
          </p>
        )}
        {question.image !== null && (
          <figure className="topicEvidencePanel">
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
          <div className="safetyNotice">
            <strong>긴급 상황 안내</strong>
            {question.safetyNotice}
          </div>
        )}
        <footer>
          <span className={`publicBadge publicBadge--${badgeKind}`}>
            <AppIcon name="external" />
            {question.author.nickname} ·{' '}
            {participantBadgeLabel(question.author.badge)}
          </span>
          <span>
            {formatDateTime(question.createdAt)} 토픽 ·{' '}
            {formatDateTime(question.expiresAt)} 마감
          </span>
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
        </footer>
      </article>

      {room.access.canChat && question.status !== 'REMOVED' && (
        <TopicShareButton roomSlug={room.slug} questionId={question.id} />
      )}

      <LiveStatusBoard question={question} />

      {question.status === 'RESOLVED' && (
        <div className="resolutionSummary" role="status">
          <span aria-hidden="true">
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
                ? '이 토픽은 해결됨으로 마무리되었습니다.'
                : `${formatDateTime(question.resolvedAt)}에 해결되었습니다.`}
            </p>
          </div>
        </div>
      )}

      {canResolve && (
        <TopicResolutionActions question={question} roomSlug={room.slug} />
      )}

      <section className="answerThread" aria-labelledby="answer-thread-title">
        <div className="answerThread__heading">
          <div>
            <p>LOCAL SIGNALS</p>
            <h2 id="answer-thread-title">
              참여자 답변 {question.answers.length}
            </h2>
          </div>
          <span>먼저 도착한 순서</span>
        </div>
        {question.answers.length === 0 ? (
          <div className="roomQueryState">
            <span aria-hidden="true">
              <AppIcon name="live" />
            </span>
            <h3>아직 도착한 답변이 없어요</h3>
            <p>
              실시간 연결을 유지하고 있어요. 참여자의 첫 답변이 오면 바로
              알려드릴게요.
            </p>
          </div>
        ) : (
          <div className="answerSignalList">
            <div className="answerSignalRail" aria-hidden="true" />
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

      {canAnswer && (
        <AnswerForm
          questionId={question.id}
          roomSlug={room.slug}
          category={question.category}
        />
      )}
    </div>
  );
}
