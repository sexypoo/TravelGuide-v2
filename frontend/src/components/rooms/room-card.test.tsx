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
});
