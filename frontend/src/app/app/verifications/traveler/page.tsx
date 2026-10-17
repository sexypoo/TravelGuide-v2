import { Page, PageHeader } from '@/components/app/page';
import { TravelerVerificationForm } from '@/components/verifications/traveler-verification-form';
import { getRooms } from '@/lib/api/rooms.server';
import { requireUser } from '@/lib/auth/session';

export default async function TravelerVerificationPage(): Promise<React.JSX.Element> {
  await requireUser('/app/verifications/traveler');
  const rooms = await getRooms();
  const destination = rooms[0]?.destination;
  if (destination === undefined)
    throw new Error('인증 가능한 여행지가 없습니다.');
  return (
    <Page>
      <PageHeader
        title="여행자 인증 신청"
        description={`승인되면 여행 기간 동안 ${destination.nameKo} 도움방에서 질문할 수 있어요.`}
        backHref="/app/verifications"
        backLabel="참여 자격"
      />
      <TravelerVerificationForm destinationId={destination.id} />
    </Page>
  );
}
