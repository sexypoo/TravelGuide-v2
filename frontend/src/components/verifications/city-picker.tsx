import { Card, ListRow, SectionHead } from '@/components/ui';
import type { Room } from '@/lib/api/rooms';
import { groupRoomsByCountry } from '@/lib/rooms/presentation';
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
  return (
    <div className={styles.column}>
      {groupRoomsByCountry(rooms).map((group) => (
        <section
          key={group.countryCode}
          aria-labelledby={`city-${group.countryCode}`}
        >
          <SectionHead id={`city-${group.countryCode}`} title={group.name} />
          <Card padding="list">
            {group.rooms.map((room) => (
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
