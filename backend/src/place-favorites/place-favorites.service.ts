import { HttpStatus, Injectable } from '@nestjs/common';
import type { PlaceFavorite } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import { RoomAccessService } from '../rooms/room-access.service';
import type {
  PlaceFavoriteListResponse,
  PlaceFavoriteResponse,
  RemovePlaceFavoriteResponse,
} from './dto/place-favorite.response';

@Injectable()
export class PlaceFavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomAccess: RoomAccessService,
  ) {}

  async list(user: AuthenticatedUser): Promise<PlaceFavoriteListResponse> {
    const items = await this.prisma.placeFavorite.findMany({
      where: { userId: user.id },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 100,
    });
    return { items: items.map(toResponse) };
  }

  async save(
    user: AuthenticatedUser,
    messageId: string,
  ): Promise<PlaceFavoriteResponse> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        type: true,
        removedAt: true,
        placeName: true,
        placeAddress: true,
        placeLatitude: true,
        placeLongitude: true,
        placeGoogleId: true,
        room: { select: { destinationId: true } },
      },
    });
    if (
      message === null ||
      message.type !== 'PLACE' ||
      message.removedAt !== null ||
      message.placeName === null ||
      message.placeLatitude === null ||
      message.placeLongitude === null
    ) {
      throw this.notFound();
    }
    await this.roomAccess.assertCanViewContent(
      user,
      message.room.destinationId,
    );
    const favorite = await this.prisma.placeFavorite.upsert({
      where: {
        userId_sourceMessageId: {
          userId: user.id,
          sourceMessageId: message.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        sourceMessageId: message.id,
        name: message.placeName,
        address: message.placeAddress,
        latitude: message.placeLatitude,
        longitude: message.placeLongitude,
        provider: message.placeGoogleId === null ? null : 'GOOGLE',
        providerPlaceId: message.placeGoogleId,
      },
    });
    return toResponse(favorite);
  }

  async remove(
    user: AuthenticatedUser,
    favoriteId: string,
  ): Promise<RemovePlaceFavoriteResponse> {
    const result = await this.prisma.placeFavorite.deleteMany({
      where: { id: favoriteId, userId: user.id },
    });
    if (result.count === 0) throw this.notFound();
    return { saved: false };
  }

  private notFound(): ProblemException {
    return new ProblemException(
      'PLACE_FAVORITE_NOT_FOUND',
      '저장할 수 있는 장소를 찾지 못했어요.',
      HttpStatus.NOT_FOUND,
    );
  }
}

function toResponse(favorite: PlaceFavorite): PlaceFavoriteResponse {
  return {
    id: favorite.id,
    sourceMessageId: favorite.sourceMessageId,
    name: favorite.name,
    address: favorite.address,
    latitude: Number(favorite.latitude),
    longitude: Number(favorite.longitude),
    createdAt: favorite.createdAt.toISOString(),
  };
}
