import { Page, PageHeader } from '@/components/app/page';
import { RoomExperience } from '@/components/rooms/room-experience';
import styles from '@/components/rooms/room.module.css';
import { ButtonLink, Card, IconTile, ListRow, Notice } from '@/components/ui';
import { getRoom } from '@/lib/api/rooms.server';
import { requireUser } from '@/lib/auth/session';

interface RoomPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoomPage({
  params,
}: RoomPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const [room, user] = await Promise.all([
    getRoom(slug),
    requireUser(`/app/rooms/${slug}`),
  ]);

  if (room.access.canViewContent) {
    return <RoomExperience room={room} currentUserId={user.id} />;
  }

  const pending =
    room.access.status === 'TRAVELER_PENDING' ||
    room.access.status === 'LOCAL_PENDING';

  return (
    <Page>
      <PageHeader
        title={`${room.destination.nameKo} 도움방`}
        description="인증된 여행자와 현지인만 대화할 수 있어요."
        backHref="/app"
        backLabel="홈으로"
      />
      <div className={styles.lockedStack}>
        <Card className={styles.lockedCard} aria-labelledby="room-lock-title">
          <IconTile icon="lock" tone="plum" />
          <h2 id="room-lock-title">
            {pending
              ? '심사가 끝나면 대화방이 열려요'
              : `인증하면 ${room.destination.nameKo} 도움방이 열려요`}
          </h2>
          <p>
            {pending
              ? '심사 결과는 참여 자격 화면에서 확인할 수 있어요.'
              : '여행자는 여행 일정과 예약 증빙으로, 현지인은 위치와 거주 증빙으로 인증해요.'}
          </p>
          <ButtonLink href="/app/verifications" size="lg" block>
            {pending ? '심사 현황 보기' : '인증 방법 확인하기'}
          </ButtonLink>
        </Card>

        <Card padding="list" aria-label="도움 지역">
          <ListRow
            icon="pin"
            tone="magenta"
            title={`${room.destination.nameKo} 전역`}
            description={`중심에서 반경 ${room.destination.radiusKm}km 안의 지금을 나눠요`}
          />
          <ListRow
            icon="shield"
            tone="iris"
            title="증빙은 공개되지 않아요"
            description="관리자 심사에만 쓰이고, 정확한 위치도 다른 사람에게 보이지 않아요"
          />
        </Card>

        <Notice icon="info">
          인증 없이도 커뮤니티에서 여행 정보를 묻고 나눌 수 있어요.
        </Notice>
      </div>
    </Page>
  );
}
