import { Page, PageHeader } from '@/components/app/page';
import {
  Card,
  Chip,
  EmptyState,
  ListRow,
  Notice,
  SectionHead,
} from '@/components/ui';
import { VerificationStatusCard } from '@/components/verifications/verification-status-card';
import styles from '@/components/verifications/verification.module.css';
import type { VerificationType } from '@/lib/api/verifications';
import { getMyVerifications } from '@/lib/api/verifications.server';
import { requireUser } from '@/lib/auth/session';

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
  await requireUser('/app/verifications');
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
    <Page>
      <PageHeader
        title="참여 자격"
        description="질문하려면 여행자 인증, 답변하려면 현지인 인증이 필요해요."
        backHref="/app/profile"
        backLabel="내 정보"
      />

      <div className={styles.layout}>
        <div className={styles.column}>
          {submitted !== null && (
            <Notice tone="success" icon="check" role="status">
              <strong className={styles.reasonTitle}>
                {submitted} 인증을 보냈어요
              </strong>
              <span className={styles.reasonText}>
                관리자가 확인하면 여기에 바로 반영돼요.
              </span>
            </Notice>
          )}

          <section aria-labelledby="my-verifications">
            <SectionHead id="my-verifications" title="내 인증" />
            {verifications.length > 0 ? (
              <ul className={styles.list}>
                {verifications.map((item) => (
                  <li key={item.id}>
                    <VerificationStatusCard
                      verification={item}
                      canReapply={!pendingTypes.has(item.type)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <Card padding="none">
                <EmptyState
                  icon="shield"
                  tone="iris"
                  title="아직 신청한 인증이 없어요"
                  description="아래에서 참여 방식을 골라 신청하세요."
                />
              </Card>
            )}
          </section>
        </div>

        <div className={styles.column}>
          <section aria-labelledby="new-verification">
            <SectionHead id="new-verification" title="새로 신청하기" />
            <Card padding="list">
              {choices.map((choice) =>
                pendingTypes.has(choice.type) ? (
                  <ListRow
                    key={choice.type}
                    icon={choice.type === 'TRAVELER' ? 'map' : 'home'}
                    tone={choice.type === 'TRAVELER' ? 'magenta' : 'iris'}
                    title={choice.title}
                    description={choice.pendingDescription}
                    trailing={<Chip tone="warning">심사 중</Chip>}
                  />
                ) : (
                  <ListRow
                    key={choice.type}
                    href={choice.href}
                    icon={choice.type === 'TRAVELER' ? 'map' : 'home'}
                    tone={choice.type === 'TRAVELER' ? 'magenta' : 'iris'}
                    title={choice.title}
                    description={choice.description}
                  />
                ),
              )}
            </Card>
          </section>

          <Notice tone="info" icon="lock">
            증빙과 정확한 위치는 공개되지 않고 관리자 심사에만 쓰여요.
          </Notice>
        </div>
      </div>
    </Page>
  );
}
