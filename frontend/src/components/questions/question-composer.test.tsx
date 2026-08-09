import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { shareTopicMessage, type ChatMessage } from '@/lib/api/messages';
import { createQuestion, type Question } from '@/lib/api/questions';
import { QuestionComposer } from './question-composer';

jest.mock('../../lib/api/questions', () => ({
  ...jest.requireActual('../../lib/api/questions'),
  createQuestion: jest.fn(),
  createQuestionWithImage: jest.fn(),
}));

jest.mock('../../lib/api/messages', () => ({
  ...jest.requireActual('../../lib/api/messages'),
  shareTopicMessage: jest.fn(),
}));

const question: Question = {
  id: 'question-1',
  roomId: 'room-jeju',
  author: {
    id: 'traveler-1',
    nickname: '제주여행자',
    badge: 'VERIFIED_TRAVELER',
  },
  category: 'WAITING',
  urgency: 'URGENT',
  content: '현재 제주공항 입장 대기 시간이 얼마나 되는지 알려주세요.',
  contentFormat: 'PLAIN_TEXT',
  areaText: '제주공항 1층',
  image: null,
  sourceMessageId: null,
  status: 'OPEN',
  safetyNotice: null,
  answerCount: 0,
  acceptedAnswerId: null,
  expiresAt: '2026-08-10T10:00:00.000Z',
  resolvedAt: null,
  createdAt: '2026-08-09T10:00:00.000Z',
  updatedAt: '2026-08-09T10:00:00.000Z',
};

const sharedMessage: ChatMessage = {
  id: 'message-topic-1',
  roomId: 'room-jeju',
  author: question.author,
  type: 'TOPIC_SHARE',
  content: question.content,
  contentFormat: 'PLAIN_TEXT',
  removed: false,
  topicId: null,
  image: null,
  place: null,
  sharedTopic: {
    id: question.id,
    authorNickname: question.author.nickname,
    category: question.category,
    urgency: question.urgency,
    content: question.content,
    areaText: question.areaText,
    status: question.status,
    answerCount: 0,
  },
  createdAt: '2026-08-09T10:00:01.000Z',
  updatedAt: '2026-08-09T10:00:01.000Z',
};

function renderComposer(
  onCreated?: (result: { autoShared: boolean }) => void,
): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <QuestionComposer roomSlug="jeju" onCreated={onCreated} />
    </QueryClientProvider>,
  );
}

describe('QuestionComposer', () => {
  beforeEach(() => {
    jest.mocked(createQuestion).mockReset();
    jest.mocked(shareTopicMessage).mockReset();
  });

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

  it('automatically shares the newly created topic into the chat', async () => {
    const onCreated = jest.fn();
    jest.mocked(createQuestion).mockResolvedValue(question);
    jest.mocked(shareTopicMessage).mockResolvedValue(sharedMessage);
    renderComposer(onCreated);

    fireEvent.change(screen.getByRole('textbox', { name: /토픽 내용/ }), {
      target: { value: question.content },
    });
    fireEvent.click(screen.getByRole('button', { name: '토픽 만들기' }));

    await waitFor(() =>
      expect(shareTopicMessage).toHaveBeenCalledWith('jeju', question.id),
    );
    expect(onCreated).toHaveBeenCalledWith({ autoShared: true });
  });
});
