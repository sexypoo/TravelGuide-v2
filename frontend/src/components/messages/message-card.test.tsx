import { fireEvent, render, screen } from '@testing-library/react';
import type { ChatMessage } from '@/lib/api/messages';
import { MessageCard } from './message-card';

jest.mock('../places/place-favorite-button', () => ({
  PlaceFavoriteButton: ({ placeName }: { placeName: string }) => (
    <button type="button">{placeName} 찜하기</button>
  ),
}));

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
  it('marks a plain message as a text bubble without changing its copy', () => {
    const { container } = render(
      <MessageCard message={message} own={false} onPromote={jest.fn()} />,
    );

    expect(container.querySelector('.chatBubble--text')).toHaveTextContent(
      message.content,
    );
  });

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
    const { container } = render(
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
    expect(topicCard).toHaveTextContent('답변3개');
    expect(topicCard).toHaveTextContent('요청1시간 내');
    expect(topicCard).toHaveTextContent('답변과 현황 보기');
    expect(topicCard).toHaveTextContent('성산일출봉 매표소');
    expect(
      container.querySelector('.sharedTopicCategory .appIcon'),
    ).toBeInTheDocument();
  });

  it('presents shared places as a clear place ticket', () => {
    const { container } = render(
      <MessageCard
        message={{
          ...message,
          type: 'PLACE',
          content: '고등어구이가 좋아요.',
          place: {
            googlePlaceId: 'google-place-1',
            name: '동백식당',
            address: '제주시 바다로 1',
            latitude: 33.5,
            longitude: 126.5,
          },
        }}
        own
        onPromote={jest.fn()}
      />,
    );

    expect(screen.getByText('장소 추천')).toBeInTheDocument();
    expect(screen.getByText('동백식당')).toBeInTheDocument();
    expect(screen.getByText('제주시 바다로 1')).toBeInTheDocument();
    expect(screen.getByText('고등어구이가 좋아요.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /지도에서 보기/ })).toHaveAttribute(
      'href',
      expect.stringContaining('query_place_id=google-place-1'),
    );
    expect(
      screen.getByRole('button', { name: '동백식당 찜하기' }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.placeTicket__eyebrow .appIcon'),
    ).toBeInTheDocument();
  });

  it('hides the generated image caption but keeps a written caption', () => {
    const imageMessage: ChatMessage = {
      ...message,
      type: 'IMAGE',
      content: '사진을 공유했습니다.',
      image: {
        url: '/api/v1/messages/message-1/image',
        originalName: 'jeju.webp',
        mimeType: 'image/webp',
      },
    };
    const { container, rerender } = render(
      <MessageCard message={imageMessage} own onPromote={jest.fn()} />,
    );
    expect(container.querySelector('.chatBubble--image p')).toBeNull();

    rerender(
      <MessageCard
        message={{ ...imageMessage, content: '오늘 협재 바다예요.' }}
        own
        onPromote={jest.fn()}
      />,
    );
    expect(container.querySelector('.chatBubble--image p')).toHaveTextContent(
      '오늘 협재 바다예요.',
    );
  });
});
