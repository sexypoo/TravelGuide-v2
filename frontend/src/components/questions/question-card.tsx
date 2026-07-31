import Link from 'next/link';
import type { Question } from '@/lib/api/questions';
import {
  categoryLabels,
  formatDateTime,
  statusLabels,
  urgencyLabels,
} from '@/lib/questions/presentation';

export function QuestionCard({
  question,
}: {
  question: Question;
}): React.JSX.Element {
  return (
    <article
      className={`signalQuestionCard${question.urgency === 'URGENT' ? ' signalQuestionCard--urgent' : ''}`}
    >
      <span className="signalQuestionCard__node" aria-hidden="true" />
      <Link href={`/app/questions/${question.id}`}>
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
        <p className="questionCardContent">{question.content}</p>
        {question.areaText !== null && (
          <span className="questionArea">⌖ {question.areaText}</span>
        )}
        <footer className="questionCardFooter">
          <span className="publicBadge publicBadge--traveler">
            <span aria-hidden="true">↗</span>
            {question.author.nickname} · 인증 여행자
          </span>
          <span>
            답변 {question.answerCount} · {formatDateTime(question.createdAt)}
          </span>
        </footer>
      </Link>
    </article>
  );
}
