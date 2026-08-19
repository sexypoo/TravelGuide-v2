import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ApiConnectionStatus } from '@/components/api-connection-status';
import { Wordmark } from '@/components/brand/wordmark';
import { AppIcon, type AppIconName } from '@/components/common';
import { getCurrentUser } from '@/lib/auth/session';

const entryLinks: ReadonlyArray<{
  title: string;
  description: string;
  href: string;
  icon: AppIconName;
}> = [
  {
    title: '제주 실시간 도움방',
    description: '인증 참여자에게 지금 상황을 물어보세요.',
    href: '/auth/login?next=%2Fapp%2Frooms%2Fjeju',
    icon: 'live',
  },
  {
    title: '여행자 커뮤니티',
    description: '여행 질문과 경험을 편하게 나눠보세요.',
    href: '/auth/login?next=%2Fapp%2Fcommunity',
    icon: 'crowd',
  },
  {
    title: '여행자·현지인 인증',
    description: '도움방에 참여할 자격을 확인하고 신청하세요.',
    href: '/auth/login?next=%2Fapp%2Fverifications',
    icon: 'shield',
  },
] as const;

const flow = ['인증', '질문', '답변'] as const;

export default async function Home(): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (user !== null) {
    redirect(user.isAdmin ? '/admin' : '/app');
  }

  return (
    <main className="guestHome">
      <header className="guestHome__header">
        <Wordmark />
        <Link className="guestHome__headerLogin" href="/auth/login">
          로그인
        </Link>
      </header>

      <div className="guestHome__body">
        <section className="guestHome__welcome" aria-labelledby="guest-title">
          <p className="guestHome__eyebrow">
            <span aria-hidden="true" /> JEJU LIVE HELP
          </p>
          <h1 id="guest-title">
            로그인하고,
            <br /> 여행지의 지금을 확인하세요.
          </h1>
          <p className="guestHome__description">
            여행이 틀어지는 순간, 지금 그곳을 아는 사람에게 묻다.
          </p>

          <div className="guestHome__actions">
            <Link className="guestHome__primary" href="/auth/login">
              로그인 <AppIcon name="arrow-right" />
            </Link>
            <Link className="guestHome__register" href="/auth/register">
              처음이신가요? <strong>계정 만들기</strong>
            </Link>
          </div>

          <ol className="guestHome__flow" aria-label="서비스 이용 순서">
            {flow.map((step) => (
              <li key={step}>
                <span aria-hidden="true" />
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
        </section>

        <section className="guestHome__access" aria-labelledby="access-title">
          <header>
            <p>로그인 후 이용할 수 있어요</p>
            <h2 id="access-title">어디서 시작할까요?</h2>
          </header>
          <nav aria-label="로그인 후 이용할 메뉴">
            {entryLinks.map((entry) => (
              <Link
                className="guestHome__entry"
                href={entry.href}
                key={entry.href}
              >
                <span className="guestHome__entryIcon" aria-hidden="true">
                  <AppIcon name={entry.icon} />
                </span>
                <span className="guestHome__entryCopy">
                  <strong>{entry.title}</strong>
                  <small>{entry.description}</small>
                </span>
                <AppIcon name="arrow-right" />
              </Link>
            ))}
          </nav>
        </section>
      </div>

      <footer className="guestHome__footer">
        <ApiConnectionStatus />
        <div className="guestHome__safety">
          <span aria-hidden="true">
            <AppIcon name="info" />
          </span>
          <p>
            긴급 구조나 의료 상담이 필요하면 119 등 공식 기관에 먼저 연락해
            주세요.
          </p>
          <nav className="guestHome__legal" aria-label="정책 안내">
            <Link href="/privacy">개인정보 처리방침</Link>
            <Link href="/account-deletion">계정 삭제</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
