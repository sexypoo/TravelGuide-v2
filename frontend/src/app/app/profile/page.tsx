import Link from 'next/link';
import { ProfileForm } from '@/components/profile/profile-form';
import { TravelRecordsPanel } from '@/components/profile/travel-records-panel';
import { getOwnProfile } from '@/lib/api/profile.server';
import { AppIcon } from '@/components/common';
import { AccountDeletionPanel } from '@/components/profile/account-deletion-panel';
import styles from '@/components/profile/profile.module.css';

function formatJoinDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

const shortcuts = [
  {
    title: '찜한 장소',
    description: '실시간방에서 추천받고 저장한 장소를 다시 봐요.',
    href: '/app/saved-places',
  },
  {
    title: '참여 자격',
    description: '여행자·현지인 인증 상태를 확인하고 신청해요.',
    href: '/app/verifications',
  },
] as const;

export default async function ProfilePage(): Promise<React.JSX.Element> {
  const profile = await getOwnProfile();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 id="profile-title">프로필</h1>
        <p id="profile-lede">
          {profile.email}로 {formatJoinDate(profile.createdAt)}에 가입했어요.
          이메일은 다른 사용자에게 보이지 않아요.
        </p>
      </header>

      <ul className={`${styles.rows} ${styles.shortcuts}`}>
        {shortcuts.map((shortcut) => (
          <li key={shortcut.href}>
            <Link className={styles.shortcut} href={shortcut.href}>
              <span>
                <strong>{shortcut.title}</strong>
                <span>{shortcut.description}</span>
              </span>
              <AppIcon name="arrow-right" />
            </Link>
          </li>
        ))}
      </ul>

      <section className={styles.section} aria-labelledby="profile-edit-title">
        <header className={styles.sectionHeader}>
          <div>
            <h2 id="profile-edit-title">공개 정보</h2>
            <p>질문과 답변에서 다른 사용자에게 보이는 정보예요.</p>
          </div>
        </header>
        <ProfileForm profile={profile} />
      </section>

      <TravelRecordsPanel />
      <AccountDeletionPanel hasPassword={profile.hasPassword} />
    </div>
  );
}
