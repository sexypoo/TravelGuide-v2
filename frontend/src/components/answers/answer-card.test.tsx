import { render, screen } from '@testing-library/react';
import type { Answer } from '@/lib/api/questions';
import { AnswerCard } from './answer-card';

const answer: Answer = {
  id: 'answer-1',
  questionId: 'question-1',
  author: {
    id: 'local-1',
    nickname: '제주현지인',
    badge: 'VERIFIED_LOCAL',
    verifiedAt: '2026-07-01T00:00:00.000Z',
  },
  content: '<script>alert(1)</script> 현재 직접 확인했습니다.',
  contentFormat: 'PLAIN_TEXT',
  sourceType: 'OFFICIAL_SOURCE',
  sourceUrl: 'https://example.com/notice',
  removed: false,
  image: null,
  observation: null,
  createdAt: '2026-08-01T00:10:00.000Z',
  updatedAt: '2026-08-01T00:10:00.000Z',
};

describe('AnswerCard', () => {
  it('renders content as text and protects the official source tab', () => {
    const { container } = render(
      <AnswerCard
        answer={answer}
        accepted={false}
        currentUserId="traveler-1"
      />,
    );
    expect(screen.getByText(answer.content)).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    expect(
      screen.getByRole('link', { name: /공식 출처 열기/ }),
    ).toHaveAttribute('target', '_blank');
    expect(
      screen.getByRole('link', { name: /공식 출처 열기/ }),
    ).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      screen.getByRole('link', { name: '제주현지인 공개 프로필 보기' }),
    ).toHaveAttribute('href', '/app/users/local-1');
  });

  it('marks an accepted answer and offers reporting only to another user', () => {
    render(<AnswerCard answer={answer} accepted currentUserId="traveler-1" />);
    expect(screen.getByText('채택된 답변')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '신고' })).toBeInTheDocument();
  });

  it('labels a verified traveler answer distinctly', () => {
    render(
      <AnswerCard
        answer={{
          ...answer,
          author: { ...answer.author, badge: 'VERIFIED_TRAVELER' },
        }}
        accepted={false}
        currentUserId="local-1"
      />,
    );
    expect(screen.getByText(/인증 여행자/)).toBeInTheDocument();
  });

  it('does not link an author after moderation hides the answer', () => {
    render(
      <AnswerCard
        answer={{ ...answer, removed: true }}
        accepted={false}
        currentUserId="traveler-1"
      />,
    );
    expect(screen.getByText('숨김 처리된 답변')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /공개 프로필 보기/ }),
    ).not.toBeInTheDocument();
  });

  it('drops the photo and field observation the realtime cache keeps on a hidden answer', () => {
    const { container } = render(
      <AnswerCard
        answer={{
          ...answer,
          content: '운영 정책에 따라 숨김 처리된 답변입니다.',
          sourceUrl: null,
          removed: true,
          image: {
            url: '/api/v1/media/answer-photo',
            originalName: 'queue.jpg',
            mimeType: 'image/jpeg',
          },
          observation: {
            waitMinutes: 20,
            crowdLevel: 'BUSY',
            entryStatus: 'OPEN',
            observedAt: '2026-08-01T00:05:00.000Z',
          },
        }}
        accepted={false}
        currentUserId="traveler-1"
      />,
    );
    expect(screen.getByText('숨김 처리된 답변')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByText('현장 확인 사진')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('현장 관찰 정보')).not.toBeInTheDocument();
    expect(screen.queryByText('20분')).not.toBeInTheDocument();
  });

  it('shows the photo and field observation on a visible answer', () => {
    render(
      <AnswerCard
        answer={{
          ...answer,
          image: {
            url: '/api/v1/media/answer-photo',
            originalName: 'queue.jpg',
            mimeType: 'image/jpeg',
          },
          observation: {
            waitMinutes: 20,
            crowdLevel: null,
            entryStatus: null,
            observedAt: '2026-08-01T00:05:00.000Z',
          },
        }}
        accepted={false}
        currentUserId="traveler-1"
      />,
    );
    expect(screen.getByRole('img', { name: 'queue.jpg' })).toBeInTheDocument();
    expect(screen.getByLabelText('현장 관찰 정보')).toHaveTextContent('20분');
  });
});
