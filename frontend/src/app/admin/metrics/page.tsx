import Link from 'next/link';
import { AdminFrame } from '@/components/admin/admin-frame';
import styles from '@/components/admin/admin.module.css';
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

  const funnel = [
    {
      label: '질문',
      count: metrics.questionCount,
      rate: metrics.questionCount > 0 ? 100 : 0,
      showRate: false,
    },
    {
      label: '답변 도착',
      count: metrics.answeredQuestionCount,
      rate: metrics.answeredQuestionRate,
      showRate: true,
    },
    {
      label: '해결',
      count: metrics.resolvedQuestionCount,
      rate: metrics.resolutionRate,
      showRate: true,
    },
  ];

  return (
    <AdminFrame
      adminNickname={admin.nickname}
      current="metrics"
      title="서비스 지표"
      description="질문이 답변과 해결로 이어지는 현재 흐름을 확인하세요."
    >
      <ol className={styles.funnel} aria-label="질문 전환 흐름">
        {funnel.map((step) => (
          <li key={step.label}>
            <span>{step.label}</span>
            <div className={styles.bar} aria-hidden="true">
              <i
                style={{ width: `${Math.min(100, Math.max(0, step.rate))}%` }}
              />
            </div>
            <strong>
              {step.count.toLocaleString('ko-KR')}
              {step.showRate && <small>{percent(step.rate)}</small>}
            </strong>
          </li>
        ))}
      </ol>

      <dl className={styles.metricFacts} aria-label="응답과 채택 지표">
        <div>
          <dt>평균 최초 답변</dt>
          <dd>
            {responseTime}
            <small>답변이 달린 질문 기준</small>
          </dd>
        </div>
        <div>
          <dt>10분 이내 답변</dt>
          <dd>
            {percent(metrics.answeredWithinTenMinutesRate)}
            <small>첫 답변 속도</small>
          </dd>
        </div>
        <div>
          <dt>답변 채택</dt>
          <dd>
            {metrics.acceptedQuestionCount.toLocaleString('ko-KR')}
            <small>해결 토픽의 {percent(metrics.acceptanceRate)}</small>
          </dd>
        </div>
      </dl>

      <section aria-labelledby="contributors-title">
        <h2 id="contributors-title" className={styles.sectionTitle}>
          현지 정보 기여 <span>공개 답변 기준</span>
        </h2>
        {metrics.localContributors.length === 0 ? (
          <p className={styles.empty}>아직 현지인 답변 기록이 없습니다.</p>
        ) : (
          <ol className={styles.contributors}>
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
      <p className={styles.generatedAt}>
        {new Intl.DateTimeFormat('ko-KR', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Seoul',
        }).format(new Date(metrics.generatedAt))}{' '}
        기준
      </p>
    </AdminFrame>
  );
}
