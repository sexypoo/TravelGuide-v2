import { Page, PageHeader } from '@/components/app/page';
import styles from '@/components/profile/profile-page.module.css';
import { Avatar, Card, Chip, ListRow } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import { getLocale, getMessages } from '@/i18n/server';
import { getPublicContributorProfile } from '@/lib/api/profile.server';
import { requireUser } from '@/lib/auth/session';
import { destinationName, intlLocale } from '@/lib/verifications/presentation';

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    year: 'numeric',
    month: 'long',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  await requireUser(`/app/users/${encodeURIComponent(id)}`);
  const [profile, messages, locale] = await Promise.all([
    getPublicContributorProfile(id),
    getMessages(),
    getLocale(),
  ]);
  const t = messages.profile.public;
  const local = profile.isVerifiedLocal && profile.verifiedDestination !== null;

  return (
    <Page>
      <PageHeader title={t.title} backHref="/app" backLabel={t.backLabel} />
      <div className={styles.narrow}>
        <Card className={styles.me} aria-labelledby="profile-name">
          <div className={styles.meHead}>
            <Avatar
              name={profile.nickname}
              imageUrl={profile.profileImageUrl}
              size="lg"
              tone={local ? 'iris' : 'magenta'}
            />
            <div className={styles.meText}>
              <strong id="profile-name">{profile.nickname}</strong>
              {local && profile.verifiedDestination !== null ? (
                <Chip tone="local" icon="shield">
                  {t.verifiedLocal(
                    destinationName(profile.verifiedDestination, locale),
                  )}
                </Chip>
              ) : (
                <Chip tone="traveler" icon="pin">
                  {t.travelerContributor}
                </Chip>
              )}
            </div>
          </div>
          <p className={profile.bio ? styles.bio : styles.bioEmpty}>
            {profile.bio ?? t.bioEmpty}
          </p>
          <dl className={styles.stats} aria-label={t.statsLabel}>
            <div>
              <dt>{messages.profile.page.answerCount}</dt>
              <dd>{profile.stats.answerCount}</dd>
            </div>
            <div>
              <dt>{messages.profile.page.acceptedAnswerCount}</dt>
              <dd>{profile.stats.acceptedAnswerCount}</dd>
            </div>
          </dl>
        </Card>

        <Card padding="list" aria-label={t.activityLabel}>
          <ListRow
            icon="clock"
            tone="neutral"
            title={t.joinedSince(formatDate(profile.joinedAt, locale))}
            chevron={false}
          />
          {local && (
            <ListRow
              icon="shield"
              tone="iris"
              title={
                profile.verifiedAt === null
                  ? t.verifiedRegion
                  : t.verifiedOn(formatDate(profile.verifiedAt, locale))
              }
              description={t.verifiedDescription}
              chevron={false}
            />
          )}
        </Card>

        <p className={styles.bioEmpty}>{t.statsNote}</p>
      </div>
    </Page>
  );
}
