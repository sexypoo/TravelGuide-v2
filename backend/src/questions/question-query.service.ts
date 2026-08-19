import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { toAnswerResponse } from '../answers/dto/answer.response';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import { RoomAccessService } from '../rooms/room-access.service';
import { RoomsService } from '../rooms/rooms.service';
import {
  STORAGE_SERVICE,
  type StorageService,
} from '../storage/storage.service';
import type { ListQuestionsDto } from './dto/list-questions.dto';
import {
  toQuestionResponse,
  type QuestionDetailResponse,
  type QuestionListResponse,
} from './dto/question.response';
import {
  decodeQuestionCursor,
  encodeQuestionCursor,
  type QuestionCursor,
} from './question-cursor';
import { questionNotFoundProblem } from './question-errors';
import { buildLiveSummary } from './question-live-summary';
import { questionInclude } from './question-record';

@Injectable()
export class QuestionQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rooms: RoomsService,
    private readonly roomAccess: RoomAccessService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
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
        ...(query.category === undefined ? {} : { category: query.category }),
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

  async getImage(
    questionId: string,
    user: AuthenticatedUser,
  ): Promise<{
    stream: NodeJS.ReadableStream;
    mimeType: string;
    originalName: string;
  }> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: {
        status: true,
        removedAt: true,
        imageObjectKey: true,
        imageMimeType: true,
        imageOriginalName: true,
        room: { select: { destinationId: true } },
      },
    });
    if (
      question === null ||
      question.status === 'REMOVED' ||
      question.removedAt !== null ||
      question.imageObjectKey === null ||
      question.imageMimeType === null ||
      question.imageOriginalName === null
    ) {
      throw new ProblemException(
        'QUESTION_IMAGE_NOT_FOUND',
        '토픽 이미지를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.roomAccess.assertCanViewContent(
      user,
      question.room.destinationId,
    );
    return {
      stream: await this.storage.getPrivateDownload(
        question.imageObjectKey,
        60,
      ),
      mimeType: question.imageMimeType,
      originalName: question.imageOriginalName,
    };
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
    if (question === null) throw questionNotFoundProblem();
    await this.roomAccess.assertCanViewContent(
      user,
      question.room.destinationId,
    );
    const answers = await this.prisma.answer.findMany({
      where: { questionId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            verifications: {
              where: {
                destinationId: question.room.destinationId,
                status: 'APPROVED',
                reviewedAt: { not: null },
              },
              orderBy: { reviewedAt: 'desc' },
              select: { type: true, reviewedAt: true },
            },
          },
        },
      },
    });
    const answerResponses = answers.map((answer) => {
      const verifiedAt = answer.author.verifications.find(
        (verification) =>
          answer.authorKind === 'BOTH' ||
          verification.type === answer.authorKind,
      )?.reviewedAt;
      if (verifiedAt === undefined || verifiedAt === null) {
        throw new Error('Answer author participant verification is missing');
      }
      return toAnswerResponse(answer, verifiedAt);
    });
    return {
      ...toQuestionResponse(question, now),
      answerCount: answerResponses.length,
      answers: answerResponses,
      liveSummary: buildLiveSummary(question.category, answerResponses, now),
    };
  }

  private parseCursor(value: string | undefined): QuestionCursor | null {
    if (value === undefined) return null;
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
