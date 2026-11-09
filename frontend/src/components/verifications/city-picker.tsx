import { Card, ListRow, SectionHead } from '@/components/ui';
import type { Room } from '@/lib/api/rooms';
import { splitRooms } from '@/lib/rooms/presentation';
import styles from './verification.module.css';

/** Lists every city so a verification form knows its destination (#68). */
export function CityPicker({
  rooms,
  basePath,
  description,
}: {
  rooms: readonly Room[];
  basePath: string;
  description: (room: Room) => string;
}): React.JSX.Element {
  const { domestic, temporary } = splitRooms(rooms);
  const sections = [
    { id: 'city-domestic', title: '국내 여행지', rooms: domestic },
    { id: 'city-temporary', title: '임시 운영', rooms: temporary },
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
                title={room.destination.nameKo}
                description={description(room)}
              />
            ))}
          </Card>
        </section>
      ))}
    </div>
  );
}
