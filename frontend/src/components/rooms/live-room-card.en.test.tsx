import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@/i18n/client';
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

const question: Question = {
  id: 'q1',
  roomId: openRoom.id,
  author: { id: 'u1', nickname: 'traveler', badge: 'VERIFIED_TRAVELER' },
  category: 'WAITING',
  urgency: 'NORMAL',
  content: 'How long is the line at Seongsan?',
  contentFormat: 'PLAIN_TEXT',
  areaText: null,
  image: null,
  sourceMessageId: null,
  status: 'OPEN',
  safetyNotice: null,
  answerCount: 2,
  acceptedAnswerId: null,
  expiresAt: '2026-10-18T12:00:00.000Z',
  resolvedAt: null,
  createdAt: '2026-10-18T04:48:00.000Z',
  updatedAt: '2026-10-18T04:48:00.000Z',
};

const now = new Date('2026-10-18T05:00:00.000Z');

describe('LiveRoomCard in English (#80)', () => {
  it('shows the open room with an English city name and topic feed', () => {
    render(
      <I18nProvider locale="en">
        <LiveRoomCard
          room={openRoom}
          openQuestions={{ items: [question], nextCursor: 'next' }}
          now={now}
        />
      </I18nProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Jeju help room' }),
    ).toBeVisible();
    expect(screen.getByText('1+ open topics')).toBeVisible();
    expect(screen.getByText('Posted 12 min ago')).toBeVisible();
    expect(screen.getByLabelText('2 answers')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Enter room' })).toHaveAttribute(
      'href',
      '/app/rooms/jeju',
    );
  });

  it('labels a locked room by access status instead of the Korean API label', () => {
    render(
      <I18nProvider locale="en">
        <LiveRoomCard room={lockedRoom} openQuestions={null} now={now} />
      </I18nProvider>,
    );

    expect(screen.getByText('Verification needed')).toBeVisible();
    expect(screen.queryByText('인증 필요')).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Get verified to join' }),
    ).toHaveAttribute('href', '/app/verifications');
    expect(screen.getByRole('link', { name: 'About this room' })).toBeVisible();
  });
});
