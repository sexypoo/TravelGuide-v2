import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';

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
    <main className="legalPage">
      <header className="legalPage__nav">
        <Link href="/" aria-label="여쭈어 홈">
          <Wordmark />
        </Link>
        <nav aria-label="정책 문서">
          <Link href="/privacy">개인정보 처리방침</Link>
          <Link href="/account-deletion">계정 삭제</Link>
          <Link href="/auth/login">로그인</Link>
        </nav>
      </header>
      <article className="legalDocument">
        <header className="legalDocument__intro">
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{description}</span>
        </header>
        {children}
      </article>
    </main>
  );
}
