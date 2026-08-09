import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ApiConnectionStatus } from '@/components/api-connection-status';
import { SignalHalo } from '@/components/brand/signal-halo';
import { Wordmark } from '@/components/brand/wordmark';
import { AppIcon } from '@/components/common';
import { getCurrentUser } from '@/lib/auth/session';

const steps = [
  {
    label: '인증',
    title: '서로의 자격을 먼저 확인해요',
    description:
      '여행 일정이나 지역 생활을 확인한 사용자만 실시간 도움방에 참여합니다.',
  },
  {
    label: '질문',
    title: '지금 필요한 상황을 물어요',
    description:
      '교통, 영업 여부, 날씨처럼 검색만으로 부족한 상황을 질문합니다.',
  },
  {
    label: '답변',
    title: '직접 겪은 답을 비교해요',
    description:
      '여행 중인 사람의 방금 경험과 인증 현지인의 생활 추천을 함께 보고 결정합니다.',
  },
] as const;

const trustSignals = [
  '여행 중 방금 확인한 정보',
  '인증 현지인의 생활 추천',
  '광고성 글 신고·관리',
] as const;

export default async function Home(): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (user !== null) {
    redirect(user.isAdmin ? '/admin' : '/app');
  }

  return (
    <main className="landingPage">
      <header className="landingHeader">
        <Wordmark />
        <nav aria-label="인증 메뉴">
          <Link className="textButton" href="/auth/login">
            로그인
          </Link>
          <Link className="compactButton" href="/auth/register">
            시작하기
          </Link>
        </nav>
      </header>

      <section className="landingHero" aria-labelledby="landing-title">
        <div className="landingHero__copy">
          <p className="heroEyebrow">
            <span aria-hidden="true" /> 광고성 추천보다, 직접 겪은 사람의 답
          </p>
          <h1 id="landing-title">
            여행이 틀어지는 순간,
            <br />
            <em>지금 그곳을 아는 사람</em>에게 묻다.
          </h1>
          <p className="landingHero__description">
            여행 중인 사람의 방금 겪은 경험과,
            <br /> 인증 현지인의 생활 속 추천을 한 방에서 비교해 보세요.
          </p>
          <ul className="trustSignals" aria-label="신뢰할 수 있는 정보 기준">
            {trustSignals.map((signal) => (
              <li key={signal}>
                <span aria-hidden="true">
                  <AppIcon name="check" />
                </span>
                {signal}
              </li>
            ))}
          </ul>
          <div className="heroActions">
            <Link className="primaryLink" href="/auth/register">
              무료로 시작하기 <AppIcon name="arrow-right" />
            </Link>
            <Link className="secondaryLink" href="/auth/login">
              이미 계정이 있어요
            </Link>
          </div>
        </div>

        <div className="landingHero__visual">
          <SignalHalo />
          <div className="signalCard signalCard--question">
            <span className="signalCard__icon" aria-hidden="true">
              ?
            </span>
            <div>
              <strong>여행 중인 사람 · 방금 전</strong>
              <p>
                협재 해변 앞은 주차 줄이 길어요. 서쪽 공영 주차장은 여유 있어요.
              </p>
            </div>
          </div>
          <div className="signalCard signalCard--answer">
            <span className="verifiedDot" aria-hidden="true">
              <AppIcon name="check" />
            </span>
            <div>
              <strong>인증 현지인 · 생활 추천</strong>
              <p>
                해변 앞보다 옹포리 쪽 식당이 덜 붐비고, 저녁 현지인들이 자주
                가요.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="howSection" aria-labelledby="how-title">
        <div className="sectionHeading">
          <p>이용 방법</p>
          <h2 id="how-title">필요한 답까지, 세 단계면 충분해요</h2>
        </div>
        <ol className="stepGrid">
          {steps.map((step) => (
            <li key={step.label}>
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landingFootnote" aria-label="서비스 상태와 안전 안내">
        <ApiConnectionStatus />
        <div className="safetyNote">
          <span aria-hidden="true">
            <AppIcon name="info" />
          </span>
          <p>
            TravelGuide는 여행 판단을 돕는 서비스입니다. 긴급 구조나 의료 상담이
            필요하면 119 등 공식 기관에 먼저 연락해 주세요.
          </p>
        </div>
      </section>

      <footer className="landingFooter">
        <Wordmark />
        <p>여행의 변수에, 사람들의 답.</p>
        <span>© 2026 TravelGuide</span>
      </footer>
    </main>
  );
}
