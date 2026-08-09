import { ProblemException } from '../common/http/problem.exception';
import { PlaceFavoritesService } from './place-favorites.service';

const user = {
  id: 'user-1',
  email: 'traveler@example.com',
  nickname: '여행자',
  role: 'USER' as const,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
};
const favorite = {
  id: 'favorite-1',
  userId: user.id,
  sourceMessageId: 'message-1',
  name: '동백식당',
  address: '제주시 바다로 1',
  latitude: 33.5,
  longitude: 126.5,
  createdAt: new Date('2026-08-08T00:00:00.000Z'),
};

describe('PlaceFavoritesService', () => {
  it('copies an accessible place message into an idempotent favorite', async () => {
    const prisma = {
      chatMessage: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'message-1',
          type: 'PLACE',
          removedAt: null,
          placeName: favorite.name,
          placeAddress: favorite.address,
          placeLatitude: favorite.latitude,
          placeLongitude: favorite.longitude,
          room: { destinationId: 'destination-1' },
        }),
      },
      placeFavorite: { upsert: jest.fn().mockResolvedValue(favorite) },
    };
    const access = { assertCanViewContent: jest.fn().mockResolvedValue({}) };
    const service = new PlaceFavoritesService(prisma as never, access as never);

    await expect(service.save(user, 'message-1')).resolves.toMatchObject({
      id: favorite.id,
      sourceMessageId: 'message-1',
      name: favorite.name,
      latitude: 33.5,
    });
    expect(access.assertCanViewContent).toHaveBeenCalledWith(
      user,
      'destination-1',
    );
    expect(prisma.placeFavorite.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_sourceMessageId: {
            userId: user.id,
            sourceMessageId: 'message-1',
          },
        },
      }),
    );
  });

  it('rejects removed and non-place messages before checking access', async () => {
    const prisma = {
      chatMessage: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'message-1',
          type: 'PLACE',
          removedAt: new Date(),
          placeName: favorite.name,
          placeAddress: null,
          placeLatitude: favorite.latitude,
          placeLongitude: favorite.longitude,
          room: { destinationId: 'destination-1' },
        }),
      },
    };
    const access = { assertCanViewContent: jest.fn() };
    const service = new PlaceFavoritesService(prisma as never, access as never);

    await expect(service.save(user, 'message-1')).rejects.toBeInstanceOf(
      ProblemException,
    );
    expect(access.assertCanViewContent).not.toHaveBeenCalled();
  });

  it('lists only the current user and prevents removing another user favorite', async () => {
    const prisma = {
      placeFavorite: {
        findMany: jest.fn().mockResolvedValue([favorite]),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const service = new PlaceFavoritesService(prisma as never, {} as never);

    await expect(service.list(user)).resolves.toMatchObject({
      items: [{ id: favorite.id, name: favorite.name }],
    });
    expect(prisma.placeFavorite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: user.id } }),
    );
    await expect(service.remove(user, 'other-favorite')).rejects.toBeInstanceOf(
      ProblemException,
    );
    expect(prisma.placeFavorite.deleteMany).toHaveBeenCalledWith({
      where: { id: 'other-favorite', userId: user.id },
    });
  });
});
