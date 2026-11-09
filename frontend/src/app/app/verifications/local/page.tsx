import { Page, PageHeader } from '@/components/app/page';
import { CityPicker } from '@/components/verifications/city-picker';
import { LocalVerificationForm } from '@/components/verifications/local-verification-form';
import { getRooms } from '@/lib/api/rooms.server';
import { requireUser } from '@/lib/auth/session';
import { roomForCity } from '@/lib/rooms/presentation';

interface PageProps {
  searchParams: Promise<{ city?: string | string[] }>;
}

export default async function LocalVerificationPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  await requireUser('/app/verifications/local');
  const [rooms, query] = await Promise.all([getRooms(), searchParams]);
  const room = roomForCity(rooms, query.city);

  if (room === undefined) {
    return (
      <Page>
        <PageHeader
          title="현지인 인증 신청"
          description="어느 도시에 살거나 공부하고 있나요? 승인되면 그 도시 도움방에서 답할 수 있어요."
          backHref="/app/verifications"
          backLabel="참여 자격"
        />
        <CityPicker
          rooms={rooms}
          basePath="/app/verifications/local"
          description={(candidate) =>
            `${candidate.destination.nameKo} 도움방에서 답해요`
          }
        />
      </Page>
    );
  }

  const destination = room.destination;
  return (
    <Page>
      <PageHeader
        title={`${destination.nameKo} 현지인 인증`}
        description={`승인되면 ${destination.nameKo} 도움방에서 여행자 질문에 답할 수 있어요.`}
        backHref="/app/verifications/local"
        backLabel="도시 다시 고르기"
      />
      <LocalVerificationForm destination={destination} />
    </Page>
  );
}
