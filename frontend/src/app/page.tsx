import { ApiConnectionStatus } from '@/components/api-connection-status';

export default function Home(): React.JSX.Element {
  return (
    <main className="pageShell">
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="TravelGuide 홈">
          <span>TG</span>
          <span className="wordmark__place">JEJU · KR</span>
        </a>
        <p className="buildMark">
          <span aria-hidden="true" /> web signal / t00
        </p>
      </header>

      <div className="hero" id="top">
        <section className="heroCopy" aria-labelledby="hero-title">
          <p className="eyebrow">제주 실시간 여행 도움방</p>
          <h1 id="hero-title">
            제주의 변수에,
            <br />
            <em>현지의 답.</em>
          </h1>
          <p className="heroDescription">
            날씨도, 휴무도, 교통도 계획대로만 흐르지 않으니까.
            <br className="desktopBreak" /> 지금 제주를 아는 사람에게 상황을
            묻습니다.
          </p>
        </section>

        <ApiConnectionStatus />
      </div>

      <footer className="pageFooter">
        <span>TravelGuide v2</span>
        <span>Asia / Seoul</span>
        <span>33.3617° N, 126.5292° E</span>
      </footer>
    </main>
  );
}
