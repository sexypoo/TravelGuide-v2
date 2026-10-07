import { render, screen } from '@testing-library/react';
import { parseRoom } from '@/lib/api/rooms';
import { lockedRoomPayload } from '@/test/fixtures';
import { RoomCard } from './room-card';

describe('RoomCard', () => {
  it('shows truthful locked metadata and a room-introduction link', () => {
    render(<RoomCard room={parseRoom(lockedRoomPayload)} />);

    expect(screen.getByText('제주 실시간 여행 도움방')).toBeInTheDocument();
    expect(screen.getByText('인증 필요')).toBeInTheDocument();
    expect(
      screen.getByText('인증된 여행자와 현지인만 질문과 답변을 볼 수 있어요.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /방 소개 보기/ })).toHaveAttribute(
      'href',
      '/app/rooms/jeju',
    );
  });

  it('labels an enterable room by its heading and links straight in', () => {
    render(
      <RoomCard
        room={parseRoom({
          ...lockedRoomPayload,
          access: {
            ...lockedRoomPayload.access,
            status: 'AVAILABLE',
            labelKo: '입장 가능',
            canViewContent: true,
            canChat: true,
            canCreateTopic: true,
            participantKind: 'TRAVELER',
          },
        })}
      />,
    );

    expect(
      screen.getByRole('article', { name: '제주 실시간 여행 도움방' }),
    ).toHaveAttribute('data-access', 'open');
    expect(screen.getByText('입장 가능')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '방으로 이동' })).toHaveAttribute(
      'href',
      '/app/rooms/jeju',
    );
  });
});
