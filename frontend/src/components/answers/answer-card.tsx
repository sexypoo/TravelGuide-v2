import Link from 'next/link';
import type { Answer } from '@/lib/api/questions';
import { participantBadgeLabel } from '@/lib/api/participants';
import { ReportMenu } from '@/components/reports/report-menu';
import {
  formatDateTime,
  formatVerifiedDate,
  sourceLabels,
  crowdLabels,
  entryLabels,
} from '@/lib/questions/presentation';

export function AnswerCard({
  answer,
  accepted,
  currentUserId,
}: {
  answer: Answer;
  accepted: boolean;
  currentUserId: string;
}): React.JSX.Element {
  const badgeKind =
    answer.author.badge === 'VERIFIED_LOCAL'
      ? 'local'
      : answer.author.badge === 'VERIFIED_BOTH'
        ? 'both'
        : 'traveler';
  return (
    <article
      className={`signalAnswerCard${accepted ? ' signalAnswerCard--accepted' : ''}${answer.removed ? ' signalAnswerCard--removed' : ''}`}
    >
      <span className="signalAnswerCard__node" aria-hidden="true" />
      {accepted && <span className="acceptedAnswerFlag">채택된 답변</span>}
      <header>
        {answer.removed ? (
          <span className={`publicBadge publicBadge--${badgeKind}`}>
            <span aria-hidden="true">–</span>
            숨김 처리된 답변
          </span>
        ) : (
          <Link
            className={`publicBadge publicBadge--${badgeKind} publicBadge--linked`}
            href={`/app/users/${encodeURIComponent(answer.author.id)}`}
            aria-label={`${answer.author.nickname} 공개 프로필 보기`}
          >
            <span aria-hidden="true">
              {badgeKind === 'local'
                ? '⌂'
                : badgeKind === 'traveler'
                  ? '↗'
                  : '✓'}
            </span>
            {answer.author.nickname} ·{' '}
            {participantBadgeLabel(answer.author.badge)}
          </Link>
        )}
        <time dateTime={answer.createdAt}>
          {formatDateTime(answer.createdAt)}
        </time>
      </header>
      <p>{answer.content}</p>
      {answer.image && (
        <div className="answerEvidenceImage">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={answer.image.url} alt={answer.image.originalName} />
          <span>현장 확인 사진</span>
        </div>
      )}
      {answer.observation && (
        <div className="answerObservation" aria-label="현장 관찰 정보">
          {answer.observation.waitMinutes !== null && (
            <span>
              <small>대기</small>
              <strong>{answer.observation.waitMinutes}분</strong>
            </span>
          )}
          {answer.observation.crowdLevel !== null && (
            <span>
              <small>혼잡</small>
              <strong>{crowdLabels[answer.observation.crowdLevel]}</strong>
            </span>
          )}
          {answer.observation.entryStatus !== null && (
            <span>
              <small>입장</small>
              <strong>{entryLabels[answer.observation.entryStatus]}</strong>
            </span>
          )}
          <time dateTime={answer.observation.observedAt}>
            {formatDateTime(answer.observation.observedAt)} 확인
          </time>
        </div>
      )}
      <footer>
        {!answer.removed && (
          <span
            className={`sourceChip sourceChip--${answer.sourceType.toLowerCase()}`}
          >
            {sourceLabels[answer.sourceType]}
          </span>
        )}
        {!answer.removed && (
          <span>{formatVerifiedDate(answer.author.verifiedAt)} 인증</span>
        )}
        {answer.sourceUrl !== null && (
          <a href={answer.sourceUrl} target="_blank" rel="noopener noreferrer">
            공식 출처 열기 ↗
          </a>
        )}
        {answer.author.id !== currentUserId && !answer.removed && (
          <ReportMenu
            targets={[
              { type: 'ANSWER', id: answer.id, label: '이 답변' },
              {
                type: 'USER',
                id: answer.author.id,
                label: `${answer.author.nickname} 사용자`,
              },
            ]}
          />
        )}
      </footer>
    </article>
  );
}
