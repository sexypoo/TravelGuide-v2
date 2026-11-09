import Link from 'next/link';
import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand/wordmark';
import { LocaleSwitch } from '@/components/common/locale-switch';
import { getMessages } from '@/i18n/server';
import styles from './test.module.css';

/**
 * Signed-out frame for the travel type test (#42): logo, language, login,
 * one column.
 */
export async function TestShell({
  children,
}: {
  children: ReactNode;
}): Promise<React.JSX.Element> {
  const t = await getMessages();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Wordmark />
        <div className={styles.headerActions}>
          <LocaleSwitch />
          <Link className={styles.login} href="/auth/login">
            {t.common.login}
          </Link>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
