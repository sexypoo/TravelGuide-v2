import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';
import { AppIcon } from '@/components/common';
import { PreorderForm } from '@/components/preorders/preorder-form';
import { Card, IconTile } from '@/components/ui';
import { preorderProblems, preorderProductMoments } from './content';
import styles from './preorder.module.css';

export const metadata: Metadata = {
  title: '여쭈어 사전예약',
  description:
    '여행이 틀어지는 순간, 인증된 여행자와 현지인에게 지금 필요한 판단을 물어보세요.',
};

const trustPoints = [
  { icon: 'shield', text: '인증된 참여자 배지' },
  { icon: 'live', text: '방금 경험·생활 추천 등 답변 근거' },
  { icon: 'check', text: '채택과 해결 상태' },
  { icon: 'topic', text: '광고·홍보성 답변 신고 및 관리' },
] as const;

export default function PreorderPage(): React.JSX.Element {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Wordmark />
        <nav className={styles.headerNav} aria-label="사전예약 페이지 메뉴">
          <a href="#why-service">서비스 소개</a>
          <a href="#how-it-works">이용 방법</a>
          <a href="#preorder-form">사전예약</a>
        </nav>
        <Link className={styles.login} href="/auth/login">
          로그인
        </Link>
      </header>

      <div className={styles.layout}>
        <div className={styles.story}>
          <section className={styles.hero} aria-labelledby="preorder-title">
            <p className={styles.heroKicker}>
              <AppIcon name="pin" /> 첫 파일럿 지역 · 제주
            </p>
            <h1 id="preorder-title" className={styles.heroTitle}>
              여행이 막막한 순간,
              <br />
              여쭈어에 물어보세요.
            </h1>
            <p className={styles.heroText}>
              여행 중인 사람의 방금 경험과 인증 현지인의 생활 추천을 한곳에서
              비교하고, 달라진 여행에 필요한 판단을 빠르게 얻으세요.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.heroPrimary} href="#preorder-form">
                사전예약하기 <AppIcon name="arrow-right" />
              </a>
              <a className={styles.heroSecondary} href="#how-it-works">
                서비스 둘러보기
              </a>
            </div>
          </section>

          <Card
            id="why-service"
            className={styles.section}
            aria-labelledby="problem-title"
          >
            <h2 id="problem-title">여행은 계획대로만 흘러가지 않으니까.</h2>
            <p className={styles.sectionLede}>
              오래된 검색 결과보다 지금 그곳을 아는 사람의 판단이 필요한 순간이
              있습니다.
            </p>
            <ul className={styles.problems}>
              {preorderProblems.map((problem) => (
                <li key={problem.title}>
                  <IconTile icon={problem.icon} tone="magenta" />
                  <div>
                    <h3>{problem.title}</h3>
                    <p>{problem.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            id="how-it-works"
            className={styles.section}
            aria-labelledby="how-title"
          >
            <h2 id="how-title">여행이 달라진 그 순간부터, 답을 얻을 때까지.</h2>
            <p className={styles.sectionLede}>
              인증부터 현장 답변까지 하나의 흐름으로 이어집니다.
            </p>
            <ol className={styles.moments}>
              {preorderProductMoments.map((moment) => (
                <li key={moment.title}>
                  <h3>{moment.title}</h3>
                  <p>{moment.description}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card className={styles.section} aria-labelledby="trust-title">
            <h2 id="trust-title">
              광고보다 경험을, 추천보다 근거를 함께 봐요.
            </h2>
            <p className={styles.sectionLede}>
              인증된 여행자와 현지인에게 내 상황을 직접 묻고, 누가 어떤 경험으로
              답했는지 확인합니다. 광고·홍보성 답변은 신고해 운영 검토를 요청할
              수 있어요.
            </p>
            <ul className={styles.trust}>
              {trustPoints.map((point) => (
                <li key={point.text}>
                  <AppIcon name={point.icon} /> {point.text}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <section
          className={styles.signup}
          id="preorder-form"
          aria-labelledby="signup-title"
        >
          <div className={styles.signupCopy}>
            <h2 id="signup-title">
              여행의 변수를 사람들의 답으로 바꾸는 첫 출발.
            </h2>
            <p>
              첫 파일럿은 제주에서 시작하지만, 여쭈어가 향하는 곳은 모든
              여행지입니다. 오픈 소식과 참여 방법을 가장 먼저 받아보세요.
            </p>
          </div>
          <Card
            as="aside"
            className={styles.formCard}
            aria-label="사전예약 신청"
          >
            <PreorderForm />
          </Card>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>여행의 변수에, 사람들의 답.</p>
        <nav aria-label="정책 안내">
          <Link href="/privacy">개인정보 처리방침</Link>
        </nav>
        <span>© 2026 여쭈어</span>
      </footer>
    </main>
  );
}
