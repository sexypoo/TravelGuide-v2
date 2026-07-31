import type { Answer } from '@/lib/api/questions';
import { ReportMenu } from '@/components/reports/report-menu';
import {
  formatDateTime,
  formatVerifiedDate,
  sourceLabels,
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
  return (
    <article
      className={`signalAnswerCard${accepted ? ' signalAnswerCard--accepted' : ''}${answer.removed ? ' signalAnswerCard--removed' : ''}`}
    >
      <span className="signalAnswerCard__node" aria-hidden="true" />
      {accepted && <span className="acceptedAnswerFlag">채택된 답변</span>}
      <header>
        <span className="publicBadge publicBadge--local">
          <span aria-hidden="true">⌂</span>
          {answer.author.nickname} · 인증 현지인
        </span>
        <time dateTime={answer.createdAt}>
          {formatDateTime(answer.createdAt)}
        </time>
      </header>
      <p>{answer.content}</p>
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
