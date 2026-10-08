import Link from 'next/link';
import { AppIcon } from '@/components/common';
import { VerificationStatusCard } from '@/components/verifications/verification-status-card';
import styles from '@/components/verifications/verification.module.css';
import type { VerificationType } from '@/lib/api/verifications';
import { getMyVerifications } from '@/lib/api/verifications.server';

interface PageProps {
  searchParams: Promise<{ submitted?: string | string[] }>;
}

const choices: ReadonlyArray<{
  type: VerificationType;
  title: string;
  description: string;
  pendingDescription: string;
  href: string;
}> = [
  {
    type: 'TRAVELER',
    title: '여행자 인증',
    description: '일정과 예약 증빙으로 신청해요. 승인되면 질문할 수 있어요.',
    pendingDescription: '여행자 신청을 심사하고 있어요.',
    href: '/app/verifications/traveler',
  },
  {
    type: 'LOCAL',
    title: '현지인 인증',
    description: '위치와 연고 증빙으로 신청해요. 승인되면 답변할 수 있어요.',
    pendingDescription: '현지인 신청을 심사하고 있어요.',
    href: '/app/verifications/local',
  },
];

export default async function VerificationsPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const [verifications, query] = await Promise.all([
    getMyVerifications(),
    searchParams,
  ]);
  const submitted =
    query.submitted === 'traveler'
      ? '여행자'
      : query.submitted === 'local'
        ? '현지인'
        : null;
  const pendingTypes = new Set(
    verifications
      .filter((item) => item.status === 'PENDING')
      .map((item) => item.type),
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 id="verifications-title">참여 자격</h1>
        <p id="verifications-lede">
          질문하려면 여행자 인증, 답변하려면 현지인 인증이 필요해요.
        </p>
      </header>

      {submitted !== null && (
        <div className={styles.submitted} role="status">
          <span aria-hidden="true">
            <AppIcon name="check" />
          </span>
          <div>
            <strong>{submitted} 인증을 보냈어요</strong>
            <p>관리자가 확인하면 여기에 바로 반영돼요.</p>
          </div>
        </div>
      )}

      <section className={styles.section} aria-labelledby="my-verifications">
        <h2 id="my-verifications">내 인증</h2>
        <ul className={styles.list}>
          {verifications.length > 0 ? (
            verifications.map((item) => (
              <li key={item.id}>
                <VerificationStatusCard verification={item} />
              </li>
            ))
          ) : (
            <li className={styles.empty}>
              아직 신청한 인증이 없어요. 아래에서 참여 방식을 골라 신청하세요.
            </li>
          )}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="new-verification">
        <h2 id="new-verification">새로 신청하기</h2>
        <ul className={styles.list}>
          {choices.map((choice) => (
            <li key={choice.type}>
              {pendingTypes.has(choice.type) ? (
                <div className={styles.choice}>
                  <span>
                    <strong>{choice.title}</strong>
                    <span>{choice.pendingDescription}</span>
                  </span>
                  <span className={styles.choiceState}>심사 중</span>
                </div>
              ) : (
                <Link className={styles.choice} href={choice.href}>
                  <span>
                    <strong>{choice.title}</strong>
                    <span>{choice.description}</span>
                  </span>
                  <AppIcon name="arrow-right" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className={styles.note}>
        증빙과 정확한 위치는 공개되지 않고 관리자 심사에만 쓰여요.
      </p>
    </div>
  );
}
