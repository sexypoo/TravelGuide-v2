import { Page, PageHeader } from '@/components/app/page';
import { AccountDeletionPanel } from '@/components/profile/account-deletion-panel';
import { ProfileForm } from '@/components/profile/profile-form';
import styles from '@/components/profile/profile-page.module.css';
import { Card } from '@/components/ui';
import { getMessages } from '@/i18n/server';
import { getOwnProfile } from '@/lib/api/profile.server';
import { requireUser } from '@/lib/auth/session';

export default async function ProfileEditPage(): Promise<React.JSX.Element> {
  await requireUser('/app/profile/edit');
  const [profile, messages] = await Promise.all([
    getOwnProfile(),
    getMessages(),
  ]);
  const t = messages.profile.edit;

  return (
    <Page>
      <PageHeader
        title={t.title}
        titleId="profile-edit-title"
        description={t.description}
        backHref="/app/profile"
        backLabel={t.backLabel}
      />
      <div className={styles.narrow}>
        <Card aria-labelledby="profile-edit-title">
          <ProfileForm profile={profile} />
        </Card>
        <AccountDeletionPanel hasPassword={profile.hasPassword} />
      </div>
    </Page>
  );
}
