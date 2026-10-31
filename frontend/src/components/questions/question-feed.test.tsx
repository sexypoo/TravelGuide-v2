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
      .mockReturnValue(
        queryResult({ isError: true, data: undefined, refetch }),
      );
    rerender(<QuestionFeed roomSlug="jeju" status="OPEN" />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      '토픽을 불러오지 못했어요',
    );
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

  it('keeps loaded topics when a refetch fails and retries with refetch', () => {
    const refetch = jest.fn();
    const fetchNextPage = jest.fn();
    const result = (overrides: Record<string, unknown> = {}) =>
      queryResult({
        isError: true,
        isRefetchError: true,
        isFetching: false,
        data: {
          questions: [
            { id: 'question-1', content: '제주공항 대기 현황을 알려주세요.' },
          ],
          pages: [],
        },
        refetch,
        fetchNextPage,
        ...overrides,
      });
    jest.mocked(useQuestions).mockReturnValue(result());
    const { rerender } = render(<QuestionFeed roomSlug="jeju" status="OPEN" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByText('제주공항 대기 현황을 알려주세요.'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByText(
          '토픽 목록을 새로 불러오지 못했어요. 보이는 내용이 최신이 아닐 수 있어요.',
        )
        .closest('[role="status"]'),
    ).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(fetchNextPage).not.toHaveBeenCalled();

    // Filters stay usable while the retry row is shown.
    fireEvent.click(screen.getByRole('button', { name: '대기 현황' }));
    expect(useQuestions).toHaveBeenLastCalledWith('jeju', 'OPEN', 'WAITING');

    jest.mocked(useQuestions).mockReturnValue(result({ isFetching: true }));
    rerender(<QuestionFeed roomSlug="jeju" status="OPEN" />);
    expect(screen.getByRole('button', { name: '불러오는 중' })).toBeDisabled();
  });

  it('shows the refetch retry row above an empty cached list', () => {
    jest
      .mocked(useQuestions)
      .mockReturnValue(queryResult({ isError: true, isRefetchError: true }));
    render(<QuestionFeed roomSlug="jeju" status="OPEN" />);

    expect(
      screen.getByText('아직 진행 중인 토픽이 없어요'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '토픽 목록을 새로 불러오지 못했어요. 보이는 내용이 최신이 아닐 수 있어요.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('replaces the more button with a retry row when the next page fails', () => {
    const refetch = jest.fn();
    const fetchNextPage = jest.fn();
    const result = (overrides: Record<string, unknown> = {}) =>
      queryResult({
        isError: true,
        isFetchNextPageError: true,
        data: {
          questions: [
            { id: 'question-1', content: '제주공항 대기 현황을 알려주세요.' },
          ],
          pages: [],
        },
        hasNextPage: true,
        refetch,
        fetchNextPage,
        ...overrides,
      });
    jest.mocked(useQuestions).mockReturnValue(result());
    const { rerender } = render(<QuestionFeed roomSlug="jeju" status="OPEN" />);

    expect(
      screen.getByText('제주공항 대기 현황을 알려주세요.'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByText('토픽을 더 불러오지 못했어요.')
        .closest('[role="status"]'),
    ).not.toBeNull();
    expect(
      screen.queryByRole('button', { name: '토픽 더 보기' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    expect(refetch).not.toHaveBeenCalled();

    jest
      .mocked(useQuestions)
      .mockReturnValue(result({ isFetchingNextPage: true }));
    rerender(<QuestionFeed roomSlug="jeju" status="OPEN" />);
    expect(
      screen.queryByText('토픽을 더 불러오지 못했어요.'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '불러오는 중' })).toBeDisabled();
  });
});
