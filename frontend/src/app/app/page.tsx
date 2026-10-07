import Link from 'next/link';
import { AppIcon } from '@/components/common';
import { RoomCard } from '@/components/rooms/room-card';
import { getRooms } from '@/lib/api/rooms.server';
import type { Verification } from '@/lib/api/verifications';
import { getMyVerifications } from '@/lib/api/verifications.server';
import { requireUser } from '@/lib/auth/session';
import { getQualificationPresentation } from '@/lib/verifications/presentation';
import styles from './home.module.css';

interface StatusSummary {
  icon: 'check' | 'clock' | 'info';
  title: string;
  body: string;
}

function participantLabel(verification: Verification): string {
  return verification.type === 'TRAVELER' ? '여행자' : '현지인';
}

function statusSummary(source: Verification | undefined): StatusSummary {
  if (source?.status === 'APPROVED') {
    return {
      icon: 'check',
      title: `${source.destination.nameKo} ${participantLabel(source)} 인증 완료`,
      body: '실시간방에 참여할 수 있어요.',
    };
  }
  if (source?.status === 'PENDING') {
    return {
      icon: 'clock',
      title: `${participantLabel(source)} 인증 심사 중`,
      body: '승인되면 실시간방이 열려요.',
    };
  }
  return {
    icon: 'info',
    title: '아직 인증 전이에요',
    body: '실시간방은 인증 후 열려요.',
  };
}

export default async function AppHome(): Promise<React.JSX.Element> {
  const [user, rooms, verifications] = await Promise.all([
    requireUser('/app'),
    getRooms(),
    getMyVerifications(),
  ]);
  const summarySource =
    verifications.find((item) => item.status === 'APPROVED') ??
    verifications.find((item) => item.status === 'PENDING');
  const summary = statusSummary(summarySource);
  const qualifications = (['TRAVELER', 'LOCAL'] as const)
    .filter((type) => type !== summarySource?.type)
    .map((type) => ({
      type,
      ...getQualificationPresentation(verifications, type),
    }));

  return (
    <div className={styles.home}>
      <header className={styles.greeting}>
        <h1 id="welcome-title">
          {user.nickname}님,
          <br />
          무엇이 궁금하세요?
        </h1>
        <Link className={styles.status} href="/app/verifications">
          <span
            className={styles.statusIcon}
            data-tone={summary.icon}
            aria-hidden="true"
          >
            <AppIcon name={summary.icon} />
          </span>
          <span>
            <strong>{summary.title}</strong> {summary.body}
          </span>
        </Link>
      </header>

      <section aria-label="실시간 도움방">
        {rooms.length === 0 ? (
          <div className={styles.empty}>
            <h2>열려 있는 도움방이 없어요</h2>
            <p>
              지역이 준비되면 이곳에 표시돼요. 그동안 커뮤니티에서 물어보세요.
            </p>
          </div>
        ) : (
          <div className={styles.rooms}>
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      <section className={styles.more} aria-labelledby="more-title">
        <h2 id="more-title">다른 방법으로 참여하기</h2>
        <ul>
          <li>
            <Link href="/app/community">
              <span>
                <strong>여행자 커뮤니티</strong>
                <span>인증 없이도 여행 정보를 묻고 나눌 수 있어요.</span>
              </span>
              <AppIcon name="arrow-right" />
            </Link>
          </li>
          {qualifications.map((item) => (
            <li key={item.type}>
              <Link href={item.href}>
                <span>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </span>
                <AppIcon name="arrow-right" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
