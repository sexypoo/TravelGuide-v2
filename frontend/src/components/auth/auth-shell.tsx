import Link from 'next/link';
import { AppIcon } from '@/components/common';
import { Wordmark } from '@/components/brand/wordmark';
import { safeNextPath } from '@/lib/auth/safe-next-path';
import styles from './auth.module.css';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  alternateHref: '/auth/login' | '/auth/register' | '/auth/forgot-password';
  alternateLabel: string;
  alternatePrompt: string;
  /** Where to go after auth; carried on the alternate link when not `/app`. */
  nextPath?: string;
  children: React.ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  alternateHref,
  alternateLabel,
  alternatePrompt,
  nextPath,
  children,
}: AuthShellProps): React.JSX.Element {
  const href = alternateLinkHref(alternateHref, nextPath);
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
            {alternatePrompt} <Link href={href}>{alternateLabel}</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

const defaultNextPath = '/app';

// Re-narrows `next` here too so the link can never carry an off-site target.
function alternateLinkHref(
  alternateHref: AuthShellProps['alternateHref'],
  nextPath: string | undefined,
): string {
  if (nextPath === undefined) return alternateHref;
  const next = safeNextPath(nextPath);
  if (next === defaultNextPath) return alternateHref;
  return `${alternateHref}?${new URLSearchParams({ next }).toString()}`;
}
