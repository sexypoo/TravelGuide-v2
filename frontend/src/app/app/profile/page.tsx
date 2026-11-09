import { Page, PageHeader } from '@/components/app/page';
import { LogoutButton } from '@/components/auth/logout-button';
import { LocaleSwitch } from '@/components/common/locale-switch';
import { TravelRecordsPanel } from '@/components/profile/travel-records-panel';
import styles from '@/components/profile/profile-page.module.css';
import { Avatar, ButtonLink, Card, Chip, ListRow } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Messages } from '@/i18n/messages';
import { getLocale, getMessages } from '@/i18n/server';
import {
  getOwnProfile,
  getPublicContributorProfile,
} from '@/lib/api/profile.server';
import type { Verification } from '@/lib/api/verifications';
import { getMyVerifications } from '@/lib/api/verifications.server';
import { requireUser } from '@/lib/auth/session';
import { destinationName } from '@/lib/verifications/presentation';

function VerificationChip({
  verification,
  t,
  locale,
}: {
  verification: Verification | undefined;
  t: Messages['profile']['chip'];
  locale: Locale;
}): React.JSX.Element {
  if (verification === undefined) return <Chip icon="info">{t.none}</Chip>;
  const local = verification.type === 'LOCAL';
  if (verification.status === 'PENDING') {
    return (
      <Chip tone="warning" icon="clock">
        {local ? t.pendingLocal : t.pendingTraveler}
      </Chip>
    );
  }
  const city = destinationName(verification.destination, locale);
  return (
    <Chip tone={local ? 'local' : 'traveler'} icon="check">
      {local ? t.approvedLocal(city) : t.approvedTraveler(city)}
    </Chip>
  );
}

export default async function ProfilePage(): Promise<React.JSX.Element> {
  const user = await requireUser('/app/profile');
  const [profile, verifications, contributor, messages, locale] =
    await Promise.all([
      getOwnProfile(),
      getMyVerifications(),
      getPublicContributorProfile(user.id).catch(() => null),
      getMessages(),
      getLocale(),
    ]);
  const t = messages.profile.page;
  const current =
    verifications.find((item) => item.status === 'APPROVED') ??
    verifications.find((item) => item.status === 'PENDING');

  return (
    <Page>
      <PageHeader title={t.title} titleId="profile-title" />

      <div className={styles.grid}>
        <div className={styles.column}>
          <Card className={styles.me} aria-label={t.meLabel}>
            <div className={styles.meHead}>
              <Avatar
                name={profile.nickname}
                imageUrl={profile.profileImageUrl}
                size="lg"
                tone="plum"
              />
              <div className={styles.meText}>
                <strong>{profile.nickname}</strong>
                <VerificationChip
                  verification={current}
                  t={messages.profile.chip}
                  locale={locale}
                />
              </div>
              <ButtonLink
                href="/app/profile/edit"
                variant="secondary"
                size="sm"
              >
                {t.edit}
              </ButtonLink>
            </div>
            <p className={profile.bio ? styles.bio : styles.bioEmpty}>
              {profile.bio ?? t.bioEmpty}
            </p>
            {profile.travelStyles.length > 0 && (
              <ul className={styles.tags} aria-label={t.travelStylesLabel}>
                {profile.travelStyles.map((style) => (
                  <li key={style}>
                    <Chip tone="plum">
                      {messages.profile.travelStyles[style]}
                    </Chip>
                  </li>
                ))}
              </ul>
            )}
            {contributor !== null && (
              <dl className={styles.stats}>
                <div>
                  <dt>{t.answerCount}</dt>
                  <dd>{contributor.stats.answerCount}</dd>
                </div>
                <div>
                  <dt>{t.acceptedAnswerCount}</dt>
                  <dd>{contributor.stats.acceptedAnswerCount}</dd>
                </div>
              </dl>
            )}
          </Card>

          <Card padding="list" aria-label={t.shortcutsLabel}>
            <ListRow
              href="/app/saved-places"
              icon="heart"
              tone="magenta"
              title={t.savedPlaces}
              description={t.savedPlacesDescription}
            />
            <ListRow
              href="/app/verifications"
              icon="shield"
              tone="plum"
              title={t.qualification}
              description={t.qualificationDescription}
            />
            <ListRow
              href={`/app/users/${profile.id}`}
              icon="user"
              tone="iris"
              title={t.publicProfile}
              description={t.publicProfileDescription}
            />
          </Card>
        </div>

        <div className={styles.column}>
          <TravelRecordsPanel />

          <Card padding="list" aria-labelledby="account-title">
            <h2 className="srOnly" id="account-title">
              {t.account}
            </h2>
            <ListRow
              icon="settings"
              title={t.language}
              description={t.languageDescription}
              trailing={<LocaleSwitch />}
              chevron={false}
            />
            <ListRow
              icon="lock"
              title={t.loginEmail}
              description={t.emailPrivate(profile.email)}
              chevron={false}
            />
            <ListRow
              href="/app/profile/edit"
              icon="settings"
              title={t.manage}
              description={t.manageDescription}
            />
            <ListRow href="/privacy" icon="info" title={t.privacy} />
          </Card>

          <LogoutButton />
        </div>
      </div>
    </Page>
  );
}
