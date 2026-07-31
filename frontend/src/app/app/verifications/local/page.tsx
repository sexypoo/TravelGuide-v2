import Link from 'next/link';
import { LocalVerificationForm } from '@/components/verifications/local-verification-form';
import { getRooms } from '@/lib/api/rooms.server';

export default async function LocalVerificationPage(): Promise<React.JSX.Element> {
  const rooms = await getRooms();
  const destination = rooms[0]?.destination;
  if (destination === undefined)
    throw new Error('인증 가능한 여행지가 없습니다.');
  return (
    <div className="verificationApplication">
      <Link className="appBackLink" href="/app/verifications">
        ← 인증 현황
      </Link>
      <header className="pageHeading">
        <p>현지인 인증</p>
        <h1>지금 제주를 아는 사람으로 참여해요</h1>
        <span>
          현재 위치는 제주 내부 여부 확인에만 쓰고 화면에 좌표를 표시하지
          않습니다.
        </span>
      </header>
      <div className="destinationChip">
        제주 · 반경 {destination.radiusKm}km
      </div>
      <LocalVerificationForm destination={destination} />
    </div>
  );
}
