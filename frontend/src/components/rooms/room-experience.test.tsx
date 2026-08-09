import { fireEvent, render, screen, within } from '@testing-library/react';
import type { Room } from '@/lib/api/rooms';
import { RoomExperience } from './room-experience';

jest.mock('../providers/realtime-provider', () => ({
  useRoomRealtime: () => 'connected',
}));
jest.mock('../messages/message-timeline', () => ({
  MessageTimeline: () => <div>실제 대화 타임라인</div>,
}));
jest.mock('../messages/message-composer', () => ({
  MessageComposer: () => <div>메시지 작성 폼</div>,
}));
jest.mock('../questions/question-feed', () => ({
  QuestionFeed: () => <div>실시간 토픽 목록</div>,
}));
jest.mock('../questions/question-composer', () => ({
  QuestionComposer: () => <div>토픽 작성 폼</div>,
}));

const room: Room = {
  id: 'room-1',
  slug: 'jeju',
  title: '제주 실시간 여행 도움방',
  destination: {
    id: 'destination-1',
    slug: 'jeju',
    nameKo: '제주',
    countryCode: 'KR',
    timezone: 'Asia/Seoul',
    center: { latitude: 33.36, longitude: 126.52 },
    radiusKm: 80,
  },
  access: {
    status: 'AVAILABLE',
    labelKo: '입장 가능',
    canViewContent: true,
    canChat: true,
    canCreateTopic: true,
    canAskQuestion: true,
    canAnswer: false,
    participantKind: 'TRAVELER',
  },
};

describe('RoomExperience conversation and topics', () => {
  it('makes conversation primary and opens direct topic creation', () => {
    render(<RoomExperience room={room} currentUserId="traveler-1" />);
    const conversation = screen.getByRole('region', { name: '제주 대화' });

    expect(
      within(conversation).queryByText('LIVE CONVERSATION'),
    ).not.toBeInTheDocument();
    expect(within(conversation).getByText('실제 대화 타임라인')).toBeVisible();
    expect(screen.getByText('메시지 작성 폼')).toBeInTheDocument();
    expect(screen.queryByText('토픽 작성 폼')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '새 토픽' }));
    expect(screen.getByText('토픽 작성 폼')).toBeInTheDocument();
  });

  it('gives a verified local the same chat and topic actions', () => {
    render(
      <RoomExperience
        room={{
          ...room,
          access: {
            ...room.access,
            canAnswer: true,
            participantKind: 'LOCAL',
          },
        }}
        currentUserId="local-1"
      />,
    );
    expect(screen.getByText('인증 현지인')).toBeInTheDocument();
    expect(screen.getByText('메시지 작성 폼')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '새 토픽' })).toBeEnabled();
  });
});
