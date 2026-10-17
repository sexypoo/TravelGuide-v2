import { Page, PageHeader } from '@/components/app/page';
import { LocalVerificationForm } from '@/components/verifications/local-verification-form';
import { getRooms } from '@/lib/api/rooms.server';
import { requireUser } from '@/lib/auth/session';

export default async function LocalVerificationPage(): Promise<React.JSX.Element> {
  await requireUser('/app/verifications/local');
  const rooms = await getRooms();
  const destination = rooms[0]?.destination;
  if (destination === undefined)
    throw new Error('인증 가능한 여행지가 없습니다.');
  return (
    <Page>
      <PageHeader
        title="현지인 인증 신청"
        description={`승인되면 ${destination.nameKo} 도움방에서 여행자 질문에 답할 수 있어요.`}
        backHref="/app/verifications"
        backLabel="참여 자격"
      />
      <LocalVerificationForm destination={destination} />
    </Page>
  );
}
