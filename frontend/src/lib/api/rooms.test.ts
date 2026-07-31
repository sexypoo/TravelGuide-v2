import { parseRoom, parseRooms } from './rooms';
import { lockedRoomPayload } from '@/test/fixtures';

describe('room contracts', () => {
  it('parses exact public metadata and drops unknown fields', () => {
    const room = parseRoom(lockedRoomPayload);

    expect(room).toEqual({
      id: 'room-jeju',
      slug: 'jeju',
      title: '제주 실시간 여행 도움방',
      destination: {
        id: 'destination-jeju',
        slug: 'jeju',
        nameKo: '제주',
        countryCode: 'KR',
        timezone: 'Asia/Seoul',
        center: { latitude: 33.3617, longitude: 126.5292 },
        radiusKm: 80,
      },
      access: {
        status: 'VERIFICATION_REQUIRED',
        labelKo: '인증 필요',
        canViewContent: false,
        canChat: false,
        canCreateTopic: false,
        canAskQuestion: false,
        canAnswer: false,
        participantKind: null,
      },
    });
    expect(JSON.stringify(room)).not.toContain('privateFeed');
    expect(parseRooms([lockedRoomPayload])).toHaveLength(1);
  });

  it('rejects contradictory access states and invalid coordinates', () => {
    expect(() =>
      parseRoom({
        ...lockedRoomPayload,
        access: { ...lockedRoomPayload.access, canViewContent: true },
      }),
    ).toThrow('방 접근 상태 값이 일치하지 않습니다.');
    expect(() =>
      parseRoom({
        ...lockedRoomPayload,
        destination: {
          ...lockedRoomPayload.destination,
          center: { latitude: '33.3617', longitude: 126.5292 },
        },
      }),
    ).toThrow('여행지 정보 형식이 올바르지 않습니다.');
  });
});
