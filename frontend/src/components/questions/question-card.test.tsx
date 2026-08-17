import { render, screen } from '@testing-library/react';
import type { Question } from '@/lib/api/questions';
import { QuestionCard } from './question-card';

const question: Question = {
  id: 'question-id',
  roomId: 'room-id',
  author: {
    id: 'traveler-id',
    nickname: '제주여행자',
    badge: 'VERIFIED_TRAVELER',
  },
  category: 'WAITING',
  urgency: 'NORMAL',
  content: '현재 입장 대기 시간을 사진과 함께 확인하고 싶습니다.',
  contentFormat: 'PLAIN_TEXT',
  areaText: '제주공항',
  image: {
    url: '/api/v1/questions/question-id/image',
    originalName: '대기줄.png',
    mimeType: 'image/png',
  },
  sourceMessageId: null,
  status: 'OPEN',
  safetyNotice: null,
  answerCount: 0,
  acceptedAnswerId: null,
  expiresAt: '2026-08-02T00:00:00.000Z',
  resolvedAt: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('QuestionCard topic evidence', () => {
  it('renders a protected topic image as subordinate evidence', () => {
    render(<QuestionCard question={question} />);
    expect(
      screen.getByRole('img', { name: '제주공항 토픽 첨부 사진' }),
    ).toHaveAttribute('src', question.image?.url);
    expect(screen.getByText('현장 사진')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
    expect(
      screen.getByText('0').closest('.questionAnswerCount'),
    ).toHaveTextContent('답변 0');
  });
});
