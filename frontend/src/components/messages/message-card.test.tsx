import { fireEvent, render, screen } from '@testing-library/react';
import type { ChatMessage } from '@/lib/api/messages';
import { MessageCard } from './message-card';

const message: ChatMessage = {
  id: 'message-1',
  roomId: 'room-1',
  author: {
    id: 'traveler-1',
    nickname: '제주여행자',
    badge: 'VERIFIED_TRAVELER',
  },
  type: 'TEXT',
  content: '공항에서 서귀포로 가는 버스가 지금 많이 지연되고 있나요?',
  contentFormat: 'PLAIN_TEXT',
  removed: false,
  topicId: null,
  image: null,
  place: null,
  sharedTopic: null,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
};

describe('MessageCard topic handoff', () => {
  it('lets only an eligible own message start promotion', () => {
    const onPromote = jest.fn();
    const { rerender } = render(
      <MessageCard message={message} own onPromote={onPromote} />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: '이 메시지를 토픽으로 만들기' }),
    );
    expect(onPromote).toHaveBeenCalledWith(message);

    rerender(
      <MessageCard message={message} own={false} onPromote={onPromote} />,
    );
    expect(
      screen.queryByRole('button', { name: '이 메시지를 토픽으로 만들기' }),
    ).not.toBeInTheDocument();
  });

  it('links an already promoted message to its topic', () => {
    render(
      <MessageCard
        message={{ ...message, topicId: 'topic-1' }}
        own
        onPromote={jest.fn()}
      />,
    );
    expect(
      screen.getByRole('link', { name: /토픽으로 이어짐/ }),
    ).toHaveAttribute('href', '/app/questions/topic-1');
  });

  it('shows a shared topic as a concise status card', () => {
    render(
      <MessageCard
        message={{
          ...message,
          type: 'TOPIC_SHARE',
          content: '',
          sharedTopic: {
            id: 'topic-2',
            authorNickname: '제주여행자',
            category: 'WAITING',
            urgency: 'URGENT',
            content: '성산일출봉 입장 대기가 얼마나 되나요?',
            areaText: '성산일출봉 매표소',
            status: 'OPEN',
            answerCount: 3,
          },
        }}
        own={false}
        onPromote={jest.fn()}
      />,
    );

    const topicCard = screen.getByRole('link', {
      name: /성산일출봉 입장 대기가 얼마나 되나요/,
    });
    expect(topicCard).toHaveAttribute('href', '/app/questions/topic-2');
    expect(topicCard).toHaveTextContent('대기 현황');
    expect(topicCard).toHaveTextContent('진행 중');
    expect(topicCard).toHaveTextContent('도착한 답변3개');
    expect(topicCard).toHaveTextContent('답변 요청1시간 내');
    expect(topicCard).toHaveTextContent('성산일출봉 매표소');
  });
});
