import Link from 'next/link';
import { AccessIcon } from '@/components/app/access-icon';
import type { Room } from '@/lib/api/rooms';

interface RoomCardProps {
  room: Room;
}

function JejuRoomSignal({ locked }: { locked: boolean }): React.JSX.Element {
  return (
    <div className={`jejuRoomSignal${locked ? ' jejuRoomSignal--locked' : ''}`}>
      <svg viewBox="0 0 96 70" aria-hidden="true">
        <path d="M81 30c4 11-3 23-18 29-18 8-43 4-50-8-7-11 5-26 24-34 17-7 38-8 44 3Z" />
      </svg>
      <span>
        <AccessIcon locked={locked} />
      </span>
    </div>
  );
}

export function RoomCard({ room }: RoomCardProps): React.JSX.Element {
  const locked = !room.access.canViewContent;

  return (
    <article className="roomCard">
      <div className="roomCard__visual">
        <JejuRoomSignal locked={locked} />
        <span
          className={`accessBadge accessBadge--${locked ? 'locked' : 'open'}`}
        >
          <AccessIcon locked={locked} />
          {room.access.labelKo}
        </span>
      </div>
      <div className="roomCard__body">
        <p>
          {room.destination.nameKo} · {room.destination.countryCode}
        </p>
        <h2>{room.title}</h2>
        <span>
          {locked
            ? '인증된 여행자와 현지인만 질문과 답변을 볼 수 있어요.'
            : '현재 자격으로 방에 입장할 수 있어요.'}
        </span>
        <dl>
          <div>
            <dt>운영 시간대</dt>
            <dd>{room.destination.timezone}</dd>
          </div>
          <div>
            <dt>도움 범위</dt>
            <dd>제주 중심 반경 {room.destination.radiusKm}km</dd>
          </div>
        </dl>
        <Link href={`/app/rooms/${room.slug}`}>
          {locked ? '방 소개 보기' : '방으로 이동'}{' '}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
