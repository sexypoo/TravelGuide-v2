import Link from 'next/link';
import { AdminFrame } from '@/components/admin/admin-frame';
import styles from '@/components/admin/admin.module.css';
import { Card, EmptyState, SectionHead } from '@/components/ui';
import { getAdminMetrics } from '@/lib/api/admin-metrics.server';
import { requireAdmin } from '@/lib/auth/session';

function percent(value: number): string {
  return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%`;
}

function decimal(value: number): string {
  return value.toLocaleString('ko-KR', { maximumFractionDigits: 1 });
}

function barWidth(rate: number): string {
  return `${Math.min(100, Math.max(0, rate))}%`;
}

const NO_ANSWERED_TOPIC = '아직 답변이 달린 토픽이 없어요';

export default async function AdminMetricsPage(): Promise<React.JSX.Element> {
  const [admin, metrics] = await Promise.all([
    requireAdmin(),
    getAdminMetrics(),
  ]);
  const responseTime =
    metrics.averageFirstAnswerMinutes === null
      ? '—'
      : `${metrics.averageFirstAnswerMinutes.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}분`;

  const { userFunnel, supply } = metrics;
  const userSteps = [
    {
      label: '가입',
      count: userFunnel.signedUpCount,
      rate: userFunnel.signedUpCount > 0 ? 100 : 0,
      showRate: false,
    },
    {
      label: '인증 신청',
      count: userFunnel.verificationAppliedCount,
      rate: userFunnel.verificationAppliedRate,
      showRate: true,
    },
    {
      label: '인증 승인',
      count: userFunnel.verificationApprovedCount,
      rate: userFunnel.verificationApprovedRate,
      showRate: true,
      detail: `여행자 ${userFunnel.travelerApprovedCount.toLocaleString('ko-KR')}명 · 현지인 ${userFunnel.localApprovedCount.toLocaleString('ko-KR')}명`,
    },
    {
      label: '첫 토픽 작성',
      count: userFunnel.firstTopicCount,
      rate: userFunnel.firstTopicRate,
      showRate: true,
    },
    {
      label: '답변 받음',
      count: userFunnel.answerReceivedCount,
      rate: userFunnel.answerReceivedRate,
      showRate: true,
    },
    {
      label: '답변 채택',
      count: userFunnel.answerAcceptedCount,
      rate: userFunnel.answerAcceptedRate,
      showRate: true,
    },
  ];

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
      title="운영 지표"
      description="가입부터 답변 채택까지 지금의 흐름을 확인하세요."
    >
      <Card className={styles.funnelCard} aria-labelledby="user-funnel-title">
        <SectionHead
          id="user-funnel-title"
          title="사용자 흐름"
          action={<span className={styles.sectionNote}>관리자 계정 제외</span>}
        />
        {userFunnel.signedUpCount === 0 ? (
          <EmptyState
            icon="crowd"
            title="아직 가입한 사용자가 없어요."
            description="가입이 생기면 단계별 흐름이 여기에 보여요."
          />
        ) : (
          <>
            <ol className={styles.funnel} aria-label="사용자 흐름">
              {userSteps.map((step) => (
                <li key={step.label}>
                  <span>{step.label}</span>
                  <div className={styles.bar} aria-hidden="true">
                    <i style={{ width: barWidth(step.rate) }} />
                  </div>
                  <strong>
                    {step.count.toLocaleString('ko-KR')}
                    <span className="srOnly">명</span>
                    {step.showRate && (
                      <small>
                        <span className="srOnly">앞 단계의 </span>
                        {percent(step.rate)}
                      </small>
                    )}
                  </strong>
                  {step.detail !== undefined && (
                    <p className={styles.funnelDetail}>{step.detail}</p>
                  )}
                </li>
              ))}
            </ol>
            <p className={styles.funnelNote}>
              비율은 바로 앞 단계와 비교한 값이에요.
            </p>
          </>
        )}
      </Card>

      <Card className={styles.funnelCard} aria-labelledby="funnel-title">
        <SectionHead id="funnel-title" title="질문 전환 흐름" />
        <ol className={styles.funnel} aria-label="질문 전환 흐름">
          {funnel.map((step) => (
            <li key={step.label}>
              <span>{step.label}</span>
              <div className={styles.bar} aria-hidden="true">
                <i style={{ width: barWidth(step.rate) }} />
              </div>
              <strong>
                {step.count.toLocaleString('ko-KR')}
                {step.showRate && <small>{percent(step.rate)}</small>}
              </strong>
            </li>
          ))}
        </ol>
      </Card>

      <dl className={styles.metricFacts} aria-label="답변 속도와 공급 지표">
        <div>
          <dt>평균 최초 답변</dt>
          <dd>
            {responseTime}
            <small>답변이 달린 질문 기준</small>
          </dd>
        </div>
        <div>
          <dt>첫 답변 중앙값</dt>
          <dd>
            {supply.medianFirstAnswerMinutes === null
              ? '—'
              : `${decimal(supply.medianFirstAnswerMinutes)}분`}
            <small>
              {supply.medianFirstAnswerMinutes === null
                ? NO_ANSWERED_TOPIC
                : '절반의 토픽이 이 시간 안에 답변을 받았어요'}
            </small>
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
          <dt>토픽당 평균 답변</dt>
          <dd>
            {supply.averageAnswersPerAnsweredQuestion === null
              ? '—'
              : `${decimal(supply.averageAnswersPerAnsweredQuestion)}개`}
            <small>
              {supply.averageAnswersPerAnsweredQuestion === null
                ? NO_ANSWERED_TOPIC
                : '답변이 달린 토픽 기준'}
            </small>
          </dd>
        </div>
        <div>
          <dt>답변 없이 끝난 토픽</dt>
          <dd>
            {`${supply.unansweredExpiredQuestionCount.toLocaleString('ko-KR')}개`}
            <small>
              전체 토픽의 {percent(supply.unansweredExpiredQuestionRate)}
            </small>
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

      <Card aria-labelledby="contributors-title">
        <SectionHead
          id="contributors-title"
          title="현지 정보 기여"
          action={<span className={styles.sectionNote}>공개 답변 기준</span>}
        />
        {metrics.localContributors.length === 0 ? (
          <EmptyState icon="user" title="아직 현지인 답변 기록이 없습니다." />
        ) : (
          <ol className={styles.contributors}>
            {metrics.localContributors.map((contributor, index) => (
              <li key={contributor.userId}>
                <span className={styles.rank} aria-hidden="true">
                  {index + 1}
                </span>
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
      </Card>
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
