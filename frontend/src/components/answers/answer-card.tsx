import type { Answer } from '@/lib/api/questions';
import {
  formatDateTime,
  formatVerifiedDate,
  sourceLabels,
} from '@/lib/questions/presentation';

export function AnswerCard({ answer }: { answer: Answer }): React.JSX.Element {
  return (
    <article className="signalAnswerCard">
      <span className="signalAnswerCard__node" aria-hidden="true" />
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
        <span
          className={`sourceChip sourceChip--${answer.sourceType.toLowerCase()}`}
        >
          {sourceLabels[answer.sourceType]}
        </span>
        <span>{formatVerifiedDate(answer.author.verifiedAt)} 인증</span>
        {answer.sourceUrl !== null && (
          <a href={answer.sourceUrl} target="_blank" rel="noopener noreferrer">
            공식 출처 열기 ↗
          </a>
        )}
      </footer>
    </article>
  );
}
