'use client';

import Link from 'next/link';
import { AppIcon } from '@/components/common';
import { useMessages } from '@/i18n/client';
import styles from './wordmark.module.css';

export function Wordmark({
  href = '/',
  inverse = false,
}: {
  href?: string;
  inverse?: boolean;
}): React.JSX.Element {
  const t = useMessages();
  return (
    <Link
      className={`${styles.wordmark}${inverse ? ` ${styles.inverse}` : ''}`}
      href={href}
      aria-label={t.common.brandHome}
    >
      <span className={styles.mark} aria-hidden="true">
        <AppIcon name="mark" />
      </span>
      <span className={styles.name}>
        여<b>JJU</b>
      </span>
    </Link>
  );
}
