import { Page, PageHeader } from '@/components/app/page';
import { CityPicker } from '@/components/verifications/city-picker';
import { LocalVerificationForm } from '@/components/verifications/local-verification-form';
import { getRooms } from '@/lib/api/rooms.server';
import { getLocale, getMessages } from '@/i18n/server';
import { requireUser } from '@/lib/auth/session';
import { roomForCity } from '@/lib/rooms/presentation';
import { destinationName } from '@/lib/verifications/presentation';

interface PageProps {
  searchParams: Promise<{ city?: string | string[] }>;
}

export default async function LocalVerificationPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  await requireUser('/app/verifications/local');
  const [rooms, query, messages, locale] = await Promise.all([
    getRooms(),
    searchParams,
    getMessages(),
    getLocale(),
  ]);
  const t = messages.verifications.picker;
  const room = roomForCity(rooms, query.city);

  if (room === undefined) {
    return (
      <Page>
        <PageHeader
          title={t.localTitle}
          description={t.localDescription}
          backHref="/app/verifications"
          backLabel={t.backLabel}
        />
        <CityPicker
          rooms={rooms}
          basePath="/app/verifications/local"
          description={(candidate) =>
            t.localRow(destinationName(candidate.destination, locale))
          }
        />
      </Page>
    );
  }

  const destination = room.destination;
  const city = destinationName(destination, locale);
  return (
    <Page>
      <PageHeader
        title={t.localFormTitle(city)}
        description={t.localFormDescription(city)}
        backHref="/app/verifications/local"
        backLabel={t.rechoose}
      />
      <LocalVerificationForm destination={destination} />
    </Page>
  );
}
