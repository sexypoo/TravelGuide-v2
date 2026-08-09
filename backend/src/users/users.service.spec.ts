import { UsersService } from './users.service';

describe('UsersService public profile', () => {
  it('counts only visible answers and accepted answers on visible topics', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'local-id',
          nickname: '제주바람',
          bio: '제주의 오늘을 전합니다.',
          avatarObjectKey: null,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          verifications: [],
        }),
      },
      answer: {
        count: jest.fn().mockResolvedValueOnce(12).mockResolvedValueOnce(4),
      },
    };
    const service = new UsersService(prisma as never);

    await expect(service.getPublicProfile('local-id')).resolves.toMatchObject({
      stats: { answerCount: 12, acceptedAnswerCount: 4 },
    });
    expect(prisma.answer.count).toHaveBeenNthCalledWith(1, {
      where: { authorId: 'local-id', removedAt: null },
    });
    expect(prisma.answer.count).toHaveBeenNthCalledWith(2, {
      where: {
        authorId: 'local-id',
        removedAt: null,
        acceptedForQuestion: { is: { removedAt: null } },
      },
    });
  });

  it('filters unknown stored travel styles from the own profile contract', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'traveler-id',
          email: 'traveler@example.com',
          nickname: '느린여행자',
          bio: null,
          travelStyles: ['SLOW_TRAVEL', 'LEGACY_UNKNOWN'],
          avatarObjectKey: null,
          role: 'USER',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      },
    };
    const service = new UsersService(prisma as never);

    await expect(service.getOwnProfile('traveler-id')).resolves.toMatchObject({
      travelStyles: ['SLOW_TRAVEL'],
    });
  });
});
