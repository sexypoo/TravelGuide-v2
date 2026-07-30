import Link from 'next/link';
import { ApiConnectionStatus } from '@/components/api-connection-status';
import { SignalHalo } from '@/components/brand/signal-halo';
import { Wordmark } from '@/components/brand/wordmark';

const steps = [
  {
    label: '인증',
    title: '서로의 자격을 먼저 확인해요',
    description:
      '여행 일정이나 제주 현지 거주를 확인한 사용자만 방에 참여합니다.',
  },
  {
    label: '질문',
    title: '지금 필요한 상황을 물어요',
    description:
      '교통, 영업 여부, 날씨처럼 검색만으로 부족한 상황을 질문합니다.',
  },
  {
    label: '답변',
    title: '여러 현지인의 판단을 받아요',
    description:
      '한 명과 매칭되지 않고, 인증된 현지인의 답을 비교해 결정합니다.',
  },
] as const;

export default function Home(): React.JSX.Element {
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
            <span aria-hidden="true" /> 제주 실시간 여행 도움방
          </p>
          <h1 id="landing-title">
            여행이 틀어지는 순간,
            <br />
            <em>지금 그곳을 아는 사람</em>에게 묻다.
          </h1>
          <p className="landingHero__description">
            검색 결과보다 지금의 제주가 필요할 때,
            <br /> 인증된 여행자와 현지인이 한 방에서 답을 나눕니다.
          </p>
          <div className="heroActions">
            <Link className="primaryLink" href="/auth/register">
              무료로 시작하기 <span aria-hidden="true">→</span>
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
              <strong>여행자의 질문</strong>
              <p>오늘 성산 쪽 바람이 많이 부나요?</p>
            </div>
          </div>
          <div className="signalCard signalCard--answer">
            <span className="verifiedDot" aria-hidden="true">
              ✓
            </span>
            <div>
              <strong>인증 현지인</strong>
              <p>오후부터 강해져요. 우도 배편을 먼저 확인하세요.</p>
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
          <span aria-hidden="true">i</span>
          <p>
            TravelGuide는 여행 판단을 돕는 서비스입니다. 긴급 구조나 의료 상담이
            필요하면 119 등 공식 기관에 먼저 연락해 주세요.
          </p>
        </div>
      </section>

      <footer className="landingFooter">
        <Wordmark />
        <p>제주의 변수에, 현지의 답.</p>
        <span>© 2026 TravelGuide</span>
      </footer>
    </main>
  );
}
