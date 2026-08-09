import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisher } from '../realtime/realtime.publisher';
import { RoomAccessService } from '../rooms/room-access.service';
import { RoomsService } from '../rooms/rooms.service';
import {
  STORAGE_SERVICE,
  type StorageService,
} from '../storage/storage.service';
import type { CreateImageMessageDto } from './dto/create-image-message.dto';
import type { CreateMessageDto } from './dto/create-message.dto';
import type { CreatePlaceMessageDto } from './dto/create-place-message.dto';
import type { CreateTopicShareMessageDto } from './dto/create-topic-share-message.dto';
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
import {
  type MessageImageFile,
  validateMessageImage,
} from './message-image-file';

const messageInclude = {
  author: { select: { id: true, nickname: true } },
  topic: { select: { id: true } },
  sharedQuestion: {
    select: {
      id: true,
      category: true,
      urgency: true,
      content: true,
      areaText: true,
      status: true,
      expiresAt: true,
      removedAt: true,
      author: { select: { nickname: true } },
      _count: { select: { answers: { where: { removedAt: null } } } },
    },
  },
} satisfies Prisma.ChatMessageInclude;

type MessageRecord = Prisma.ChatMessageGetPayload<{
  include: typeof messageInclude;
}>;

export interface MessageImageDownload {
  stream: NodeJS.ReadableStream;
  mimeType: string;
  originalName: string;
}

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rooms: RoomsService,
    private readonly roomAccess: RoomAccessService,
    private readonly publisher: RealtimePublisher,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
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
      items: descendingPage
        .reverse()
        .map((message) => toMessageResponse(message)),
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
    return this.createRecord(
      roomSlug,
      user,
      { type: 'TEXT', content: input.content },
      now,
    );
  }

  async createPlace(
    roomSlug: string,
    user: AuthenticatedUser,
    input: CreatePlaceMessageDto,
    now = new Date(),
  ): Promise<MessageResponse> {
    return this.createRecord(
      roomSlug,
      user,
      {
        type: 'PLACE',
        content:
          input.note?.trim() || `${input.placeName} 장소를 공유했습니다.`,
        placeName: input.placeName,
        placeAddress: input.address?.trim() || null,
        placeLatitude: input.latitude,
        placeLongitude: input.longitude,
        placeGoogleId: input.googlePlaceId?.trim() || null,
      },
      now,
    );
  }

  async createTopicShare(
    roomSlug: string,
    user: AuthenticatedUser,
    input: CreateTopicShareMessageDto,
    now = new Date(),
  ): Promise<MessageResponse> {
    const room = await this.rooms.getIdentity(roomSlug);
    const capability = await this.roomAccess.assertCanParticipate(
      user,
      room.destinationId,
    );
    const question = await this.prisma.question.findUnique({
      where: { id: input.questionId },
      select: { id: true, roomId: true, content: true, removedAt: true },
    });
    if (
      question === null ||
      question.roomId !== room.id ||
      question.removedAt !== null
    ) {
      throw new ProblemException(
        'TOPIC_NOT_AVAILABLE_FOR_SHARE',
        '이 방에서 공유할 수 있는 토픽이 아닙니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    const message = await this.prisma.chatMessage.create({
      data: {
        roomId: room.id,
        authorId: user.id,
        authorKind: capability.kind,
        type: 'TOPIC_SHARE',
        content: question.content.slice(0, 500),
        sharedQuestionId: question.id,
        createdAt: now,
      },
      include: messageInclude,
    });
    return this.publish(room.id, roomSlug, message, now);
  }

  async createImage(
    roomSlug: string,
    user: AuthenticatedUser,
    input: CreateImageMessageDto,
    file: MessageImageFile | undefined,
    now = new Date(),
  ): Promise<MessageResponse> {
    const room = await this.rooms.getIdentity(roomSlug);
    const capability = await this.roomAccess.assertCanParticipate(
      user,
      room.destinationId,
    );
    validateMessageImage(file);
    const objectKey = `room-media/${room.id}/${randomUUID()}`;
    await this.storage.putPrivate({ objectKey, contents: file.buffer });
    try {
      const message = await this.prisma.chatMessage.create({
        data: {
          roomId: room.id,
          authorId: user.id,
          authorKind: capability.kind,
          type: 'IMAGE',
          content: input.caption?.trim() || '사진을 공유했습니다.',
          imageObjectKey: objectKey,
          imageOriginalName: basename(file.originalname).slice(0, 255),
          imageMimeType: file.mimetype,
          imageSizeBytes: file.size,
          createdAt: now,
        },
        include: messageInclude,
      });
      return this.publish(room.id, roomSlug, message, now);
    } catch (error: unknown) {
      try {
        await this.storage.delete(objectKey);
      } catch {
        this.logger.warn('Failed to clean an orphaned room image');
      }
      throw error;
    }
  }

  async getImage(
    messageId: string,
    user: AuthenticatedUser,
  ): Promise<MessageImageDownload> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: {
        type: true,
        removedAt: true,
        imageObjectKey: true,
        imageOriginalName: true,
        imageMimeType: true,
        room: { select: { destinationId: true } },
      },
    });
    if (
      message === null ||
      message.type !== 'IMAGE' ||
      message.removedAt !== null ||
      message.imageObjectKey === null ||
      message.imageOriginalName === null ||
      message.imageMimeType === null
    ) {
      throw new ProblemException(
        'MESSAGE_IMAGE_NOT_FOUND',
        '채팅 이미지를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.roomAccess.assertCanViewContent(
      user,
      message.room.destinationId,
    );
    return {
      stream: await this.storage.getPrivateDownload(message.imageObjectKey, 60),
      mimeType: message.imageMimeType,
      originalName: message.imageOriginalName,
    };
  }

  private async createRecord(
    roomSlug: string,
    user: AuthenticatedUser,
    data: Omit<
      Prisma.ChatMessageUncheckedCreateInput,
      'roomId' | 'authorId' | 'authorKind'
    >,
    now: Date,
  ): Promise<MessageResponse> {
    const room = await this.rooms.getIdentity(roomSlug);
    const capability = await this.roomAccess.assertCanParticipate(
      user,
      room.destinationId,
    );
    const message = await this.prisma.chatMessage.create({
      data: {
        ...data,
        roomId: room.id,
        authorId: user.id,
        authorKind: capability.kind,
        createdAt: now,
      },
      include: messageInclude,
    });
    return this.publish(room.id, roomSlug, message, now);
  }

  private publish(
    roomId: string,
    roomSlug: string,
    message: MessageRecord,
    now: Date,
  ): MessageResponse {
    const response = toMessageResponse(message, now);
    try {
      this.publisher.publishMessageCreated(roomId, roomSlug, response, now);
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
