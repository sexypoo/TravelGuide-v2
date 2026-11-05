import { Page, PageHeader } from '@/components/app/page';
import {
  Card,
  Chip,
  type ChipTone,
  EmptyState,
  ListRow,
  Notice,
  SectionHead,
} from '@/components/ui';
import type { RoomAccessStatus } from '@/lib/api/rooms';
import { getRooms } from '@/lib/api/rooms.server';
import { requireUser } from '@/lib/auth/session';
import { groupRoomsByCountry } from '@/lib/rooms/presentation';
import styles from './rooms.module.css';

const statusTone: Readonly<Record<RoomAccessStatus, ChipTone>> = {
  AVAILABLE: 'success',
  TRAVELER_PENDING: 'warning',
  LOCAL_PENDING: 'warning',
  VERIFICATION_REQUIRED: 'neutral',
};

export default async function RoomsPage(): Promise<React.JSX.Element> {
  await requireUser('/app/rooms');
  const rooms = await getRooms();
  const groups = groupRoomsByCountry(rooms);

  return (
    <Page>
      <PageHeader
        title="도움방"
        description="도시마다 그곳에 사는 사람에게 지금 상황을 물어볼 수 있어요."
      />

      <div className={styles.stack}>
        <Notice tone="info" icon="info">
          그 도시에 살거나 공부하고 있다면 현지인으로 인증하고 답해 주세요.
          교환학생도 현지인으로 신청할 수 있어요.
        </Notice>

        {groups.length === 0 ? (
          <Card>
            <EmptyState
              icon="room"
              tone="iris"
              title="열려 있는 도움방이 없어요"
              description="지역이 준비되면 이곳에 표시돼요."
            />
          </Card>
        ) : (
          groups.map((group) => (
            <section
              key={group.countryCode}
              aria-labelledby={`rooms-${group.countryCode}`}
            >
              <SectionHead
                id={`rooms-${group.countryCode}`}
                title={group.name}
              />
              <Card padding="list">
                {group.rooms.map((room) => (
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
            </section>
          ))
        )}
      </div>
    </Page>
  );
}
