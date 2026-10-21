import {
  QueryClient,
  QueryClientProvider,
  type InfiniteData,
} from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  acceptAnswer,
  resolveQuestion,
  type Answer,
  type QuestionDetail,
  type QuestionPage,
} from '@/lib/api/questions';
import { queryKeys } from '@/lib/query/keys';
import { TopicResolutionActions } from './topic-resolution-actions';

jest.mock('../../lib/api/questions', () => ({
  ...jest.requireActual('../../lib/api/questions'),
  acceptAnswer: jest.fn(),
  resolveQuestion: jest.fn(),
}));

const ROOM_SLUG = 'jeju';

function answer(id: string, nickname: string, removed = false): Answer {
  return {
    id,
    questionId: 'question-1',
    author: {
      id: `local-${id}`,
      nickname,
      badge: 'VERIFIED_LOCAL',
      verifiedAt: '2026-08-01T00:00:00.000Z',
    },
    content: '지금 현장에서 직접 확인한 답변입니다.',
    contentFormat: 'PLAIN_TEXT',
    sourceType: 'ON_SITE_NOW',
    sourceUrl: null,
    removed,
    image: null,
    observation: null,
    createdAt: '2026-08-01T12:05:00.000Z',
    updatedAt: '2026-08-01T12:05:00.000Z',
  };
}

function openQuestion(answers: Answer[]): QuestionDetail {
  return {
    id: 'question-1',
    roomId: 'room-jeju',
    author: {
      id: 'traveler-1',
      nickname: '여행자',
      badge: 'VERIFIED_TRAVELER',
    },
    category: 'PLACE',
    urgency: 'NORMAL',
    content: '성산일출봉 지금 올라갈 수 있나요?',
    contentFormat: 'PLAIN_TEXT',
    areaText: null,
    image: null,
    sourceMessageId: null,
    status: 'OPEN',
    safetyNotice: null,
    answerCount: answers.length,
    acceptedAnswerId: null,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
    answers,
    liveSummary: null,
  };
}

function feed(items: QuestionDetail[]): InfiniteData<QuestionPage> {
  return {
    pages: [{ items, nextCursor: null }],
    pageParams: [null],
  };
}

function renderActions(question: QuestionDetail): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <TopicResolutionActions question={question} roomSlug={ROOM_SLUG} />
    </QueryClientProvider>,
  );
  return queryClient;
}

describe('TopicResolutionActions', () => {
  beforeEach(() => {
    jest.mocked(acceptAnswer).mockReset();
    jest.mocked(resolveQuestion).mockReset();
  });

  it('does not offer hidden answers as accept choices', () => {
    renderActions(
      openQuestion([
        answer('answer-1', '제주토박이'),
        answer('answer-2', '숨김답변자', true),
      ]),
    );

    expect(
      screen.getByRole('button', { name: /제주토박이.*답변 채택/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /숨김답변자/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '답변 없이 해결됨으로 표시' }),
    ).toBeInTheDocument();
  });

  it('accepts the chosen answer and moves the topic to the resolved feed', async () => {
    const question = openQuestion([answer('answer-1', '제주토박이')]);
    const resolved: QuestionDetail = {
      ...question,
      status: 'RESOLVED',
      acceptedAnswerId: 'answer-1',
      resolvedAt: '2026-08-01T12:30:00.000Z',
    };
    jest.mocked(acceptAnswer).mockResolvedValue(resolved);
    const queryClient = renderActions(question);
    queryClient.setQueryData(queryKeys.question(question.id), question);
    queryClient.setQueryData(
      queryKeys.roomQuestions(ROOM_SLUG, 'OPEN'),
      feed([question]),
    );
    queryClient.setQueryData(
      queryKeys.roomQuestions(ROOM_SLUG, 'RESOLVED'),
      feed([]),
    );

    fireEvent.click(
      screen.getByRole('button', { name: /제주토박이.*답변 채택/ }),
    );
    expect(
      screen.getByText('제주토박이님의 답변을 채택할까요?'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '채택하고 해결' }));

    await waitFor(() =>
      expect(acceptAnswer).toHaveBeenCalledWith('question-1', 'answer-1'),
    );
    expect(resolveQuestion).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(queryClient.getQueryData(queryKeys.question(question.id))).toEqual(
        resolved,
      ),
    );
    const openFeed = queryClient.getQueryData<InfiniteData<QuestionPage>>(
      queryKeys.roomQuestions(ROOM_SLUG, 'OPEN'),
    );
    const resolvedFeed = queryClient.getQueryData<InfiniteData<QuestionPage>>(
      queryKeys.roomQuestions(ROOM_SLUG, 'RESOLVED'),
    );
    expect(openFeed?.pages.flatMap((page) => page.items)).toEqual([]);
    expect(
      resolvedFeed?.pages.flatMap((page) => page.items).map((item) => item.id),
    ).toEqual(['question-1']);
  });

  it('resolves without an answer using only resolveQuestion', async () => {
    const question = openQuestion([answer('answer-1', '제주토박이')]);
    jest.mocked(resolveQuestion).mockResolvedValue({
      ...question,
      status: 'RESOLVED',
      resolvedAt: '2026-08-01T12:30:00.000Z',
    });
    renderActions(question);

    fireEvent.click(
      screen.getByRole('button', { name: '답변 없이 해결됨으로 표시' }),
    );
    expect(
      screen.getByText('답변 채택 없이 이 토픽을 해결할까요?'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '해결 확정' }));

    await waitFor(() =>
      expect(resolveQuestion).toHaveBeenCalledWith('question-1'),
    );
    expect(acceptAnswer).not.toHaveBeenCalled();
  });

  it('clears a failed save error after cancel and a new choice', async () => {
    jest.mocked(acceptAnswer).mockRejectedValue(new Error('network down'));
    renderActions(openQuestion([answer('answer-1', '제주토박이')]));

    fireEvent.click(
      screen.getByRole('button', { name: /제주토박이.*답변 채택/ }),
    );
    fireEvent.click(screen.getByRole('button', { name: '채택하고 해결' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '해결 상태를 저장하지 못했습니다',
    );

    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    fireEvent.click(
      screen.getByRole('button', { name: '답변 없이 해결됨으로 표시' }),
    );

    expect(
      screen.getByText('답변 채택 없이 이 토픽을 해결할까요?'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(resolveQuestion).not.toHaveBeenCalled();
  });
});
