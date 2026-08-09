import type { ReactNode } from 'react';

export type AppIconName =
  | 'add'
  | 'alert'
  | 'arrow-left'
  | 'arrow-right'
  | 'check'
  | 'clock'
  | 'close'
  | 'crowd'
  | 'door'
  | 'external'
  | 'heart'
  | 'heart-filled'
  | 'image'
  | 'info'
  | 'live'
  | 'minus'
  | 'pin'
  | 'send'
  | 'shield'
  | 'sparkle'
  | 'topic'
  | 'refresh';

const paths: Readonly<Record<AppIconName, ReactNode>> = {
  add: <path d="M12 5v14M5 12h14" />,
  alert: (
    <>
      <path d="M10.3 4.1 2.7 17.3A1.8 1.8 0 0 0 4.3 20h15.4a1.8 1.8 0 0 0 1.6-2.7L13.7 4.1a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  'arrow-left': <path d="M19 12H5m6-6-6 6 6 6" />,
  'arrow-right': <path d="M5 12h14m-6-6 6 6-6 6" />,
  check: <path d="m5.5 12.5 4.2 4.2L18.8 7.6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.2 1.8" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  crowd: (
    <>
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16.5" cy="9.5" r="2" />
      <path d="M3.8 18c.4-3 2-4.5 4.2-4.5s3.8 1.5 4.2 4.5M13.2 14.5c.8-.8 1.9-1.2 3.3-1.2 2 0 3.4 1.3 3.7 3.8" />
    </>
  ),
  door: (
    <>
      <path d="M6 20V5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5V20" />
      <path d="M4 20h16" />
      <circle cx="14.5" cy="12" r=".7" fill="currentColor" stroke="none" />
    </>
  ),
  external: (
    <>
      <path d="M14 5h5v5M19 5l-8 8" />
      <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  heart: (
    <path d="M20.8 8.4c0 5-8.8 10.3-8.8 10.3S3.2 13.4 3.2 8.4A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.8 1.4Z" />
  ),
  'heart-filled': (
    <path
      fill="currentColor"
      d="M20.8 8.4c0 5-8.8 10.3-8.8 10.3S3.2 13.4 3.2 8.4A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.8 1.4Z"
    />
  ),
  image: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m5.5 17 4.1-4.2 2.8 2.8 2.2-2.1 3.9 3.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 10.5V17M12 7h.01" />
    </>
  ),
  live: <path d="M3 12h4l2.2-5 4.1 10 2.1-5H21" />,
  minus: <path d="M6 12h12" />,
  pin: (
    <>
      <path d="M19 10c0 4.5-7 10-7 10s-7-5.5-7-10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  send: (
    <>
      <path d="m4 5 16 7-16 7 2.7-7L4 5Z" />
      <path d="M7 12h13" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5.5 5.8v4.8c0 4.4 2.6 7.8 6.5 9.4 3.9-1.6 6.5-5 6.5-9.4V5.8L12 3Z" />
      <path d="m9.2 11.9 1.8 1.8 3.8-4" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5c.5 4.4 2.6 6.5 7 7-4.4.5-6.5 2.6-7 7-.5-4.4-2.6-6.5-7-7 4.4-.5 6.5-2.6 7-7Z" />
      <path d="M18.5 16.5c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5Z" />
    </>
  ),
  topic: (
    <>
      <path d="M4 5.5h16v11H9l-5 3.5V5.5Z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  refresh: (
    <>
      <path d="M19 8a7.5 7.5 0 1 0 .4 7" />
      <path d="M19 4v4h-4" />
    </>
  ),
};

export function AppIcon({
  name,
  className,
}: {
  name: AppIconName;
  className?: string;
}): React.JSX.Element {
  return (
    <svg
      className={className === undefined ? 'appIcon' : `appIcon ${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
