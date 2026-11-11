import { Card, ListRow, SectionHead } from '@/components/ui';
import { getLocale, getMessages } from '@/i18n/server';
import type { Room } from '@/lib/api/rooms';
import { splitRooms } from '@/lib/rooms/presentation';
import { destinationName } from '@/lib/verifications/presentation';
import styles from './verification.module.css';

/** Lists every city so a verification form knows its destination (#68). */
export async function CityPicker({
  rooms,
  basePath,
  description,
}: {
  rooms: readonly Room[];
  basePath: string;
  description: (room: Room) => string;
}): Promise<React.JSX.Element> {
  const [t, locale] = await Promise.all([getMessages(), getLocale()]);
  const { domestic, temporary } = splitRooms(rooms);
  const sections = [
    {
      id: 'city-domestic',
      title: t.verifications.picker.domestic,
      rooms: domestic,
    },
    {
      id: 'city-temporary',
      title: t.verifications.picker.temporary,
      rooms: temporary,
    },
  ].filter((section) => section.rooms.length > 0);

  return (
    <div className={styles.column}>
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={section.id}>
          <SectionHead id={section.id} title={section.title} />
          <Card padding="list">
            {section.rooms.map((room) => (
              <ListRow
                key={room.id}
                href={`${basePath}?city=${encodeURIComponent(room.destination.slug)}`}
                icon="pin"
                tone="iris"
                title={destinationName(room.destination, locale)}
                description={description(room)}
              />
            ))}
          </Card>
        </section>
      ))}
    </div>
  );
}
