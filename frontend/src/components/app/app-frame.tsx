'use client';

import { usePathname } from 'next/navigation';

interface AppFrameProps {
  chrome: React.ReactNode;
  children: React.ReactNode;
}

export function isRoomDetailPath(pathname: string): boolean {
  return /^\/app\/rooms\/[^/]+(?:\/|$)/u.test(pathname);
}

export function AppFrame({
  chrome,
  children,
}: AppFrameProps): React.JSX.Element {
  const pathname = usePathname();
  const roomFocused = isRoomDetailPath(pathname);

  return (
    <div className={`appShell${roomFocused ? ' appShell--room' : ''}`}>
      {!roomFocused && chrome}
      <main
        className={`appContent${roomFocused ? ' appContent--room' : ''}`}
        data-room-focused={roomFocused || undefined}
      >
        {children}
      </main>
    </div>
  );
}
