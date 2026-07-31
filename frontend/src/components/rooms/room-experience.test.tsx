import { fireEvent, render, screen } from '@testing-library/react';
import type { Room } from '@/lib/api/rooms';
import { RoomExperience } from './room-experience';

jest.mock('../providers/realtime-provider', () => ({
  useRoomRealtime: () => 'connected',
}));
jest.mock('../questions/question-feed', () => ({
  QuestionFeed: () => <div>실제 질문 피드</div>,
}));
jest.mock('../questions/question-composer', () => ({
  QuestionComposer: () => <div>질문 작성 폼</div>,
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
    canAskQuestion: true,
    canAnswer: false,
  },
};

describe('RoomExperience capabilities', () => {
  it('shows the traveler composer only after the traveler asks to open it', () => {
    render(<RoomExperience room={room} />);
    expect(screen.queryByText('질문 작성 폼')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '지금 질문하기' }));
    expect(screen.getByText('질문 작성 폼')).toBeInTheDocument();
  });

  it('shows answer guidance but no question action to a local', () => {
    render(
      <RoomExperience
        room={{
          ...room,
          access: { ...room.access, canAskQuestion: false, canAnswer: true },
        }}
      />,
    );
    expect(
      screen.queryByRole('button', { name: '지금 질문하기' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/답변 가능한 질문을 확인/)).toBeInTheDocument();
  });
});
