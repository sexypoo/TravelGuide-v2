import Link from 'next/link';
import { AccessIcon } from '@/components/app/access-icon';
import type { Room } from '@/lib/api/rooms';
import styles from './room-card.module.css';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps): React.JSX.Element {
  const locked = !room.access.canViewContent;

  return (
    <article
      className={styles.room}
      data-access={locked ? 'locked' : 'open'}
      aria-labelledby={`room-${room.id}-title`}
    >
      <div className={styles.access}>
        {locked ? (
          <AccessIcon locked />
        ) : (
          <span className={styles.liveDot} aria-hidden="true" />
        )}
        {room.access.labelKo}
      </div>
      <div className={styles.place} aria-hidden="true">
        {room.destination.nameKo}
      </div>
      <h2 id={`room-${room.id}-title`} className={styles.title}>
        {room.title}
      </h2>
      <div className={styles.summary} data-room-summary>
        <span>
          {locked
            ? '인증된 여행자와 현지인만 질문과 답변을 볼 수 있어요.'
            : '인증된 여행자와 현지인이 지금 상황을 묻고 답해요.'}
        </span>{' '}
        {room.destination.nameKo} 중심 반경 {room.destination.radiusKm}km
      </div>
      <Link className={styles.enter} href={`/app/rooms/${room.slug}`}>
        {locked ? '방 소개 보기' : '방으로 이동'}
      </Link>
    </article>
  );
}
