'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavIconName = 'home' | 'community' | 'nearby' | 'room' | 'profile';

interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
  matches: (pathname: string) => boolean;
}

const items: readonly NavItem[] = [
  {
    href: '/app/community',
    label: '커뮤니티',
    icon: 'community',
    matches: (pathname) => pathname.startsWith('/app/community'),
  },
  {
    href: '/app',
    label: '홈',
    icon: 'home',
    matches: (pathname) => pathname === '/app',
  },
  {
    href: '/app/nearby',
    label: '주변',
    icon: 'nearby',
    matches: (pathname) => pathname.startsWith('/app/nearby'),
  },
  {
    href: '/app/rooms/jeju',
    label: '실시간방',
    icon: 'room',
    matches: (pathname) => pathname.startsWith('/app/rooms'),
  },
  {
    href: '/app/profile',
    label: '프로필',
    icon: 'profile',
    matches: (pathname) => pathname.startsWith('/app/profile'),
  },
];

function NavIcon({ name }: { name: NavIconName }): React.JSX.Element {
  const paths: Readonly<Record<NavIconName, React.ReactNode>> = {
    home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3V10.5Z" />,
    community: (
      <>
        <path d="M4 5.5h16v11H8l-4 3v-14Z" />
        <path d="M8 9.5h8M8 12.5h5" />
      </>
    ),
    nearby: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    room: (
      <>
        <path d="M5 18.5a9.5 9.5 0 0 1 14 0M8 15a5.5 5.5 0 0 1 8 0" />
        <circle cx="12" cy="11" r="1" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function AppNavigation(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="appNavigation" aria-label="앱 메뉴">
      {items.map((item) => {
        const isActive = item.matches(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
          >
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
