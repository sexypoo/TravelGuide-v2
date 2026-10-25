import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ApiConnectionStatus } from '@/components/api-connection-status';
import { Wordmark } from '@/components/brand/wordmark';
import { ButtonLink, Card, ListRow } from '@/components/ui';
import { getCurrentUser } from '@/lib/auth/session';
import styles from './public-home.module.css';

const steps = ['인증', '질문', '여러 현지인의 답변'];

export default async function Home(): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (user !== null) {
    redirect(user.isAdmin ? '/admin' : '/app');
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Wordmark />
        <nav className={styles.headerNav} aria-label="처음 화면 메뉴">
          <Link className={styles.headerTest} href="/test">
            여행자 유형 테스트
          </Link>
          <Link className={styles.headerLogin} href="/auth/login">
            로그인
          </Link>
        </nav>
      </header>

      <div className={styles.body}>
        <section className={styles.hero} aria-labelledby="guest-title">
          <h1 id="guest-title" className={styles.title}>
            <span>여행이 틀어지는 순간,</span>{' '}
            <span>지금 그곳을 아는 사람에게 묻다.</span>
          </h1>
          <p className={styles.lede}>
            인증한 여행자와 현지인이 모인 도움방에서 지금 상황을 물어보세요.
          </p>

          <ol className={styles.steps} aria-label="서비스 이용 순서">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <div className={styles.actions}>
            <ButtonLink
              href="/auth/login"
              id="guest-login"
              variant="light"
              size="lg"
              block
            >
              로그인
            </ButtonLink>
            <Link className={styles.register} href="/auth/register">
              처음이신가요? <strong>계정 만들기</strong>
            </Link>
          </div>
        </section>

        <Card
          padding="list"
          className={styles.destinations}
          aria-labelledby="destinations-title"
        >
          <h2 id="destinations-title" className={styles.destinationsTitle}>
            로그인하면 이어지는 곳
          </h2>
          <ListRow
            href="/auth/login?next=%2Fapp%2Frooms%2Fjeju"
            icon="room"
            tone="magenta"
            title="제주 실시간 도움방"
            description="인증하면 지금 상황을 물을 수 있어요."
          />
          <ListRow
            href="/auth/login?next=%2Fapp%2Fcommunity"
            icon="community"
            tone="iris"
            title="여행자 커뮤니티"
            description="인증 없이 여행 정보를 묻고 나눌 수 있어요."
          />
          <ListRow
            href="/auth/login?next=%2Fapp%2Fverifications"
            icon="shield"
            tone="plum"
            title="여행자·현지인 인증"
            description="도움방에 참여할 자격을 신청해요."
          />
        </Card>
      </div>

      <footer className={styles.footer}>
        <p className={styles.safety}>
          긴급 구조나 의료 상담이 필요하면 119 등 공식 기관에 먼저 연락해
          주세요.
        </p>
        <div className={styles.footerMeta}>
          <ApiConnectionStatus />
          <nav aria-label="정책 안내">
            <Link href="/privacy">개인정보 처리방침</Link>
            <Link href="/account-deletion">계정 삭제</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
