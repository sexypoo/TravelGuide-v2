import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import {
  type MessageImageFile,
  validateMessageImage,
} from '../messages/message-image-file';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisher } from '../realtime/realtime.publisher';
import { RoomAccessService } from '../rooms/room-access.service';
import { RoomsService } from '../rooms/rooms.service';
import { PrivateObjectLifecycleService } from '../storage/private-object-lifecycle.service';
import type { CreateQuestionDto } from './dto/create-question.dto';
import {
  toQuestionResponse,
  type QuestionDetailResponse,
  type QuestionResponse,
} from './dto/question.response';
import { questionNotFoundProblem } from './question-errors';
import { QuestionQueryService } from './question-query.service';
import { questionInclude, type QuestionRecord } from './question-record';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class QuestionCommandService {
  private readonly logger = new Logger(QuestionCommandService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rooms: RoomsService,
    private readonly roomAccess: RoomAccessService,
    private readonly publisher: RealtimePublisher,
    private readonly privateObjects: PrivateObjectLifecycleService,
    private readonly queries: QuestionQueryService,
  ) {}

  async create(
    roomSlug: string,
    user: AuthenticatedUser,
    input: CreateQuestionDto,
    now = new Date(),
    image?: MessageImageFile,
  ): Promise<QuestionResponse> {
    const room = await this.rooms.getIdentity(roomSlug);
    const capability = await this.roomAccess.assertCanParticipate(
      user,
      room.destinationId,
    );
    if (image !== undefined && typeof input.sourceMessageId === 'string') {
      throw new ProblemException(
        'TOPIC_IMAGE_NOT_ALLOWED_FOR_PROMOTION',
        '메시지를 토픽으로 잇는 경우에는 새 사진을 첨부할 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const imageUpload =
      image === undefined
        ? null
        : {
            objectKey: `question-media/${room.id}/${randomUUID()}`,
            contents: image.buffer,
          };
    if (image !== undefined) validateMessageImage(image);
    const imageObjectKey = imageUpload?.objectKey ?? null;
    const persistQuestion = (): Promise<QuestionRecord> =>
      this.prisma.$transaction(async (transaction) => {
        const lockKey = `${user.id}:${room.id}`;
        await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
        let content = input.content;
        const sourceMessageId =
          typeof input.sourceMessageId === 'string'
            ? input.sourceMessageId
            : undefined;
        if (sourceMessageId !== undefined) {
          const messageLockKey = `topic-message:${sourceMessageId}`;
          await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${messageLockKey}))`;
          const message = await transaction.chatMessage.findUnique({
            where: { id: sourceMessageId },
            select: {
              roomId: true,
              authorId: true,
              content: true,
              topic: { select: { id: true } },
            },
          });
          if (
            message === null ||
            message.roomId !== room.id ||
            message.authorId !== user.id
          ) {
            throw new ProblemException(
              'MESSAGE_NOT_AVAILABLE_FOR_PROMOTION',
              '본인이 이 방에 작성한 메시지만 토픽으로 만들 수 있습니다.',
              HttpStatus.NOT_FOUND,
            );
          }
          if (message.topic !== null) {
            throw new ProblemException(
              'MESSAGE_ALREADY_PROMOTED',
              '이미 토픽으로 만든 메시지입니다.',
              HttpStatus.CONFLICT,
            );
          }
          if (message.content.length < 20) {
            throw new ProblemException(
              'MESSAGE_TOO_SHORT_FOR_TOPIC',
              '토픽으로 만들 메시지는 20자 이상이어야 합니다.',
              HttpStatus.BAD_REQUEST,
            );
          }
          content = message.content;
        }
        if (typeof content !== 'string') {
          throw new ProblemException(
            'TOPIC_CONTENT_REQUIRED',
            '토픽 본문 또는 원본 메시지가 필요합니다.',
            HttpStatus.BAD_REQUEST,
          );
        }
        const activeCount = await transaction.question.count({
          where: {
            roomId: room.id,
            authorId: user.id,
            status: 'OPEN',
            expiresAt: { gt: now },
          },
        });
        if (activeCount >= 3) {
          throw new ProblemException(
            'OPEN_QUESTION_LIMIT_REACHED',
            '한 방에서 동시에 진행할 수 있는 질문은 최대 3개입니다.',
            HttpStatus.CONFLICT,
          );
        }

        return transaction.question.create({
          data: {
            roomId: room.id,
            authorId: user.id,
            authorKind: capability.kind,
            sourceMessageId,
            category: input.category,
            urgency: input.urgency,
            content,
            areaText:
              input.areaText === undefined || input.areaText === ''
                ? null
                : input.areaText,
            imageObjectKey,
            imageOriginalName:
              image === undefined
                ? null
                : basename(image.originalname).slice(0, 255),
            imageMimeType: image?.mimetype,
            imageSizeBytes: image?.size,
            expiresAt: new Date(now.getTime() + DAY_MS),
            createdAt: now,
          },
          include: questionInclude,
        });
      });
    const question =
      imageUpload === null
        ? await persistQuestion()
        : await this.privateObjects.storeThenPersist(
            imageUpload,
            persistQuestion,
          );
    const response = toQuestionResponse(question, now);
    try {
      this.publisher.publishQuestionCreated(room.id, roomSlug, response, now);
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : 'UnknownError';
      this.logger.warn(`Question event publication failed: ${name}`);
    }
    return response;
  }

  acceptAnswer(
    questionId: string,
    user: AuthenticatedUser,
    answerId: string,
    now = new Date(),
  ): Promise<QuestionDetailResponse> {
    return this.completeQuestion(questionId, user, answerId, now);
  }

  resolve(
    questionId: string,
    user: AuthenticatedUser,
    now = new Date(),
  ): Promise<QuestionDetailResponse> {
    return this.completeQuestion(questionId, user, null, now);
  }

  private async completeQuestion(
    questionId: string,
    user: AuthenticatedUser,
    answerId: string | null,
    now: Date,
  ): Promise<QuestionDetailResponse> {
    const identity = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: {
        room: { select: { id: true, slug: true, destinationId: true } },
      },
    });
    if (identity === null) throw questionNotFoundProblem();
    await this.roomAccess.assertCanViewContent(
      user,
      identity.room.destinationId,
    );

    const question = await this.prisma.$transaction(async (transaction) => {
      const lockKey = `resolve-question:${questionId}`;
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
      const current = await transaction.question.findUnique({
        where: { id: questionId },
        select: {
          authorId: true,
          status: true,
          expiresAt: true,
          removedAt: true,
        },
      });
      if (current === null) throw questionNotFoundProblem();
      if (current.authorId !== user.id) {
        throw new ProblemException(
          'NOT_QUESTION_OWNER',
          '토픽 작성자만 해결 상태를 결정할 수 있습니다.',
          HttpStatus.FORBIDDEN,
        );
      }
      if (current.removedAt !== null || current.status !== 'OPEN') {
        throw new ProblemException(
          'QUESTION_NOT_OPEN',
          '진행 중인 토픽만 해결할 수 있습니다.',
          HttpStatus.CONFLICT,
        );
      }
      if (current.expiresAt <= now) {
        throw new ProblemException(
          'QUESTION_EXPIRED',
          '만료된 토픽은 해결 상태를 변경할 수 없습니다.',
          HttpStatus.CONFLICT,
        );
      }
      if (answerId !== null) {
        const answer = await transaction.answer.findUnique({
          where: { id: answerId },
          select: { questionId: true, removedAt: true },
        });
        if (
          answer === null ||
          answer.questionId !== questionId ||
          answer.removedAt !== null
        ) {
          throw new ProblemException(
            'ANSWER_NOT_AVAILABLE',
            '이 토픽에서 채택할 수 있는 답변이 아닙니다.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      return transaction.question.update({
        where: { id: questionId },
        data: {
          acceptedAnswerId: answerId,
          status: 'RESOLVED',
          resolvedAt: now,
        },
        include: questionInclude,
      });
    });
    const response = toQuestionResponse(question, now);
    try {
      this.publisher.publishQuestionUpdated(
        identity.room.id,
        identity.room.slug,
        response,
        now,
      );
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : 'UnknownError';
      this.logger.warn(`Question update event publication failed: ${name}`);
    }
    return this.queries.get(questionId, user, now);
  }
}
