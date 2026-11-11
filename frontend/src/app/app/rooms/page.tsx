import { Page, PageHeader } from '@/components/app/page';
import {
  Card,
  Chip,
  type ChipTone,
  EmptyState,
  ListRow,
  SectionHead,
} from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Messages } from '@/i18n/messages';
import { getLocale, getMessages } from '@/i18n/server';
import type { Room, RoomAccessStatus } from '@/lib/api/rooms';
import { getRooms } from '@/lib/api/rooms.server';
import { requireUser } from '@/lib/auth/session';
import { destinationName, splitRooms } from '@/lib/rooms/presentation';
import styles from './rooms.module.css';

const statusTone: Readonly<Record<RoomAccessStatus, ChipTone>> = {
  AVAILABLE: 'success',
  TRAVELER_PENDING: 'warning',
  LOCAL_PENDING: 'warning',
  VERIFICATION_REQUIRED: 'neutral',
};

function RoomRows({
  rooms,
  t,
  locale,
}: {
  rooms: readonly Room[];
  t: Messages['rooms'];
  locale: Locale;
}): React.JSX.Element {
  return (
    <Card padding="list">
      {rooms.map((room) => (
        <ListRow
          key={room.id}
          href={`/app/rooms/${encodeURIComponent(room.slug)}`}
          icon="room"
          tone={room.access.canViewContent ? 'magenta' : 'neutral'}
          title={t.roomName(destinationName(room.destination, locale))}
          trailing={
            <Chip tone={statusTone[room.access.status]}>
              {t.access[room.access.status]}
            </Chip>
          }
        />
      ))}
    </Card>
  );
}

export default async function RoomsPage(): Promise<React.JSX.Element> {
  await requireUser('/app/rooms');
  const [rooms, messages, locale] = await Promise.all([
    getRooms(),
    getMessages(),
    getLocale(),
  ]);
  const t = messages.rooms;
  const { domestic, temporary } = splitRooms(rooms);

  return (
    <Page>
      <PageHeader title={t.list.title} description={t.list.description} />

      <div className={styles.stack}>
        {domestic.length === 0 && temporary.length === 0 ? (
          <Card>
            <EmptyState
              icon="room"
              tone="iris"
              title={t.list.emptyTitle}
              description={t.list.emptyDescription}
            />
          </Card>
        ) : (
          <>
            {domestic.length > 0 && (
              <section aria-labelledby="rooms-domestic">
                <SectionHead id="rooms-domestic" title={t.list.domestic} />
                <RoomRows rooms={domestic} t={t} locale={locale} />
              </section>
            )}
            {temporary.length > 0 && (
              <section aria-labelledby="rooms-temporary">
                <SectionHead id="rooms-temporary" title={t.list.temporary} />
                <p className={styles.note}>{t.list.temporaryNote}</p>
                <RoomRows rooms={temporary} t={t} locale={locale} />
              </section>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
