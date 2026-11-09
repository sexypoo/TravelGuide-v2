import { Page, PageHeader } from '@/components/app/page';
import {
  Card,
  Chip,
  type ChipTone,
  EmptyState,
  ListRow,
  SectionHead,
} from '@/components/ui';
import type { Room, RoomAccessStatus } from '@/lib/api/rooms';
import { getRooms } from '@/lib/api/rooms.server';
import { requireUser } from '@/lib/auth/session';
import { splitRooms } from '@/lib/rooms/presentation';
import styles from './rooms.module.css';

const statusTone: Readonly<Record<RoomAccessStatus, ChipTone>> = {
  AVAILABLE: 'success',
  TRAVELER_PENDING: 'warning',
  LOCAL_PENDING: 'warning',
  VERIFICATION_REQUIRED: 'neutral',
};

function RoomRows({ rooms }: { rooms: readonly Room[] }): React.JSX.Element {
  return (
    <Card padding="list">
      {rooms.map((room) => (
        <ListRow
          key={room.id}
          href={`/app/rooms/${encodeURIComponent(room.slug)}`}
          icon="room"
          tone={room.access.canViewContent ? 'magenta' : 'neutral'}
          title={`${room.destination.nameKo} 도움방`}
          trailing={
            <Chip tone={statusTone[room.access.status]}>
              {room.access.labelKo}
            </Chip>
          }
        />
      ))}
    </Card>
  );
}

export default async function RoomsPage(): Promise<React.JSX.Element> {
  await requireUser('/app/rooms');
  const { domestic, temporary } = splitRooms(await getRooms());

  return (
    <Page>
      <PageHeader
        title="도움방"
        description="여행지마다 그곳에 사는 사람에게 지금 상황을 물어볼 수 있어요."
      />

      <div className={styles.stack}>
        {domestic.length === 0 && temporary.length === 0 ? (
          <Card>
            <EmptyState
              icon="room"
              tone="iris"
              title="열려 있는 도움방이 없어요"
              description="지역이 준비되면 이곳에 표시돼요."
            />
          </Card>
        ) : (
          <>
            {domestic.length > 0 && (
              <section aria-labelledby="rooms-domestic">
                <SectionHead id="rooms-domestic" title="국내 여행지" />
                <RoomRows rooms={domestic} />
              </section>
            )}
            {temporary.length > 0 && (
              <section aria-labelledby="rooms-temporary">
                <SectionHead id="rooms-temporary" title="임시 운영" />
                <p className={styles.note}>
                  해외 교환학생이 직접 운영해 보는 방이에요. 언제든 닫힐 수
                  있어요.
                </p>
                <RoomRows rooms={temporary} />
              </section>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
