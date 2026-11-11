import { Page, PageHeader } from '@/components/app/page';
import { RoomExperience } from '@/components/rooms/room-experience';
import styles from '@/components/rooms/room.module.css';
import { ButtonLink, Card, IconTile, ListRow, Notice } from '@/components/ui';
import { getLocale, getMessages } from '@/i18n/server';
import { getRoom } from '@/lib/api/rooms.server';
import { requireUser } from '@/lib/auth/session';
import { destinationName } from '@/lib/rooms/presentation';

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

  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);
  const t = messages.rooms;
  const city = destinationName(room.destination, locale);
  const pending =
    room.access.status === 'TRAVELER_PENDING' ||
    room.access.status === 'LOCAL_PENDING';

  return (
    <Page>
      <PageHeader
        title={t.roomName(city)}
        description={t.locked.description}
        backHref="/app/rooms"
        backLabel={t.locked.backLabel}
      />
      <div className={styles.lockedStack}>
        <Card className={styles.lockedCard} aria-labelledby="room-lock-title">
          <IconTile icon="lock" tone="plum" />
          <h2 id="room-lock-title">
            {pending ? t.locked.pendingTitle : t.locked.lockedTitle(city)}
          </h2>
          <p>{pending ? t.locked.pendingBody : t.locked.lockedBody}</p>
          {pending ? (
            <ButtonLink href="/app/verifications" size="lg" block>
              {t.locked.viewReview}
            </ButtonLink>
          ) : (
            <div className={styles.lockedActions}>
              <ButtonLink
                href={`/app/verifications/traveler?city=${encodeURIComponent(room.destination.slug)}`}
                size="lg"
                block
              >
                {t.locked.verifyTraveler}
              </ButtonLink>
              <ButtonLink
                href={`/app/verifications/local?city=${encodeURIComponent(room.destination.slug)}`}
                variant="secondary"
                size="lg"
                block
              >
                {t.locked.verifyLocal}
              </ButtonLink>
            </div>
          )}
        </Card>

        <Card padding="list" aria-label={t.locked.areaLabel}>
          <ListRow
            icon="pin"
            tone="magenta"
            title={t.locked.areaTitle(city)}
            description={t.locked.areaDescription(room.destination.radiusKm)}
          />
          <ListRow
            icon="shield"
            tone="iris"
            title={t.locked.privacyTitle}
            description={t.locked.privacyDescription}
          />
        </Card>

        <Notice icon="info">{t.locked.communityNotice}</Notice>
      </div>
    </Page>
  );
}
