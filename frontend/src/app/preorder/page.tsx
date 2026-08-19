import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';
import { AppIcon } from '@/components/common';
import { PreorderForm } from '@/components/preorders/preorder-form';
import { preorderProblems, preorderProductMoments } from './content';

export const metadata: Metadata = {
  title: '여쭈어 사전예약',
  description:
    '여행이 틀어지는 순간, 인증된 여행자와 현지인에게 지금 필요한 판단을 물어보세요.',
};

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

        <div className="preorderShowcase">
          <span className="preorderShowcase__route" aria-hidden="true" />
          <figure className="preorderShowcase__device">
            <Image
              src="/preorder/live-room-20260819.webp"
              alt="제주 실시간 여행 도움방에서 여행자 질문과 답변 카드를 주고받는 화면"
              width={900}
              height={1855}
              priority
              sizes="(max-width: 560px) 76vw, (max-width: 900px) 420px, 390px"
            />
          </figure>
          <div className="preorderShowcase__note">
            <span>
              <i aria-hidden="true" /> LIVE SIGNAL
            </span>
            <strong>질문이 현장 정보가 되는 순간</strong>
            <p>대화 속 질문을 놓치지 않고, 답변의 근거와 해결 상태까지 봐요.</p>
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
          {preorderProblems.map((problem) => (
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
        className="preorderJourney"
        id="how-it-works"
        aria-labelledby="how-title"
      >
        <div className="preorderJourney__heading">
          <div className="preorderSectionHeading preorderSectionHeading--left">
            <p>FROM QUESTION TO DECISION</p>
            <h2 id="how-title">여행이 달라진 그 순간부터, 답을 얻을 때까지.</h2>
          </div>
          <p>
            인증부터 현장 답변까지 하나의 흐름으로 이어집니다. 옆으로 넘겨 실제
            서비스 화면을 확인해 보세요.
          </p>
        </div>
        <ol className="preorderJourney__track">
          {preorderProductMoments.map((moment) => (
            <li key={moment.label}>
              <div className="preorderJourney__visual">
                <Image
                  src={moment.image}
                  alt={moment.alt}
                  width={900}
                  height={1855}
                  sizes="(max-width: 560px) 72vw, (max-width: 900px) 320px, 330px"
                />
              </div>
              <div className="preorderJourney__copy">
                <span>{moment.label}</span>
                <h3>{moment.title}</h3>
                <p>{moment.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="preorderJourney__hint" aria-hidden="true">
          화면을 옆으로 넘겨보세요 <AppIcon name="arrow-right" />
        </p>
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
