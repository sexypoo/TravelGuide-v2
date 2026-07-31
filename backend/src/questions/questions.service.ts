import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toAnswerResponse } from '../answers/dto/answer.response';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisher } from '../realtime/realtime.publisher';
import { RoomAccessService } from '../rooms/room-access.service';
import { RoomsService } from '../rooms/rooms.service';
import type { CreateQuestionDto } from './dto/create-question.dto';
import type { ListQuestionsDto } from './dto/list-questions.dto';
import {
  toQuestionResponse,
  type QuestionListResponse,
  type QuestionDetailResponse,
  type QuestionResponse,
} from './dto/question.response';
import {
  decodeQuestionCursor,
  encodeQuestionCursor,
  type QuestionCursor,
} from './question-cursor';

const DAY_MS = 24 * 60 * 60 * 1000;
const questionInclude = {
  author: { select: { id: true, nickname: true } },
  _count: { select: { answers: { where: { removedAt: null } } } },
} satisfies Prisma.QuestionInclude;

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rooms: RoomsService,
    private readonly roomAccess: RoomAccessService,
    private readonly publisher: RealtimePublisher,
  ) {}

  async list(
    roomSlug: string,
    user: AuthenticatedUser,
    query: ListQuestionsDto,
    now = new Date(),
  ): Promise<QuestionListResponse> {
    const room = await this.rooms.getIdentity(roomSlug);
    await this.roomAccess.assertCanViewContent(user, room.destinationId);
    const cursor = this.parseCursor(query.cursor);
    const items = await this.prisma.question.findMany({
      where: {
        roomId: room.id,
        status: query.status,
        ...(cursor === null
          ? {}
          : {
              OR: [
                { createdAt: { lt: cursor.createdAt } },
                { createdAt: cursor.createdAt, id: { lt: cursor.id } },
              ],
            }),
      },
      include: questionInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
    });
    const hasMore = items.length > query.limit;
    const page = hasMore ? items.slice(0, query.limit) : items;
    const last = page.at(-1);
    return {
      items: page.map((item) => toQuestionResponse(item, now)),
      nextCursor:
        hasMore && last !== undefined
          ? encodeQuestionCursor({ createdAt: last.createdAt, id: last.id })
          : null,
    };
  }

  async create(
    roomSlug: string,
    user: AuthenticatedUser,
    input: CreateQuestionDto,
    now = new Date(),
  ): Promise<QuestionResponse> {
    const room = await this.rooms.getIdentity(roomSlug);
    await this.roomAccess.assertCanAskQuestion(user, room.destinationId);
    const question = await this.prisma.$transaction(async (transaction) => {
      const lockKey = `${user.id}:${room.id}`;
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
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
          category: input.category,
          urgency: input.urgency,
          content: input.content,
          areaText:
            input.areaText === undefined || input.areaText === ''
              ? null
              : input.areaText,
          expiresAt: new Date(now.getTime() + DAY_MS),
          createdAt: now,
        },
        include: questionInclude,
      });
    });
    const response = toQuestionResponse(question, now);
    try {
      this.publisher.publishQuestionCreated(room.id, roomSlug, response, now);
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : 'UnknownError';
      this.logger.warn(`Question event publication failed: ${name}`);
    }
    return response;
  }

  async get(
    questionId: string,
    user: AuthenticatedUser,
    now = new Date(),
  ): Promise<QuestionDetailResponse> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        ...questionInclude,
        room: { select: { destinationId: true } },
      },
    });
    if (question === null) {
      throw new ProblemException(
        'QUESTION_NOT_FOUND',
        '질문을 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.roomAccess.assertCanViewContent(
      user,
      question.room.destinationId,
    );
    const answers = await this.prisma.answer.findMany({
      where: { questionId, removedAt: null },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            verifications: {
              where: {
                destinationId: question.room.destinationId,
                type: 'LOCAL',
                status: 'APPROVED',
                reviewedAt: { not: null },
              },
              orderBy: { reviewedAt: 'desc' },
              take: 1,
              select: { reviewedAt: true },
            },
          },
        },
      },
    });
    const answerResponses = answers.map((answer) => {
      const verifiedAt = answer.author.verifications[0]?.reviewedAt;
      if (verifiedAt === undefined || verifiedAt === null) {
        throw new Error('Answer author local verification is missing');
      }
      return toAnswerResponse(answer, verifiedAt);
    });
    return {
      ...toQuestionResponse(question, now),
      answerCount: answerResponses.length,
      answers: answerResponses,
    };
  }

  private parseCursor(value: string | undefined): QuestionCursor | null {
    if (value === undefined) {
      return null;
    }
    const cursor = decodeQuestionCursor(value);
    if (cursor === null) {
      throw new ProblemException(
        'INVALID_CURSOR',
        '질문 목록 cursor가 올바르지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return cursor;
  }
}
