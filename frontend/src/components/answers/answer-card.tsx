import Link from 'next/link';
import { AppIcon, type AppIconName } from '@/components/common';
import {
  ParticipantChip,
  participantAvatarTone,
} from '@/components/questions/participant-chip';
import { ReportMenu } from '@/components/reports/report-menu';
import { Avatar, Chip } from '@/components/ui';
import type { Answer, AnswerSourceType } from '@/lib/api/questions';
import {
  formatDateTime,
  formatVerifiedDate,
  sourceLabels,
  crowdLabels,
  entryLabels,
} from '@/lib/questions/presentation';
import styles from './answer-card.module.css';

const sourceIcons: Record<AnswerSourceType, AppIconName> = {
  ON_SITE_NOW: 'pin',
  RECENT_EXPERIENCE: 'clock',
  OFFICIAL_SOURCE: 'shield',
  PERSONAL_OPINION: 'info',
};

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
      className={styles.card}
      data-accepted={accepted ? 'true' : undefined}
      data-removed={answer.removed ? 'true' : undefined}
    >
      {accepted && (
        <div className={styles.accepted}>
          <Chip tone="success" icon="check">
            채택된 답변
          </Chip>
        </div>
      )}
      <header className={styles.head}>
        {answer.removed ? (
          <span className={styles.removedLabel}>
            <AppIcon name="minus" />
            숨김 처리된 답변
          </span>
        ) : (
          <>
            <Avatar
              name={answer.author.nickname}
              tone={participantAvatarTone(answer.author.badge)}
            />
            <div className={styles.who}>
              <span className={styles.whoLine}>
                <Link
                  className={styles.name}
                  href={`/app/users/${encodeURIComponent(answer.author.id)}`}
                  aria-label={`${answer.author.nickname} 공개 프로필 보기`}
                >
                  {answer.author.nickname}
                </Link>
                <ParticipantChip badge={answer.author.badge} />
              </span>
              <span className={styles.sub}>
                <time dateTime={answer.createdAt}>
                  {formatDateTime(answer.createdAt)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{formatVerifiedDate(answer.author.verifiedAt)} 인증</span>
              </span>
            </div>
          </>
        )}
      </header>
      <p className={styles.content}>{answer.content}</p>
      {answer.image && (
        <figure className={styles.evidence}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={answer.image.url} alt={answer.image.originalName} />
          <figcaption>현장 확인 사진</figcaption>
        </figure>
      )}
      {answer.observation && (
        <div className={styles.observation} aria-label="현장 관찰 정보">
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
      {(!answer.removed || answer.sourceUrl !== null) && (
        <footer className={styles.footer}>
          {!answer.removed && (
            <Chip icon={sourceIcons[answer.sourceType]}>
              {sourceLabels[answer.sourceType]}
            </Chip>
          )}
          {answer.sourceUrl !== null && (
            <a
              className={styles.source}
              href={answer.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              공식 출처 열기 <AppIcon name="external" />
            </a>
          )}
          {answer.author.id !== currentUserId && !answer.removed && (
            <span className={styles.report}>
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
            </span>
          )}
        </footer>
      )}
    </article>
  );
}
