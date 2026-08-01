import { fireEvent, render, screen } from '@testing-library/react';
import { useQuestions } from '@/lib/query/use-questions';
import { QuestionFeed } from './question-feed';

jest.mock('../../lib/query/use-questions', () => ({ useQuestions: jest.fn() }));
jest.mock('./question-card', () => ({
  QuestionCard: ({ question }: { question: { content: string } }) => (
    <article>{question.content}</article>
  ),
}));

function queryResult(
  overrides: Record<string, unknown> = {},
): ReturnType<typeof useQuestions> {
  return {
    isPending: false,
    isError: false,
    data: { questions: [], pages: [] },
    refetch: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useQuestions>;
}

describe('QuestionFeed', () => {
  beforeEach(() => jest.mocked(useQuestions).mockReset());

  it('renders loading, error retry, and the resolved empty state', () => {
    jest.mocked(useQuestions).mockReturnValue(queryResult({ isPending: true }));
    const { rerender } = render(<QuestionFeed roomSlug="jeju" status="OPEN" />);
    expect(screen.getByLabelText('토픽을 불러오는 중')).toBeInTheDocument();

    const refetch = jest.fn();
    jest
      .mocked(useQuestions)
      .mockReturnValue(queryResult({ isError: true, refetch }));
    rerender(<QuestionFeed roomSlug="jeju" status="OPEN" />);
    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
    expect(refetch).toHaveBeenCalledTimes(1);

    jest.mocked(useQuestions).mockReturnValue(queryResult());
    rerender(<QuestionFeed roomSlug="jeju" status="RESOLVED" />);
    expect(screen.getByText('아직 해결된 토픽이 없어요')).toBeInTheDocument();
  });

  it('filters, renders questions, and fetches the next page', () => {
    const fetchNextPage = jest.fn();
    jest.mocked(useQuestions).mockReturnValue(
      queryResult({
        data: {
          questions: [
            { id: 'question-1', content: '제주공항 대기 현황을 알려주세요.' },
          ],
          pages: [],
        },
        hasNextPage: true,
        fetchNextPage,
      }),
    );
    render(<QuestionFeed roomSlug="jeju" status="OPEN" />);
    expect(
      screen.getByText('제주공항 대기 현황을 알려주세요.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '대기 현황' }));
    expect(useQuestions).toHaveBeenLastCalledWith('jeju', 'OPEN', 'WAITING');
    fireEvent.click(screen.getByRole('button', { name: '토픽 더 보기' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
