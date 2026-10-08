import Link from 'next/link';
import { AppIcon } from '@/components/common';
import { TravelerVerificationForm } from '@/components/verifications/traveler-verification-form';
import styles from '@/components/verifications/verification.module.css';
import { getRooms } from '@/lib/api/rooms.server';

export default async function TravelerVerificationPage(): Promise<React.JSX.Element> {
  const rooms = await getRooms();
  const destination = rooms[0]?.destination;
  if (destination === undefined)
    throw new Error('인증 가능한 여행지가 없습니다.');
  return (
    <div className={styles.page}>
      <Link className={`appBackLink ${styles.back}`} href="/app/verifications">
        <AppIcon name="arrow-left" /> 인증 현황
      </Link>
      <header className={styles.header}>
        <h1>여행자 인증 신청</h1>
        <p>
          승인되면 여행 기간 동안 {destination.nameKo} 도움방에서 질문할 수
          있어요.
        </p>
      </header>
      <TravelerVerificationForm destinationId={destination.id} />
    </div>
  );
}
