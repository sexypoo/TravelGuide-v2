import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisher } from '../realtime/realtime.publisher';
import { RoomAccessService } from '../rooms/room-access.service';
import { RoomsService } from '../rooms/rooms.service';
import type { CreateMessageDto } from './dto/create-message.dto';
import type { ListMessagesDto } from './dto/list-messages.dto';
import {
  toMessageResponse,
  type MessageListResponse,
  type MessageResponse,
} from './dto/message.response';
import {
  decodeMessageCursor,
  encodeMessageCursor,
  type MessageCursor,
} from './message-cursor';

const messageInclude = {
  author: { select: { id: true, nickname: true } },
  topic: { select: { id: true } },
} satisfies Prisma.ChatMessageInclude;

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rooms: RoomsService,
    private readonly roomAccess: RoomAccessService,
    private readonly publisher: RealtimePublisher,
  ) {}

  async list(
    roomSlug: string,
    user: AuthenticatedUser,
    query: ListMessagesDto,
  ): Promise<MessageListResponse> {
    const room = await this.rooms.getIdentity(roomSlug);
    await this.roomAccess.assertCanViewContent(user, room.destinationId);
    const cursor = this.parseCursor(query.cursor);
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        roomId: room.id,
        ...(cursor === null
          ? {}
          : {
              OR: [
                { createdAt: { lt: cursor.createdAt } },
                { createdAt: cursor.createdAt, id: { lt: cursor.id } },
              ],
            }),
      },
      include: messageInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
    });
    const hasMore = messages.length > query.limit;
    const descendingPage = hasMore ? messages.slice(0, query.limit) : messages;
    const oldest = descendingPage.at(-1);
    return {
      items: descendingPage.reverse().map(toMessageResponse),
      nextCursor:
        hasMore && oldest !== undefined
          ? encodeMessageCursor({
              createdAt: oldest.createdAt,
              id: oldest.id,
            })
          : null,
    };
  }

  async create(
    roomSlug: string,
    user: AuthenticatedUser,
    input: CreateMessageDto,
    now = new Date(),
  ): Promise<MessageResponse> {
    const room = await this.rooms.getIdentity(roomSlug);
    const capability = await this.roomAccess.assertCanParticipate(
      user,
      room.destinationId,
    );
    const message = await this.prisma.chatMessage.create({
      data: {
        roomId: room.id,
        authorId: user.id,
        authorKind: capability.kind,
        content: input.content,
        createdAt: now,
      },
      include: messageInclude,
    });
    const response = toMessageResponse(message);
    try {
      this.publisher.publishMessageCreated(room.id, roomSlug, response, now);
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : 'UnknownError';
      this.logger.warn(`Message event publication failed: ${name}`);
    }
    return response;
  }

  private parseCursor(value: string | undefined): MessageCursor | null {
    if (value === undefined) return null;
    const cursor = decodeMessageCursor(value);
    if (cursor === null) {
      throw new ProblemException(
        'INVALID_CURSOR',
        '메시지 목록 cursor가 올바르지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return cursor;
  }
}
