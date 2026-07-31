import Link from 'next/link';
import { AccessIcon } from '@/components/app/access-icon';
import { getRoom } from '@/lib/api/rooms.server';

interface RoomPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoomPage({
  params,
}: RoomPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const room = await getRoom(slug);
  const locked = !room.access.canViewContent;

  return (
    <div className="lockedRoomPage">
      <Link className="appBackLink" href="/app">
        <span aria-hidden="true">←</span> 홈으로
      </Link>
      <header className="roomHeader">
        <div>
          <p>
            {room.destination.nameKo} · {room.destination.countryCode}
          </p>
          <h1>{room.title}</h1>
          <span>인증된 여행자와 현지인만 참여할 수 있어요.</span>
        </div>
        <span
          className={`accessBadge accessBadge--${locked ? 'locked' : 'open'}`}
        >
          <AccessIcon locked={locked} />
          {room.access.labelKo}
        </span>
      </header>

      <section className="roomContext" aria-labelledby="room-context-title">
        <div className="roomContext__map" aria-hidden="true">
          <span className="roomContext__ring" />
          <span className="roomContext__point" />
          <strong>JEJU</strong>
        </div>
        <div>
          <p>도움 지역</p>
          <h2 id="room-context-title">제주 전역의 지금을 물어보세요</h2>
          <dl>
            <div>
              <dt>기준 위치</dt>
              <dd>
                {room.destination.center.latitude.toFixed(4)},{' '}
                {room.destination.center.longitude.toFixed(4)}
              </dd>
            </div>
            <div>
              <dt>도움 범위</dt>
              <dd>중심 반경 {room.destination.radiusKm}km</dd>
            </div>
          </dl>
        </div>
      </section>

      {locked ? (
        <section className="roomLockPanel" aria-labelledby="room-lock-title">
          <span className="roomLockPanel__icon">
            <AccessIcon locked />
          </span>
          <div>
            <p>질문 피드 잠김</p>
            <h2 id="room-lock-title">인증 후 제주 도움방이 열려요</h2>
            <span>
              현재는 방 소개만 볼 수 있습니다. 여행자 또는 현지인 인증 방법을
              먼저 확인해 주세요.
            </span>
          </div>
          <Link href="/app/verifications">인증 방법 확인하기</Link>
        </section>
      ) : (
        <section className="roomAvailableNotice">
          <strong>방 입장 자격이 확인되었습니다.</strong>
          <p>질문 피드는 아직 열리지 않았습니다.</p>
        </section>
      )}
    </div>
  );
}
