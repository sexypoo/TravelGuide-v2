import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';
import { LocaleSwitch } from '@/components/common/locale-switch';
import type { Messages } from '@/i18n/messages';
import styles from './legal.module.css';

interface LegalShellProps {
  copy: Messages['legal']['shell'];
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function LegalShell({
  copy,
  eyebrow,
  title,
  description,
  children,
}: LegalShellProps): React.JSX.Element {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.nav}>
          <Wordmark />
          <nav aria-label={copy.navLabel}>
            <LocaleSwitch />
            <Link href="/privacy">{copy.privacy}</Link>
            <Link href="/account-deletion">{copy.accountDeletion}</Link>
            <Link href="/auth/login">{copy.login}</Link>
          </nav>
        </header>
        <article className={styles.document}>
          <header className={styles.intro}>
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{description}</span>
            {copy.translationNotice !== '' && (
              <small className={styles.translationNotice}>
                {copy.translationNotice}
              </small>
            )}
          </header>
          {children}
        </article>
      </div>
    </main>
  );
}
