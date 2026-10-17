'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppIcon, type AppIconName } from '@/components/common';
import { Wordmark } from '@/components/brand/wordmark';
import { Avatar } from '@/components/ui';
import styles from './shell.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: AppIconName;
  matches: (pathname: string) => boolean;
}

const items: readonly NavItem[] = [
  {
    href: '/app',
    label: '홈',
    icon: 'home',
    matches: (pathname) => pathname === '/app',
  },
  {
    href: '/app/rooms/jeju',
    label: '도움방',
    icon: 'room',
    matches: (pathname) =>
      pathname.startsWith('/app/rooms') ||
      pathname.startsWith('/app/questions'),
  },
  {
    href: '/app/community',
    label: '커뮤니티',
    icon: 'community',
    matches: (pathname) => pathname.startsWith('/app/community'),
  },
  {
    href: '/app/nearby',
    label: '주변',
    icon: 'map',
    matches: (pathname) => pathname.startsWith('/app/nearby'),
  },
  {
    href: '/app/profile',
    label: '내 정보',
    icon: 'user',
    matches: (pathname) =>
      pathname.startsWith('/app/profile') ||
      pathname.startsWith('/app/saved-places') ||
      pathname.startsWith('/app/verifications'),
  },
];

export function AppNavigation({
  nickname,
}: {
  nickname?: string;
}): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="앱 메뉴">
      <div className={styles.navBrand}>
        <Wordmark href="/app" />
      </div>
      <ul className={styles.navList}>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              className={styles.navItem}
              href={item.href}
              aria-current={item.matches(pathname) ? 'page' : undefined}
            >
              <AppIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      {nickname !== undefined && (
        <Link
          className={styles.navMe}
          href="/app/profile"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Avatar name={nickname} tone="plum" />
          <span>
            <strong>{nickname}</strong>
            <small>내 정보 보기</small>
          </span>
        </Link>
      )}
    </nav>
  );
}
