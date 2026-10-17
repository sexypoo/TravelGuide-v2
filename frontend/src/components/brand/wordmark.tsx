import Link from 'next/link';
import { AppIcon } from '@/components/common';
import styles from './wordmark.module.css';

export function Wordmark({
  href = '/',
  inverse = false,
}: {
  href?: string;
  inverse?: boolean;
}): React.JSX.Element {
  return (
    <Link
      className={`${styles.wordmark}${inverse ? ` ${styles.inverse}` : ''}`}
      href={href}
      aria-label="여쭈어 홈"
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
