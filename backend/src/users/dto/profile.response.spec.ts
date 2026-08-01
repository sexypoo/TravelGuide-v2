import { toPublicProfileResponse } from './profile.response';

describe('public profile response', () => {
  it('returns public contribution facts without private account fields', () => {
    const response = toPublicProfileResponse({
      id: 'local-id',
      nickname: '제주바람',
      bio: '제주의 오늘을 전합니다.',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      verifications: [
        {
          reviewedAt: new Date('2026-02-01T00:00:00.000Z'),
          destination: { id: 'jeju-id', slug: 'jeju', nameKo: '제주' },
        },
      ],
      stats: { answerCount: 12, acceptedAnswerCount: 4 },
    });

    expect(response).toEqual({
      id: 'local-id',
      nickname: '제주바람',
      bio: '제주의 오늘을 전합니다.',
      isVerifiedLocal: true,
      verifiedDestination: { id: 'jeju-id', slug: 'jeju', nameKo: '제주' },
      verifiedAt: '2026-02-01T00:00:00.000Z',
      joinedAt: '2026-01-01T00:00:00.000Z',
      stats: { answerCount: 12, acceptedAnswerCount: 4 },
    });
    expect(response).not.toHaveProperty('email');
    expect(response).not.toHaveProperty('verifications');
  });
});
