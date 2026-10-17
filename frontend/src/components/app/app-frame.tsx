'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './shell.module.css';

interface AppFrameProps {
  chrome: React.ReactNode;
  children: React.ReactNode;
}

export function isRoomDetailPath(pathname: string): boolean {
  return /^\/app\/rooms\/[^/]+(?:\/|$)/u.test(pathname);
}

function useRoomViewportHeight(enabled: boolean): number | undefined {
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    if (!enabled) return undefined;
    const viewport = window.visualViewport;
    const updateHeight = (): void => {
      const visualHeight = viewport?.height;
      const nextHeight = Math.max(
        1,
        Math.floor(
          visualHeight === undefined
            ? window.innerHeight
            : Math.min(visualHeight, window.innerHeight),
        ),
      );
      setHeight((current) => (current === nextHeight ? current : nextHeight));
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    viewport?.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      viewport?.removeEventListener('resize', updateHeight);
    };
  }, [enabled]);

  return height;
}

export function AppFrame({
  chrome,
  children,
}: AppFrameProps): React.JSX.Element {
  const pathname = usePathname();
  const roomFocused = isRoomDetailPath(pathname);
  const roomViewportHeight = useRoomViewportHeight(roomFocused);

  return (
    <div
      className={`${styles.shell}${roomFocused ? ` ${styles['shell--focus']}` : ''}`}
      data-room-focused={roomFocused || undefined}
      style={
        roomFocused && roomViewportHeight !== undefined
          ? { height: `${roomViewportHeight}px` }
          : undefined
      }
    >
      {!roomFocused && chrome}
      <main
        className={styles.content}
        data-room-focused={roomFocused || undefined}
      >
        {children}
      </main>
    </div>
  );
}
