import Link from 'next/link';
import { AppIcon } from '@/components/common';
import { TravelerVerificationForm } from '@/components/verifications/traveler-verification-form';
import { getRooms } from '@/lib/api/rooms.server';

export default async function TravelerVerificationPage(): Promise<React.JSX.Element> {
  const rooms = await getRooms();
  const destination = rooms[0]?.destination;
  if (destination === undefined)
    throw new Error('인증 가능한 여행지가 없습니다.');
  return (
    <div className="verificationApplication">
      <Link className="appBackLink" href="/app/verifications">
        <AppIcon name="arrow-left" /> 인증 현황
      </Link>
      <header className="pageHeading">
        <p>여행자 인증</p>
        <h1>여행 기간만큼 제주 도움방을 열어요</h1>
        <span>여행 일정과 증빙은 관리자 확인에만 사용됩니다.</span>
      </header>
      <div className="destinationChip">제주 · {destination.countryCode}</div>
      <TravelerVerificationForm destinationId={destination.id} />
    </div>
  );
}
