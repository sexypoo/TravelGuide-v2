import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';
import { Wordmark } from '@/components/brand/wordmark';
import { getAdminMetrics } from '@/lib/api/admin-metrics.server';
import { requireAdmin } from '@/lib/auth/session';

function percent(value: number): string {
  return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%`;
}

export default async function AdminMetricsPage(): Promise<React.JSX.Element> {
  const [admin, metrics] = await Promise.all([
    requireAdmin(),
    getAdminMetrics(),
  ]);
  const responseTime =
    metrics.averageFirstAnswerMinutes === null
      ? '—'
      : `${metrics.averageFirstAnswerMinutes.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}분`;

  return (
    <main className="adminShell">
      <header className="adminHeader">
        <Wordmark />
        <div>
          <span>{admin.nickname} 관리자</span>
          <Link href="/app">사용자 화면</Link>
          <LogoutButton />
        </div>
      </header>
      <div className="adminWorkspace adminMetricsWorkspace">
        <header className="adminWorkspace__heading">
          <p>OPERATIONS SIGNAL</p>
          <h1>서비스 지표</h1>
          <span>질문이 답변과 해결로 이어지는 현재 흐름을 확인하세요.</span>
        </header>
        <nav className="adminTabs" aria-label="관리자 메뉴">
          <Link href="/admin">인증 심사</Link>
          <Link href="/admin/reports">신고 관리</Link>
          <span aria-current="page">서비스 지표</span>
        </nav>

        <section className="metricsSignalRail" aria-label="질문 전환 흐름">
          <div
            style={
              {
                '--signal-rate': '100%',
              } as React.CSSProperties
            }
          >
            <span>질문</span>
            <strong>{metrics.questionCount}</strong>
          </div>
          <div
            style={
              {
                '--signal-rate': `${metrics.answeredQuestionRate}%`,
              } as React.CSSProperties
            }
          >
            <span>답변 도착</span>
            <strong>{metrics.answeredQuestionCount}</strong>
            <small>{percent(metrics.answeredQuestionRate)}</small>
          </div>
          <div
            style={
              {
                '--signal-rate': `${metrics.resolutionRate}%`,
              } as React.CSSProperties
            }
          >
            <span>해결</span>
            <strong>{metrics.resolvedQuestionCount}</strong>
            <small>{percent(metrics.resolutionRate)}</small>
          </div>
        </section>

        <section className="adminMetricCells" aria-label="응답과 채택 지표">
          <article>
            <span>평균 최초 답변</span>
            <strong>{responseTime}</strong>
            <p>답변이 달린 질문 기준</p>
          </article>
          <article>
            <span>10분 이내 답변</span>
            <strong>{percent(metrics.answeredWithinTenMinutesRate)}</strong>
            <p>첫 답변 속도</p>
          </article>
          <article>
            <span>답변 채택</span>
            <strong>{metrics.acceptedQuestionCount}</strong>
            <p>해결 토픽의 {percent(metrics.acceptanceRate)}</p>
          </article>
        </section>

        <section className="contributorLedger">
          <header>
            <div>
              <p>LOCAL CONTRIBUTION</p>
              <h2>현지 정보 기여</h2>
            </div>
            <span>공개 답변 기준</span>
          </header>
          {metrics.localContributors.length === 0 ? (
            <div className="adminEmpty">아직 현지인 답변 기록이 없습니다.</div>
          ) : (
            <ol>
              {metrics.localContributors.map((contributor) => (
                <li key={contributor.userId}>
                  <Link
                    href={`/app/users/${encodeURIComponent(contributor.userId)}`}
                  >
                    {contributor.nickname}
                  </Link>
                  <span>{contributor.answerCount}개 답변</span>
                </li>
              ))}
            </ol>
          )}
        </section>
        <p className="metricsGeneratedAt">
          {new Intl.DateTimeFormat('ko-KR', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Seoul',
          }).format(new Date(metrics.generatedAt))}{' '}
          기준
        </p>
      </div>
    </main>
  );
}
