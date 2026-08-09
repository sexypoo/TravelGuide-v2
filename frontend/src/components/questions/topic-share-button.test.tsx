import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { shareTopicMessage, type ChatMessage } from '@/lib/api/messages';
import { TopicShareButton } from './topic-share-button';

jest.mock('../../lib/api/messages', () => ({
  ...jest.requireActual('../../lib/api/messages'),
  shareTopicMessage: jest.fn(),
}));

const sharedMessage: ChatMessage = {
  id: 'message-topic-1',
  roomId: 'room-jeju',
  author: {
    id: 'traveler-1',
    nickname: '제주여행자',
    badge: 'VERIFIED_TRAVELER',
  },
  type: 'TOPIC_SHARE',
  content: '제주공항 입장 대기 시간을 알려주세요.',
  contentFormat: 'PLAIN_TEXT',
  removed: false,
  topicId: null,
  image: null,
  place: null,
  sharedTopic: {
    id: 'question-1',
    authorNickname: '제주여행자',
    category: 'WAITING',
    urgency: 'URGENT',
    content: '제주공항 입장 대기 시간을 알려주세요.',
    areaText: '제주공항 1층',
    status: 'OPEN',
    answerCount: 0,
  },
  createdAt: '2026-08-09T10:00:01.000Z',
  updatedAt: '2026-08-09T10:00:01.000Z',
};

describe('TopicShareButton', () => {
  beforeEach(() => jest.mocked(shareTopicMessage).mockReset());

  it('keeps the button available so the topic can be sent again', async () => {
    jest.mocked(shareTopicMessage).mockResolvedValue(sharedMessage);
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <TopicShareButton roomSlug="jeju" questionId="question-1" />
      </QueryClientProvider>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: '채팅방에 카드로 보내기' }),
    );
    const resendButton = await screen.findByRole('button', {
      name: '채팅방에 다시 보내기',
    });
    expect(resendButton).toBeEnabled();

    fireEvent.click(resendButton);
    await waitFor(() => expect(shareTopicMessage).toHaveBeenCalledTimes(2));
  });
});
