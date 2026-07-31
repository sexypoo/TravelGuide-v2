import { HttpStatus, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import {
  toRoomResponse,
  type RoomResponse,
  type RoomWithDestination,
} from './dto/room.response';
import { RoomAccessService } from './room-access.service';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomAccess: RoomAccessService,
  ) {}

  async list(user: AuthenticatedUser): Promise<RoomResponse[]> {
    const rooms = await this.prisma.destinationRoom.findMany({
      include: { destination: true },
      orderBy: { destination: { nameKo: 'asc' } },
    });
    return Promise.all(
      rooms.map(async (room) =>
        toRoomResponse(
          room,
          await this.roomAccess.getAccess(user, room.destinationId),
        ),
      ),
    );
  }

  async get(slug: string, user: AuthenticatedUser): Promise<RoomResponse> {
    const room = await this.findBySlug(slug);
    return toRoomResponse(
      room,
      await this.roomAccess.getAccess(user, room.destinationId),
    );
  }

  async assertContentAccess(
    slug: string,
    user: AuthenticatedUser,
  ): Promise<void> {
    const room = await this.findBySlug(slug);
    await this.roomAccess.assertCanViewContent(user, room.destinationId);
  }

  async getIdentity(slug: string): Promise<{
    id: string;
    destinationId: string;
  }> {
    const room = await this.findBySlug(slug);
    return { id: room.id, destinationId: room.destinationId };
  }

  private async findBySlug(slug: string): Promise<RoomWithDestination> {
    const room = await this.prisma.destinationRoom.findUnique({
      where: { slug },
      include: { destination: true },
    });

    if (room === null) {
      throw new ProblemException(
        'ROOM_NOT_FOUND',
        '방을 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    return room;
  }
}
