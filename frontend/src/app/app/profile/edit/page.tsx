import { Page, PageHeader } from '@/components/app/page';
import { AccountDeletionPanel } from '@/components/profile/account-deletion-panel';
import { ProfileForm } from '@/components/profile/profile-form';
import styles from '@/components/profile/profile-page.module.css';
import { Card } from '@/components/ui';
import { getOwnProfile } from '@/lib/api/profile.server';
import { requireUser } from '@/lib/auth/session';

export default async function ProfileEditPage(): Promise<React.JSX.Element> {
  await requireUser('/app/profile/edit');
  const profile = await getOwnProfile();

  return (
    <Page>
      <PageHeader
        title="프로필 수정"
        titleId="profile-edit-title"
        description="질문과 답변에서 다른 사용자에게 보이는 정보예요."
        backHref="/app/profile"
        backLabel="내 정보"
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
