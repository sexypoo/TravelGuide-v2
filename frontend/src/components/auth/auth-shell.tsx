import Link from 'next/link';
import { AppIcon } from '@/components/common';
import { SignalHalo } from '@/components/brand/signal-halo';
import { Wordmark } from '@/components/brand/wordmark';

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
    <main className="authPage">
      <section className="authStory" aria-label="서비스 소개">
        <div className="authStory__top">
          <Wordmark />
          <p>TRAVEL NETWORK · LIVE HELP</p>
        </div>
        <div className="authStory__body">
          <SignalHalo />
          <p className="authStory__eyebrow">여행지에서 이어지는 사람들의 답</p>
          <h2>
            낯선 순간에도,
            <br />
            혼자 판단하지 않도록.
          </h2>
          <p>커뮤니티에서 나누고, 인증 도움방에서 지금을 확인합니다.</p>
        </div>
      </section>

      <section className="authContent" aria-labelledby="auth-title">
        <div className="authContent__inner">
          <Link className="authBack" href="/">
            <AppIcon name="arrow-left" /> 처음으로
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
