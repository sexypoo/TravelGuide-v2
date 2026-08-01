import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createAnswer } from '@/lib/api/questions';
import { AnswerForm } from './answer-form';

jest.mock('../../lib/api/questions', () => ({
  ...jest.requireActual('../../lib/api/questions'),
  createAnswer: jest.fn(),
  createAnswerWithImage: jest.fn(),
}));

function renderForm(category: 'PLACE' | 'WAITING' = 'PLACE'): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <AnswerForm questionId="question-1" roomSlug="jeju" category={category} />
    </QueryClientProvider>,
  );
}

describe('AnswerForm', () => {
  beforeEach(() => jest.mocked(createAnswer).mockReset());

  it('requires a useful answer and an official HTTPS source', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('10자 이상');

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '지금 현장에서 직접 확인한 충분히 긴 답변입니다.' },
    });
    fireEvent.click(screen.getByLabelText('공식 정보'));
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('HTTPS 주소');
    expect(createAnswer).not.toHaveBeenCalled();
  });

  it('requires structured observations for waiting topics and submits them', async () => {
    jest.mocked(createAnswer).mockReturnValue(new Promise(() => undefined));
    renderForm('WAITING');
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '현재 대기줄 상황을 직접 확인해서 알려드립니다.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('하나 이상');

    fireEvent.change(screen.getByPlaceholderText('30'), {
      target: { value: '25' },
    });
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
    await waitFor(() =>
      expect(createAnswer).toHaveBeenCalledWith(
        'question-1',
        expect.objectContaining({
          waitMinutes: 25,
          sourceType: 'ON_SITE_NOW',
          observedAt: expect.any(String),
        }),
      ),
    );
  });
});
