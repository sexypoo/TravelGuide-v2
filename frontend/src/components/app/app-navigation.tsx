'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavIconName = 'home' | 'verify' | 'room' | 'profile';

interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
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
    href: '/app/verifications',
    label: '인증',
    icon: 'verify',
    matches: (pathname) => pathname.startsWith('/app/verifications'),
  },
  {
    href: '/app/rooms/jeju',
    label: '제주방',
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
    verify: (
      <>
        <path d="M12 3 5 6v5c0 4.7 2.9 8.4 7 10 4.1-1.6 7-5.3 7-10V6l-7-3Z" />
        <path d="m9.2 12.2 1.8 1.8 3.9-4.2" />
      </>
    ),
    room: (
      <>
        <path d="M4 5.5h16v11H8l-4 3v-14Z" />
        <path d="M8 10h8M8 13h5" />
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
