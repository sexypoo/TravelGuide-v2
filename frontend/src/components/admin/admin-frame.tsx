import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';
import { Wordmark } from '@/components/brand/wordmark';
import { AppIcon, type AppIconName } from '@/components/common';
import { Avatar } from '@/components/ui';
import styles from './admin.module.css';

type AdminSection = 'verifications' | 'reports' | 'metrics';

const sections: ReadonlyArray<{
  id: AdminSection;
  label: string;
  href: string;
  icon: AppIconName;
}> = [
  { id: 'verifications', label: '인증 심사', href: '/admin', icon: 'shield' },
  { id: 'reports', label: '신고 관리', href: '/admin/reports', icon: 'alert' },
  { id: 'metrics', label: '운영 지표', href: '/admin/metrics', icon: 'clock' },
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
    <div className={styles.shell}>
      <aside className={styles.side}>
        <div className={styles.brand}>
          <Wordmark href="/admin" />
          <span className={styles.brandTag}>운영</span>
        </div>
        <nav className={styles.nav} aria-label="관리자 메뉴">
          <ul className={styles.navList}>
            {sections.map((section) => (
              <li key={section.id}>
                <Link
                  className={styles.navItem}
                  href={section.href}
                  aria-current={section.id === current ? 'page' : undefined}
                >
                  <AppIcon name={section.icon} />
                  <span>{section.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link className={styles.toApp} href="/app">
            <AppIcon name="arrow-left" />
            <span>앱으로</span>
          </Link>
        </nav>
        <div className={styles.account}>
          <span className={styles.accountName}>
            <Avatar name={adminNickname} size="sm" tone="plum" />
            <span>{adminNickname} 관리자</span>
          </span>
          <LogoutButton />
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.heading}>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </main>
    </div>
  );
}
