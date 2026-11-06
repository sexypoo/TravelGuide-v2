import { Page, PageHeader } from '@/components/app/page';
import { CityPicker } from '@/components/verifications/city-picker';
import { TravelerVerificationForm } from '@/components/verifications/traveler-verification-form';
import { getRooms } from '@/lib/api/rooms.server';
import { requireUser } from '@/lib/auth/session';
import { roomForCity } from '@/lib/rooms/presentation';

interface PageProps {
  searchParams: Promise<{ city?: string | string[] }>;
}

export default async function TravelerVerificationPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  await requireUser('/app/verifications/traveler');
  const [rooms, query] = await Promise.all([getRooms(), searchParams]);
  const room = roomForCity(rooms, query.city);

  if (room === undefined) {
    return (
      <Page>
        <PageHeader
          title="여행자 인증 신청"
          description="어느 도시를 여행하나요? 승인되면 여행 기간 동안 그 도시 도움방에서 질문할 수 있어요."
          backHref="/app/verifications"
          backLabel="참여 자격"
        />
        <CityPicker
          rooms={rooms}
          basePath="/app/verifications/traveler"
          description={(candidate) =>
            `${candidate.destination.nameKo} 도움방에서 질문해요`
          }
        />
      </Page>
    );
  }

  const destination = room.destination;
  return (
    <Page>
      <PageHeader
        title={`${destination.nameKo} 여행자 인증`}
        description={`승인되면 여행 기간 동안 ${destination.nameKo} 도움방에서 질문할 수 있어요.`}
        backHref="/app/verifications/traveler"
        backLabel="도시 다시 고르기"
      />
      <TravelerVerificationForm destinationId={destination.id} />
    </Page>
  );
}
