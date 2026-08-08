import Link from 'next/link';
import { AppFrame } from '@/components/app/app-frame';
import { AppNavigation } from '@/components/app/app-navigation';
import { LogoutButton } from '@/components/auth/logout-button';
import { Wordmark } from '@/components/brand/wordmark';
import { AppProviders } from '@/components/providers/app-providers';
import { requireUser } from '@/lib/auth/session';

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
  const user = await requireUser('/app');
  const initial = Array.from(user.nickname)[0] ?? '여';

  return (
    <AppFrame
      chrome={
        <>
          <header className="appHeader">
            <Wordmark />
            <div className="appHeader__profile">
              <Link className="appProfileLink" href="/app/profile">
                <span className="avatar" aria-hidden="true">
                  {initial}
                </span>
                <span>
                  <strong>{user.nickname}</strong>
                  <small>내 프로필</small>
                </span>
              </Link>
              <LogoutButton />
            </div>
          </header>
          <AppNavigation />
        </>
      }
    >
      <AppProviders currentUserId={user.id}>{children}</AppProviders>
    </AppFrame>
  );
}
