import { render, screen } from '@testing-library/react';
import type { Question } from '@/lib/api/questions';
import { parseRoom, type Room } from '@/lib/api/rooms';
import { lockedRoomPayload } from '@/test/fixtures';
import { LiveRoomCard } from './live-room-card';

const lockedRoom = parseRoom(lockedRoomPayload);

const openRoom: Room = {
  ...lockedRoom,
  access: {
    status: 'AVAILABLE',
    labelKo: '입장 가능',
    canViewContent: true,
    canChat: true,
    canCreateTopic: true,
    canAskQuestion: true,
    canAnswer: true,
    participantKind: 'TRAVELER',
  },
};

const pendingRoom: Room = {
  ...lockedRoom,
  access: {
    ...lockedRoom.access,
    status: 'TRAVELER_PENDING',
    labelKo: '여행자 심사 중',
  },
};

function question(id: string, content: string, answerCount: number): Question {
  return {
    id,
    roomId: openRoom.id,
    author: { id: 'u1', nickname: '여행자', badge: 'VERIFIED_TRAVELER' },
    category: 'WAITING',
    urgency: 'NORMAL',
    content,
    contentFormat: 'PLAIN_TEXT',
    areaText: null,
    image: null,
    sourceMessageId: null,
    status: 'OPEN',
    safetyNotice: null,
    answerCount,
    acceptedAnswerId: null,
    expiresAt: '2026-10-18T12:00:00.000Z',
    resolvedAt: null,
    createdAt: '2026-10-18T04:48:00.000Z',
    updatedAt: '2026-10-18T04:48:00.000Z',
  };
}

const now = new Date('2026-10-18T05:00:00.000Z');

describe('LiveRoomCard', () => {
  it('shows open topics with answer counts and the way into the room', () => {
    render(
      <LiveRoomCard
        room={openRoom}
        openQuestions={{
          items: [question('q1', '성산일출봉 대기 얼마나 걸려요?', 2)],
          nextCursor: null,
        }}
        now={now}
      />,
    );

    expect(screen.getByRole('heading', { name: '제주 도움방' })).toBeVisible();
    expect(screen.getByText('진행 중인 토픽 1개')).toBeVisible();
    expect(
      screen.getByRole('link', { name: /성산일출봉 대기 얼마나 걸려요\?/ }),
    ).toHaveAttribute('href', '/app/questions/q1');
    expect(screen.getByLabelText('답변 2개')).toBeVisible();
    expect(screen.getByText('12분 전에 올라왔어요')).toBeVisible();
    expect(screen.getByRole('link', { name: '방 들어가기' })).toHaveAttribute(
      'href',
      '/app/rooms/jeju',
    );
  });

  it('says when a page of topics has more behind it', () => {
    render(
      <LiveRoomCard
        room={openRoom}
        openQuestions={{
          items: [question('q1', '질문', 0)],
          nextCursor: 'next',
        }}
        now={now}
      />,
    );
    expect(screen.getByText('진행 중인 토픽 1개 이상')).toBeVisible();
  });

  it('sends an unverified visitor to verification without showing topics', () => {
    render(<LiveRoomCard room={lockedRoom} openQuestions={null} now={now} />);

    expect(screen.getByText('인증 필요')).toBeVisible();
    expect(
      screen.getByRole('link', { name: '인증하고 참여하기' }),
    ).toHaveAttribute('href', '/app/verifications');
    expect(screen.getByRole('link', { name: '방 소개 보기' })).toHaveAttribute(
      'href',
      '/app/rooms/jeju',
    );
    expect(screen.queryByRole('list', { name: '진행 중인 토픽' })).toBeNull();
  });

  it('points a pending applicant to their review status', () => {
    render(<LiveRoomCard room={pendingRoom} openQuestions={null} now={now} />);
    expect(screen.getByRole('link', { name: '심사 현황 보기' })).toBeVisible();
  });
});
