import { render, screen, within } from '@testing-library/react';
import type { AdminMetrics } from '../../../lib/api/admin-metrics';
import { getAdminMetrics } from '../../../lib/api/admin-metrics.server';
import { requireAdmin } from '../../../lib/auth/session';
import AdminMetricsPage from './page';

jest.mock('../../../lib/api/admin-metrics.server', () => ({
  getAdminMetrics: jest.fn(),
}));

jest.mock('../../../lib/auth/session', () => ({
  requireAdmin: jest.fn(),
}));

jest.mock('../../../components/admin/admin-frame', () => ({
  AdminFrame: ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </main>
  ),
}));

const mockedGetAdminMetrics = jest.mocked(getAdminMetrics);
const mockedRequireAdmin = jest.mocked(requireAdmin);

const metrics: AdminMetrics = {
  generatedAt: '2026-10-19T00:00:00.000Z',
  questionCount: 10,
  answeredQuestionCount: 8,
  answeredQuestionRate: 80,
  averageFirstAnswerMinutes: 7.5,
  answeredWithinTenMinutesRate: 75,
  resolvedQuestionCount: 6,
  resolutionRate: 60,
  acceptedQuestionCount: 5,
  acceptanceRate: 83.3,
  localContributors: [],
  userFunnel: {
    signedUpCount: 1200,
    verificationAppliedCount: 50,
    verificationAppliedRate: 4.2,
    verificationApprovedCount: 42,
    verificationApprovedRate: 84,
    travelerApprovedCount: 30,
    localApprovedCount: 14,
    firstTopicCount: 20,
    firstTopicRate: 47.6,
    answerReceivedCount: 15,
    answerReceivedRate: 75,
    answerAcceptedCount: 9,
    answerAcceptedRate: 60,
  },
  supply: {
    unansweredExpiredQuestionCount: 2,
    unansweredExpiredQuestionRate: 20,
    averageAnswersPerAnsweredQuestion: 1.8,
    medianFirstAnswerMinutes: 6.5,
  },
};

async function renderPage(value: AdminMetrics): Promise<void> {
  mockedRequireAdmin.mockResolvedValue({
    id: 'admin-1',
    email: 'admin@example.com',
    nickname: '운영자',
    role: 'ADMIN',
    isAdmin: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    verificationSummary: { traveler: null, local: null },
  });
  mockedGetAdminMetrics.mockResolvedValue(value);
  render(await AdminMetricsPage());
}

describe('admin metrics page', () => {
  it('shows the user funnel with step rates and approval detail', async () => {
    await renderPage(metrics);

    const funnel = screen.getByRole('list', { name: '사용자 흐름' });
    const rows = within(funnel).getAllByRole('listitem');
    expect(rows.map((row) => row.firstChild?.textContent)).toEqual([
      '가입',
      '인증 신청',
      '인증 승인',
      '첫 토픽 작성',
      '답변 받음',
      '답변 채택',
    ]);
    expect(rows[0]).toHaveTextContent('1,200명');
    expect(rows[0]).not.toHaveTextContent('앞 단계의');
    expect(rows[2]).toHaveTextContent('42명앞 단계의 84%');
    expect(rows[2]).toHaveTextContent('여행자 30명 · 현지인 14명');
    expect(screen.getByText('관리자 계정 제외')).toBeInTheDocument();
    expect(
      screen.getByText('비율은 바로 앞 단계와 비교한 값이에요.'),
    ).toBeInTheDocument();
  });

  it('shows supply metrics in the fact grid', async () => {
    await renderPage(metrics);

    const facts = screen.getByLabelText('답변 속도와 공급 지표');
    expect(facts).toHaveTextContent('첫 답변 중앙값6.5분');
    expect(facts).toHaveTextContent('토픽당 평균 답변1.8개');
    expect(facts).toHaveTextContent('답변 없이 끝난 토픽2개전체 토픽의 20%');
  });

  it('shows an empty state and dashes before anyone signs up', async () => {
    await renderPage({
      ...metrics,
      questionCount: 0,
      answeredQuestionCount: 0,
      averageFirstAnswerMinutes: null,
      userFunnel: {
        ...metrics.userFunnel,
        signedUpCount: 0,
      },
      supply: {
        unansweredExpiredQuestionCount: 0,
        unansweredExpiredQuestionRate: 0,
        averageAnswersPerAnsweredQuestion: null,
        medianFirstAnswerMinutes: null,
      },
    });

    expect(
      screen.getByText('아직 가입한 사용자가 없어요.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('list', { name: '사용자 흐름' }),
    ).not.toBeInTheDocument();
    const facts = screen.getByLabelText('답변 속도와 공급 지표');
    expect(
      within(facts).getAllByText('아직 답변이 달린 토픽이 없어요'),
    ).toHaveLength(2);
    expect(facts).toHaveTextContent('답변 없이 끝난 토픽0개전체 토픽의 0%');
  });
});
