import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createQuestion } from '@/lib/api/questions';
import { QuestionComposer } from './question-composer';

jest.mock('../../lib/api/questions', () => ({
  ...jest.requireActual('../../lib/api/questions'),
  createQuestion: jest.fn(),
  createQuestionWithImage: jest.fn(),
}));

function renderComposer(): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <QuestionComposer roomSlug="jeju" />
    </QueryClientProvider>,
  );
}

describe('QuestionComposer', () => {
  beforeEach(() => jest.mocked(createQuestion).mockReset());

  it('rejects short topics before an API request', () => {
    renderComposer();
    fireEvent.change(screen.getByRole('textbox', { name: /토픽 내용/ }), {
      target: { value: '너무 짧아요' },
    });
    fireEvent.click(screen.getByRole('button', { name: '토픽 만들기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('20자 이상');
    expect(createQuestion).not.toHaveBeenCalled();
  });

  it('submits the selected topic metadata as plain text', async () => {
    jest.mocked(createQuestion).mockReturnValue(new Promise(() => undefined));
    renderComposer();
    fireEvent.click(screen.getByLabelText('대기 현황'));
    fireEvent.click(screen.getByLabelText('1시간 내'));
    fireEvent.change(screen.getByRole('textbox', { name: /지역·장소/ }), {
      target: { value: '제주공항 1층' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /토픽 내용/ }), {
      target: {
        value: '현재 제주공항 입장 대기 시간이 얼마나 되는지 알려주세요.',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: '토픽 만들기' }));
    await waitFor(() =>
      expect(createQuestion).toHaveBeenCalledWith('jeju', {
        category: 'WAITING',
        urgency: 'URGENT',
        areaText: '제주공항 1층',
        content: '현재 제주공항 입장 대기 시간이 얼마나 되는지 알려주세요.',
      }),
    );
  });
});
