import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';
import styles from './legal.module.css';

interface LegalShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function LegalShell({
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
          <nav aria-label="정책 문서">
            <Link href="/privacy">개인정보 처리방침</Link>
            <Link href="/account-deletion">계정 삭제</Link>
            <Link href="/auth/login">로그인</Link>
          </nav>
        </header>
        <article className={styles.document}>
          <header className={styles.intro}>
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{description}</span>
          </header>
          {children}
        </article>
      </div>
    </main>
  );
}
