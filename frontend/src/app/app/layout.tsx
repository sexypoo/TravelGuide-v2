import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';
import { Wordmark } from '@/components/brand/wordmark';
import { requireUser } from '@/lib/auth/session';

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
  const user = await requireUser('/app');
  const initial = Array.from(user.nickname)[0] ?? '여';

  return (
    <div className="appShell">
      <header className="appHeader">
        <Wordmark />
        <div className="appHeader__profile">
          <span className="avatar" aria-hidden="true">
            {initial}
          </span>
          <div>
            <strong>{user.nickname}</strong>
            <span>{user.email}</span>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="appContent">{children}</main>
      <footer className="appFooter">
        <Link aria-current="page" href="/app">
          <span aria-hidden="true">⌂</span> 홈
        </Link>
      </footer>
    </div>
  );
}
