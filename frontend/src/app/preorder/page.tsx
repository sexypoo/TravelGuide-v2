import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';
import { AppIcon, type AppIconName } from '@/components/common';
import { PreorderForm } from '@/components/preorders/preorder-form';

export const metadata: Metadata = {
  title: '여쭈어 사전예약',
  description:
    '여행이 틀어지는 순간, 인증된 여행자와 현지인에게 지금 필요한 판단을 물어보세요.',
};

const problems: ReadonlyArray<{
  icon: AppIconName;
  title: string;
  description: string;
}> = [
  {
    icon: 'live',
    title: '갑작스러운 변수',
    description: '날씨, 휴무, 교통처럼 검색만으로 대응하기 어려운 순간',
  },
  {
    icon: 'clock',
    title: '정보의 시차',
    description: '지금 줄이 긴지, 실제로 운영 중인지 알 수 없는 정보',
  },
  {
    icon: 'shield',
    title: '광고 같은 추천',
    description: '누가 왜 추천하는지 알 수 없는 홍보성 목록과 후기',
  },
];

const steps: ReadonlyArray<{
  label: string;
  icon: AppIconName;
  title: string;
  description: string;
}> = [
  {
    label: '01',
    icon: 'shield',
    title: '서로의 자격을 확인해요',
    description:
      '여행 일정이나 지역 생활을 확인한 참여자만 도움방에 들어옵니다.',
  },
  {
    label: '02',
    icon: 'topic',
    title: '지금 필요한 상황을 물어요',
    description: '검색으로 부족한 상황을 여행지 단체 도움방에 바로 남깁니다.',
  },
  {
    label: '03',
    icon: 'check',
    title: '근거가 다른 답을 비교해요',
    description:
      '방금 경험과 현지 생활 추천을 함께 보고 내 상황에 맞게 결정합니다.',
  },
];

export default function PreorderPage(): React.JSX.Element {
  return (
    <main className="preorderPage">
      <header className="preorderHeader">
        <Wordmark />
        <nav aria-label="사전예약 페이지 메뉴">
          <a href="#why-service">서비스 소개</a>
          <a href="#how-it-works">이용 방법</a>
          <a href="#preorder-form">사전예약</a>
        </nav>
        <Link className="preorderLogin" href="/auth/login">
          로그인
        </Link>
      </header>

      <section
        className="preorderHero preorderSection"
        aria-labelledby="preorder-title"
      >
        <div className="preorderHero__copy">
          <p className="preorderHero__brand" aria-label="여쭈어, 여JJU">
            <strong>여쭈어</strong>
            <span>여JJU</span>
          </p>
          <h1 id="preorder-title">
            여행이 막막한 순간,
            <br />
            <em>여쭈어에 물어보세요.</em>
          </h1>
          <p className="preorderHero__description">
            여행 중인 사람의 방금 경험과 인증 현지인의 생활 추천을 한곳에서
            비교하고, 달라진 여행에 필요한 판단을 빠르게 얻으세요.
          </p>
          <div className="preorderHero__actions">
            <a className="primaryLink" href="#preorder-form">
              사전예약하기 <AppIcon name="arrow-right" />
            </a>
            <a className="secondaryLink" href="#how-it-works">
              서비스 둘러보기
            </a>
          </div>
        </div>

        <div
          className="preorderProduct"
          aria-label="여쭈어 실시간 도움방 화면 예시"
        >
          <div className="preorderProduct__topbar">
            <div aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <strong>여행지 실시간 도움방</strong>
            <span className="preorderLive">LIVE</span>
          </div>
          <div className="preorderProduct__body">
            <div className="preorderQuestion">
              <div className="preorderMessageMeta">
                <span className="preorderAvatar preorderAvatar--traveler">
                  여
                </span>
                <div>
                  <strong>인증 여행자</strong>
                  <span>방금 전</span>
                </div>
              </div>
              <p>
                갑자기 비가 오는데, 아이와 한두 시간 머물기 좋은 실내 장소가
                있을까요?
              </p>
              <span className="preorderQuestion__tag">
                지금 도움이 필요해요
              </span>
            </div>

            <div className="preorderAnswer preorderAnswer--local">
              <span className="preorderAnswer__line" aria-hidden="true" />
              <div className="preorderMessageMeta">
                <span className="preorderAvatar preorderAvatar--local">현</span>
                <div>
                  <strong>인증 현지인</strong>
                  <span>생활 추천</span>
                </div>
              </div>
              <p>
                근처 어린이 도서관은 주차가 편하고 오늘 저녁 6시까지 열어요.
              </p>
            </div>

            <div className="preorderAnswer preorderAnswer--traveler">
              <span className="preorderAnswer__line" aria-hidden="true" />
              <div className="preorderMessageMeta">
                <span className="preorderAvatar preorderAvatar--traveler">
                  여
                </span>
                <div>
                  <strong>인증 여행자</strong>
                  <span>방금 경험</span>
                </div>
              </div>
              <p>지금 그쪽에 있는데 자리가 넉넉하고 유아 공간도 열려 있어요.</p>
            </div>

            <div className="preorderDecision">
              <AppIcon name="check" />
              <span>두 경험을 비교해 지금 결정</span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="preorderProblem"
        id="why-service"
        aria-labelledby="problem-title"
      >
        <div className="preorderSectionHeading">
          <p>여쭈어가 필요한 이유</p>
          <h2 id="problem-title">여행은 계획대로만 흘러가지 않으니까.</h2>
          <span>
            오래된 검색 결과보다 지금 그곳을 아는 사람의 판단이 필요한 순간이
            있습니다.
          </span>
        </div>
        <div className="preorderProblemGrid">
          {problems.map((problem) => (
            <article key={problem.title}>
              <span aria-hidden="true">
                <AppIcon name={problem.icon} />
              </span>
              <h3>{problem.title}</h3>
              <p>{problem.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="preorderHow preorderSection"
        id="how-it-works"
        aria-labelledby="how-title"
      >
        <div className="preorderSectionHeading preorderSectionHeading--left">
          <p>HOW IT WORKS</p>
          <h2 id="how-title">질문에서 결정까지, 세 단계면 충분해요.</h2>
        </div>
        <ol className="preorderSteps">
          {steps.map((step) => (
            <li key={step.label}>
              <span className="preorderStepNumber">{step.label}</span>
              <span className="preorderStepIcon" aria-hidden="true">
                <AppIcon name={step.icon} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="preorderTrust preorderSection"
        aria-labelledby="trust-title"
      >
        <div className="preorderTrust__copy">
          <p className="preorderSectionLabel">TRUST BY DESIGN</p>
          <h2 id="trust-title">광고보다 경험을, 추천보다 근거를 함께 봐요.</h2>
          <p>
            인증된 여행자와 현지인에게 내 상황을 직접 묻고, 누가 어떤 경험으로
            답했는지 확인합니다. 광고·홍보성 답변은 신고해 운영 검토를 요청할 수
            있어요.
          </p>
          <ul>
            <li>
              <AppIcon name="shield" /> 인증된 참여자 배지
            </li>
            <li>
              <AppIcon name="live" /> 방금 경험·생활 추천 등 답변 근거
            </li>
            <li>
              <AppIcon name="check" /> 채택과 해결 상태
            </li>
            <li>
              <AppIcon name="topic" /> 광고·홍보성 답변 신고 및 관리
            </li>
          </ul>
        </div>
        <div className="preorderTrustCard">
          <span className="preorderTrustCard__label">답변 비교</span>
          <article>
            <div>
              <span className="preorderAvatar preorderAvatar--local">현</span>
              <p>
                <strong>인증 현지인</strong>
                <small>현장에 있음</small>
              </p>
            </div>
            <p>입구보다 뒤편 주차장이 지금은 훨씬 여유로워요.</p>
          </article>
          <article>
            <div>
              <span className="preorderAvatar preorderAvatar--traveler">
                여
              </span>
              <p>
                <strong>인증 여행자</strong>
                <small>최근 경험</small>
              </p>
            </div>
            <p>10분 전에 뒤편으로 들어왔고 바로 주차했어요.</p>
          </article>
          <div className="preorderTrustCard__resolved">
            <AppIcon name="check" /> 도움이 된 답을 채택했어요
          </div>
        </div>
      </section>

      <section
        className="preorderSignup"
        id="preorder-form"
        aria-labelledby="signup-title"
      >
        <div className="preorderSignup__copy">
          <p className="preorderSectionLabel">BE FIRST TO ASK</p>
          <h2 id="signup-title">
            여행의 변수를 사람들의 답으로 바꾸는 첫 출발.
          </h2>
          <p>
            첫 파일럿은 제주에서 시작하지만, 여쭈어가 향하는 곳은 모든
            여행지입니다. 오픈 소식과 참여 방법을 가장 먼저 받아보세요.
          </p>
          <span>
            <AppIcon name="pin" /> 첫 파일럿 지역 · 제주
          </span>
        </div>
        <aside className="preorderCard" aria-label="사전예약 신청">
          <PreorderForm />
        </aside>
      </section>

      <footer className="preorderFooter">
        <Wordmark />
        <p>여행의 변수에, 사람들의 답.</p>
        <span>© 2026 여쭈어</span>
      </footer>
    </main>
  );
}
