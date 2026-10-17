import Link from 'next/link';
import type { QuestionPage } from '@/lib/api/questions';
import type { Room } from '@/lib/api/rooms';
import { formatRelativeTime } from '@/lib/questions/presentation';
import { ButtonLink } from '@/components/ui';
import styles from './live-room-card.module.css';

function openCountLabel(page: QuestionPage): string {
  if (page.items.length === 0) return '아직 진행 중인 토픽이 없어요';
  const count =
    page.nextCursor === null
      ? `${page.items.length}개`
      : `${page.items.length}개 이상`;
  return `진행 중인 토픽 ${count}`;
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
  const name = `${room.destination.nameKo} 도움방`;
  const href = `/app/rooms/${room.slug}`;
  const { access } = room;

  if (!access.canViewContent) {
    const pending =
      access.status === 'TRAVELER_PENDING' || access.status === 'LOCAL_PENDING';
    return (
      <section className={styles.card} aria-labelledby={`room-${room.id}`}>
        <p className={styles.status}>
          <span className={styles.dotIdle} aria-hidden="true" />
          {access.labelKo}
        </p>
        <h2 className={styles.title} id={`room-${room.id}`}>
          {name}
        </h2>
        <p className={styles.sub}>
          {pending
            ? '심사가 끝나면 인증된 여행자, 현지인과 바로 대화할 수 있어요.'
            : '인증한 여행자와 현지인만 들어와 지금 상황을 묻고 답해요.'}
        </p>
        <div className={styles.actions}>
          <ButtonLink href="/app/verifications" variant="light" size="lg">
            {pending ? '심사 현황 보기' : '인증하고 참여하기'}
          </ButtonLink>
          <Link className={styles.secondary} href={href}>
            방 소개 보기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-labelledby={`room-${room.id}`}>
      <p className={styles.status}>
        <span className={styles.dotLive} aria-hidden="true" />
        {openQuestions === null
          ? '지금 열려 있어요'
          : openCountLabel(openQuestions)}
      </p>
      <h2 className={styles.title} id={`room-${room.id}`}>
        {name}
      </h2>
      <p className={styles.sub}>인증된 여행자와 현지인이 지금 상황을 나눠요.</p>

      {openQuestions !== null && openQuestions.items.length > 0 && (
        <ul className={styles.feed} aria-label="진행 중인 토픽">
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
                    {formatRelativeTime(question.createdAt, now)}에 올라왔어요
                  </span>
                </span>
                <span
                  className={styles.answers}
                  aria-label={`답변 ${question.answerCount}개`}
                >
                  답 {question.answerCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <ButtonLink href={href} variant="light" size="lg">
          방 들어가기
        </ButtonLink>
      </div>
    </section>
  );
}
