import { Page, PageHeader } from '@/components/app/page';
import {
  Card,
  EmptyState,
  ListRow,
  Notice,
  SectionHead,
} from '@/components/ui';
import { VerificationStatusCard } from '@/components/verifications/verification-status-card';
import styles from '@/components/verifications/verification.module.css';
import { getMessages } from '@/i18n/server';
import type { VerificationType } from '@/lib/api/verifications';
import { getMyVerifications } from '@/lib/api/verifications.server';
import { requireUser } from '@/lib/auth/session';

interface PageProps {
  searchParams: Promise<{ submitted?: string | string[] }>;
}

const choices: ReadonlyArray<{ type: VerificationType; href: string }> = [
  { type: 'TRAVELER', href: '/app/verifications/traveler' },
  { type: 'LOCAL', href: '/app/verifications/local' },
];

export default async function VerificationsPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  await requireUser('/app/verifications');
  const [verifications, query, messages] = await Promise.all([
    getMyVerifications(),
    searchParams,
    getMessages(),
  ]);
  const t = messages.verifications.page;
  const submitted =
    query.submitted === 'traveler'
      ? t.submittedTraveler
      : query.submitted === 'local'
        ? t.submittedLocal
        : null;
  // Pending is per city: a pending London request doesn't block Prague.
  const pendingKeys = new Set(
    verifications
      .filter((item) => item.status === 'PENDING')
      .map((item) => `${item.type}:${item.destination.id}`),
  );

  return (
    <Page>
      <PageHeader
        title={t.title}
        description={t.description}
        backHref="/app/profile"
        backLabel={t.backLabel}
      />

      <div className={styles.layout}>
        <div className={styles.column}>
          {submitted !== null && (
            <Notice tone="success" icon="check" role="status">
              <strong className={styles.reasonTitle}>{submitted}</strong>
              <span className={styles.reasonText}>{t.submittedBody}</span>
            </Notice>
          )}

          <section aria-labelledby="my-verifications">
            <SectionHead id="my-verifications" title={t.mine} />
            {verifications.length > 0 ? (
              <ul className={styles.list}>
                {verifications.map((item) => (
                  <li key={item.id}>
                    <VerificationStatusCard
                      verification={item}
                      canReapply={
                        !pendingKeys.has(`${item.type}:${item.destination.id}`)
                      }
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <Card padding="none">
                <EmptyState
                  icon="shield"
                  tone="iris"
                  title={t.emptyTitle}
                  description={t.emptyDescription}
                />
              </Card>
            )}
          </section>
        </div>

        <div className={styles.column}>
          <section aria-labelledby="new-verification">
            <SectionHead id="new-verification" title={t.apply} />
            <Card padding="list">
              {choices.map((choice) => (
                <ListRow
                  key={choice.type}
                  href={choice.href}
                  icon={choice.type === 'TRAVELER' ? 'map' : 'home'}
                  tone={choice.type === 'TRAVELER' ? 'magenta' : 'iris'}
                  title={
                    choice.type === 'TRAVELER' ? t.travelerTitle : t.localTitle
                  }
                  description={
                    choice.type === 'TRAVELER'
                      ? t.travelerDescription
                      : t.localDescription
                  }
                />
              ))}
            </Card>
          </section>

          <Notice tone="info" icon="lock">
            {t.privacyNotice}
          </Notice>
        </div>
      </div>
    </Page>
  );
}
