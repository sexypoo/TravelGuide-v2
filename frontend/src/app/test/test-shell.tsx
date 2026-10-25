import Link from 'next/link';
import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand/wordmark';
import styles from './test.module.css';

/** Signed-out frame for the travel type test (#42): logo, login, one column. */
export function TestShell({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Wordmark />
        <Link className={styles.login} href="/auth/login">
          로그인
        </Link>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
