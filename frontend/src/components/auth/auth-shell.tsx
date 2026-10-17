import Link from 'next/link';
import { AppIcon } from '@/components/common';
import { Wordmark } from '@/components/brand/wordmark';
import styles from './auth.module.css';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  alternateHref: '/auth/login' | '/auth/register' | '/auth/forgot-password';
  alternateLabel: string;
  alternatePrompt: string;
  children: React.ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  alternateHref,
  alternateLabel,
  alternatePrompt,
  children,
}: AuthShellProps): React.JSX.Element {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.top}>
          <Link className={styles.back} href="/">
            <AppIcon name="arrow-left" /> 처음으로
          </Link>
          <Wordmark />
        </header>

        <section className={styles.content} aria-labelledby="auth-title">
          <div className={styles.heading}>
            <p>{eyebrow}</p>
            <h1 id="auth-title">{title}</h1>
            <span>{description}</span>
          </div>
          <div className={styles.card}>{children}</div>
          <p className={styles.alternate}>
            {alternatePrompt} <Link href={alternateHref}>{alternateLabel}</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
