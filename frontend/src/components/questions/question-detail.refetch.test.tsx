import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { getQuestion, type QuestionDetail } from '@/lib/api/questions';
import type { Room } from '@/lib/api/rooms';
import { queryKeys } from '@/lib/query/keys';
import { QuestionDetailView } from './question-detail';

// Uses the real useQuestion hook and a real QueryClient so the TanStack Query
// v5 behavior (isError stays true with data after a failed refetch) is pinned.
jest.mock('../../lib/api/questions', () => ({
  ...jest.requireActual<object>('../../lib/api/questions'),
  getQuestion: jest.fn(),
}));
jest.mock('../providers/realtime-provider', () => ({
  useRoomRealtime: () => 'connected',
}));

const room: Room = {
  id: 'room-jeju',
  slug: 'jeju',
  title: '제주 도움방',
  destination: {
    id: 'destination-jeju',
    slug: 'jeju',
    nameKo: '제주',
    countryCode: 'KR',
    timezone: 'Asia/Seoul',
    center: { latitude: 33.4996, longitude: 126.5312 },
    radiusKm: 50,
  },
  access: {
    status: 'AVAILABLE',
    labelKo: '입장 가능',
    canViewContent: true,
    canChat: true,
    canCreateTopic: true,
    canAskQuestion: true,
    canAnswer: true,
    participantKind: 'BOTH',
  },
};

const topic: QuestionDetail = {
  id: 'question-1',
  roomId: 'room-jeju',
  author: { id: 'traveler-1', nickname: '여행자', badge: 'VERIFIED_TRAVELER' },
  category: 'PLACE',
  urgency: 'NORMAL',
  content: '성산일출봉 지금 올라갈 수 있나요?',
  contentFormat: 'PLAIN_TEXT',
  areaText: null,
  image: null,
  sourceMessageId: null,
  status: 'OPEN',
  safetyNotice: null,
  answerCount: 0,
  acceptedAnswerId: null,
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  resolvedAt: null,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
  answers: [],
  liveSummary: null,
};

const REFETCH_NOTICE =
  '토픽을 새로 불러오지 못했어요. 보이는 내용이 최신이 아닐 수 있어요.';

describe('QuestionDetailView with a real QueryClient', () => {
  it('keeps the topic and answer draft after a failed refetch, then recovers on retry', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.mocked(getQuestion).mockResolvedValueOnce(topic);
    render(
      <QueryClientProvider client={queryClient}>
        <QuestionDetailView
          questionId="question-1"
          room={room}
          currentUserId="local-1"
        />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: topic.content }),
    ).toBeInTheDocument();
    const draft = '지금 매표소 줄이 짧아서 바로 올라갈 수 있어요.';
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: draft },
    });

    jest.mocked(getQuestion).mockRejectedValueOnce(new Error('network'));
    await act(() =>
      queryClient.refetchQueries({
        queryKey: queryKeys.question('question-1'),
      }),
    );

    expect(await screen.findByText(REFETCH_NOTICE)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: topic.content }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue(draft);

    jest.mocked(getQuestion).mockResolvedValueOnce(topic);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    await waitFor(() =>
      expect(screen.queryByText(REFETCH_NOTICE)).not.toBeInTheDocument(),
    );
    expect(getQuestion).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('textbox')).toHaveValue(draft);
  });
});
