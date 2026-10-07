import { render, screen } from '@testing-library/react';
import type { QuestionDetail } from '@/lib/api/questions';
import { LiveStatusBoard } from './live-status-board';

type LiveSummary = NonNullable<QuestionDetail['liveSummary']>;

function questionWith(summary: LiveSummary | null): QuestionDetail {
  return {
    id: 'question-1',
    roomId: 'room-jeju',
    author: {
      id: 'traveler-1',
      nickname: '여행자',
      badge: 'VERIFIED_TRAVELER',
    },
    category: 'WAITING',
    urgency: 'URGENT',
    content: '동문시장 야시장 줄 얼마나 길어요?',
    contentFormat: 'PLAIN_TEXT',
    areaText: '제주시 동문시장',
    image: null,
    sourceMessageId: null,
    status: 'OPEN',
    safetyNotice: null,
    answerCount: 1,
    acceptedAnswerId: null,
    expiresAt: '2026-08-02T12:00:00.000Z',
    resolvedAt: null,
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
    answers: [],
    liveSummary: summary,
  };
}

const liveSummary: LiveSummary = {
  freshness: 'LIVE',
  responseCount: 3,
  agreementCount: 2,
  waitMinutes: { min: 10, max: 20 },
  crowdLevel: 'BUSY',
  entryStatus: 'OPEN',
  lastObservedAt: '2026-08-01T12:08:00.000Z',
  recommendedRecheckAt: '2026-08-01T12:18:00.000Z',
  staleAfter: '2026-08-01T12:38:00.000Z',
  description: '현장 답변 기준 현재 대기는 약 10~20분 수준입니다.',
};

describe('LiveStatusBoard', () => {
  it('leads with the wait headline and does not repeat it as a fact', () => {
    render(<LiveStatusBoard question={questionWith(liveSummary)} />);

    expect(
      screen.getByRole('region', { name: '대기 10~20분' }),
    ).toHaveAttribute('data-freshness', 'live');
    expect(screen.getByText(/실시간 현장 정보/)).toBeInTheDocument();
    expect(screen.queryByText('현재 대기')).not.toBeInTheDocument();
    expect(screen.getByText('많음')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('marks stale information and lists the unknown wait', () => {
    render(
      <LiveStatusBoard
        question={questionWith({
          ...liveSummary,
          freshness: 'STALE',
          waitMinutes: null,
        })}
      />,
    );

    expect(
      screen.getByRole('region', { name: '현장 상태 업데이트' }),
    ).toHaveAttribute('data-freshness', 'stale');
    expect(screen.getByText(/지난 현장 정보/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      '30분 이상 새 확인이 없어요.',
    );
    expect(screen.getByText('현재 대기')).toBeInTheDocument();
  });

  it('renders nothing without a field summary', () => {
    const { container } = render(
      <LiveStatusBoard question={questionWith(null)} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
