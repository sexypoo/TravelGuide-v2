import Link from 'next/link';
import { SignalHalo } from '@/components/brand/signal-halo';
import { Wordmark } from '@/components/brand/wordmark';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  alternateHref: '/auth/login' | '/auth/register';
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
    <main className="authPage">
      <section className="authStory" aria-label="서비스 소개">
        <div className="authStory__top">
          <Wordmark />
          <p>JEJU · REAL-TIME HELP</p>
        </div>
        <div className="authStory__body">
          <SignalHalo />
          <p className="authStory__eyebrow">제주에서 이어지는 현지의 답</p>
          <h2>
            낯선 순간에도,
            <br />
            혼자 판단하지 않도록.
          </h2>
          <p>인증된 여행자와 현지인이 제주 한 방에서 만납니다.</p>
        </div>
      </section>

      <section className="authContent" aria-labelledby="auth-title">
        <div className="authContent__inner">
          <Link className="authBack" href="/">
            <span aria-hidden="true">←</span> 처음으로
          </Link>
          <div className="authHeading">
            <p>{eyebrow}</p>
            <h1 id="auth-title">{title}</h1>
            <span>{description}</span>
          </div>
          {children}
          <p className="authAlternate">
            {alternatePrompt} <Link href={alternateHref}>{alternateLabel}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
