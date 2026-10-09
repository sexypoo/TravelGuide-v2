import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';
import { Wordmark } from '@/components/brand/wordmark';
import styles from './admin.module.css';

type AdminSection = 'verifications' | 'reports' | 'metrics';

const sections: ReadonlyArray<{
  id: AdminSection;
  label: string;
  href: string;
}> = [
  { id: 'verifications', label: '인증 심사', href: '/admin' },
  { id: 'reports', label: '신고 관리', href: '/admin/reports' },
  { id: 'metrics', label: '서비스 지표', href: '/admin/metrics' },
];

export function AdminFrame({
  adminNickname,
  current,
  title,
  description,
  children,
}: {
  adminNickname: string;
  current: AdminSection;
  title: string;
  description: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <main className={styles.shell}>
      <header className={styles.topBar}>
        <Wordmark />
        <div>
          <span>{adminNickname} 관리자</span>
          <Link href="/app">사용자 화면</Link>
          <LogoutButton />
        </div>
      </header>
      <header className={styles.heading}>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <nav className={styles.tabs} aria-label="관리자 메뉴">
        {sections.map((section) =>
          section.id === current ? (
            <span key={section.id} aria-current="page">
              {section.label}
            </span>
          ) : (
            <Link key={section.id} href={section.href}>
              {section.label}
            </Link>
          ),
        )}
      </nav>
      {children}
    </main>
  );
}
