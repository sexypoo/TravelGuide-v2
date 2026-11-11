'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppIcon, type AppIconName } from '@/components/common';
import { Wordmark } from '@/components/brand/wordmark';
import { Avatar } from '@/components/ui';
import { LocaleSwitch } from '@/components/common/locale-switch';
import { useMessages } from '@/i18n/client';
import type { Messages } from '@/i18n/messages';
import styles from './shell.module.css';

interface NavItem {
  href: string;
  label: keyof Messages['shell'];
  icon: AppIconName;
  matches: (pathname: string) => boolean;
}

const items: readonly NavItem[] = [
  {
    href: '/app',
    label: 'home',
    icon: 'home',
    matches: (pathname) => pathname === '/app',
  },
  {
    href: '/app/rooms',
    label: 'rooms',
    icon: 'room',
    matches: (pathname) =>
      pathname.startsWith('/app/rooms') ||
      pathname.startsWith('/app/questions'),
  },
  {
    href: '/app/community',
    label: 'community',
    icon: 'community',
    matches: (pathname) => pathname.startsWith('/app/community'),
  },
  {
    href: '/app/nearby',
    label: 'nearby',
    icon: 'map',
    matches: (pathname) => pathname.startsWith('/app/nearby'),
  },
  {
    href: '/app/profile',
    label: 'profile',
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
  const t = useMessages();

  return (
    <nav className={styles.nav} aria-label={t.shell.navLabel}>
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
              <span>{t.shell[item.label]}</span>
            </Link>
          </li>
        ))}
      </ul>
      <LocaleSwitch className={styles.navLocale} />
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
            <small>{t.shell.viewProfile}</small>
          </span>
        </Link>
      )}
    </nav>
  );
}
