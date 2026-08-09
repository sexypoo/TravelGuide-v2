export const lockedRoomPayload = {
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
  privateFeed: ['must-not-survive'],
};

export const profilePayload = {
  id: 'user-1',
  email: 'traveler@example.com',
  nickname: '제주여행자',
  bio: '제주 여행을 준비하고 있어요.',
  travelStyles: ['SLOW_TRAVEL', 'FOOD_EXPLORER'],
  role: 'USER',
  isAdmin: false,
  createdAt: '2026-07-30T12:00:00.000Z',
  updatedAt: '2026-07-30T12:30:00.000Z',
  passwordHash: 'must-not-survive',
};
