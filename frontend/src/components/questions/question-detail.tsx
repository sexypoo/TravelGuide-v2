'use client';

import Link from 'next/link';
import { AnswerCard } from '@/components/answers/answer-card';
import { AnswerForm } from '@/components/answers/answer-form';
import { useRoomRealtime } from '@/components/providers/realtime-provider';
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
        aria-label="질문 상세를 불러오는 중"
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
          ← 제주 도움방
        </Link>
        <div className="roomQueryState roomQueryState--error" role="alert">
          <span aria-hidden="true">!</span>
          <h1>질문을 불러오지 못했어요</h1>
          <p>질문이 삭제되었거나 연결이 잠시 불안정할 수 있어요.</p>
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

  return (
    <div className="questionDetailPage">
      <Link className="appBackLink" href={`/app/rooms/${room.slug}`}>
        ← 제주 도움방
      </Link>
      {connectionState !== 'connected' && (
        <div className="connectionNotice" role="status">
          실시간 연결을 복구 중입니다. 연결 후 이 질문을 자동으로 다시
          확인합니다.
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
          <p className="questionArea">⌖ {question.areaText}</p>
        )}
        {question.safetyNotice !== null && (
          <div className="safetyNotice">
            <strong>긴급 상황 안내</strong>
            {question.safetyNotice}
          </div>
        )}
        <footer>
          <span className="publicBadge publicBadge--traveler">
            <span aria-hidden="true">↗</span>
            {question.author.nickname} · 인증 여행자
          </span>
          <span>
            {formatDateTime(question.createdAt)} 질문 ·{' '}
            {formatDateTime(question.expiresAt)} 마감
          </span>
        </footer>
      </article>

      <section className="answerThread" aria-labelledby="answer-thread-title">
        <div className="answerThread__heading">
          <div>
            <p>LOCAL SIGNALS</p>
            <h2 id="answer-thread-title">
              현지인 답변 {question.answers.length}
            </h2>
          </div>
          <span>먼저 도착한 순서</span>
        </div>
        {question.answers.length === 0 ? (
          <div className="roomQueryState">
            <span aria-hidden="true">⌁</span>
            <h3>아직 도착한 답변이 없어요</h3>
            <p>
              실시간 연결을 유지하고 있어요. 현지인의 첫 답변이 오면 바로
              알려드릴게요.
            </p>
          </div>
        ) : (
          <div className="answerSignalList">
            <div className="answerSignalRail" aria-hidden="true" />
            {question.answers.map((answer) => (
              <AnswerCard key={answer.id} answer={answer} />
            ))}
          </div>
        )}
      </section>

      {canAnswer && (
        <AnswerForm questionId={question.id} roomSlug={room.slug} />
      )}
    </div>
  );
}
