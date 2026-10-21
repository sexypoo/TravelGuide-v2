import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { Answer, QuestionDetail } from '@/lib/api/questions';
import type { Room } from '@/lib/api/rooms';
import { QuestionDetailView } from './question-detail';

let mockQuestion: QuestionDetail;

jest.mock('../../lib/query/use-questions', () => ({
  useQuestion: () => ({
    isPending: false,
    isError: false,
    data: mockQuestion,
    refetch: jest.fn(),
  }),
}));
jest.mock('../providers/realtime-provider', () => ({
  useRoomRealtime: () => 'connected',
}));

const HOUR = 60 * 60 * 1000;
const AUTHOR_ID = 'traveler-1';
const LOCAL_ID = 'local-1';

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

const localAnswer: Answer = {
  id: 'answer-1',
  questionId: 'question-1',
  author: {
    id: LOCAL_ID,
    nickname: '제주토박이',
    badge: 'VERIFIED_LOCAL',
    verifiedAt: '2026-08-01T00:00:00.000Z',
  },
  content: '지금 현장에서 직접 확인한 답변입니다.',
  contentFormat: 'PLAIN_TEXT',
  sourceType: 'ON_SITE_NOW',
  sourceUrl: null,
  removed: false,
  image: null,
  observation: null,
  createdAt: '2026-08-01T12:05:00.000Z',
  updatedAt: '2026-08-01T12:05:00.000Z',
};

function question(overrides: Partial<QuestionDetail> = {}): QuestionDetail {
  return {
    id: 'question-1',
    roomId: 'room-jeju',
    author: { id: AUTHOR_ID, nickname: '여행자', badge: 'VERIFIED_TRAVELER' },
    category: 'PLACE',
    urgency: 'NORMAL',
    content: '성산일출봉 지금 올라갈 수 있나요?',
    contentFormat: 'PLAIN_TEXT',
    areaText: null,
    image: null,
    sourceMessageId: null,
    status: 'OPEN',
    safetyNotice: null,
    answerCount: 1,
    acceptedAnswerId: null,
    expiresAt: new Date(Date.now() + HOUR).toISOString(),
    resolvedAt: null,
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
    answers: [localAnswer],
    liveSummary: null,
    ...overrides,
  };
}

function renderDetail(currentUserId: string): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <QuestionDetailView
        questionId="question-1"
        room={room}
        currentUserId={currentUserId}
      />
    </QueryClientProvider>,
  );
}

function resolvePanel(): HTMLElement | null {
  return screen.queryByRole('region', { name: '토픽 해결 결정' });
}

function answerSubmit(): HTMLElement | null {
  return screen.queryByRole('button', { name: '답변 보내기' });
}

describe('QuestionDetailView', () => {
  it('shows the resolve panel and no answer form to the author of an open topic', () => {
    mockQuestion = question();
    renderDetail(AUTHOR_ID);

    expect(resolvePanel()).toBeInTheDocument();
    expect(answerSubmit()).not.toBeInTheDocument();
  });

  it('hides the resolve panel once an open topic has expired', () => {
    mockQuestion = question({
      expiresAt: new Date(Date.now() - HOUR).toISOString(),
    });
    renderDetail(AUTHOR_ID);

    expect(resolvePanel()).not.toBeInTheDocument();
    expect(answerSubmit()).not.toBeInTheDocument();
  });

  it('shows the answer form and no resolve panel to other participants', () => {
    mockQuestion = question();
    renderDetail(LOCAL_ID);

    expect(answerSubmit()).toBeInTheDocument();
    expect(resolvePanel()).not.toBeInTheDocument();
  });

  it('announces an accepted answer on a resolved topic without actions', () => {
    mockQuestion = question({
      status: 'RESOLVED',
      acceptedAnswerId: 'answer-1',
      resolvedAt: '2026-08-01T12:30:00.000Z',
    });
    renderDetail(AUTHOR_ID);

    expect(
      screen.getByText('작성자가 도움이 된 답변을 채택했어요'),
    ).toBeInTheDocument();
    expect(resolvePanel()).not.toBeInTheDocument();
    expect(answerSubmit()).not.toBeInTheDocument();
  });

  it('announces a topic resolved without an answer and hides the answer form', () => {
    mockQuestion = question({
      status: 'RESOLVED',
      acceptedAnswerId: null,
      resolvedAt: '2026-08-01T12:30:00.000Z',
    });
    renderDetail(LOCAL_ID);

    expect(
      screen.getByText('작성자가 해결된 상황으로 확인했어요'),
    ).toBeInTheDocument();
    expect(resolvePanel()).not.toBeInTheDocument();
    expect(answerSubmit()).not.toBeInTheDocument();
  });
});
