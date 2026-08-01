import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import { toAnswerResponse } from '../answers/dto/answer.response';
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
import {
  STORAGE_SERVICE,
  type StorageService,
} from '../storage/storage.service';
import type { CreateQuestionDto } from './dto/create-question.dto';
import type { ListQuestionsDto } from './dto/list-questions.dto';
import {
  toQuestionResponse,
  type LiveStatusSummary,
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
type QuestionRecord = Prisma.QuestionGetPayload<{
  include: typeof questionInclude;
}>;

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

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
    let imageObjectKey: string | null = null;
    if (image !== undefined) {
      validateMessageImage(image);
      imageObjectKey = `question-media/${room.id}/${randomUUID()}`;
      await this.storage.putPrivate({
        objectKey: imageObjectKey,
        contents: image.buffer,
      });
    }
    let question: QuestionRecord;
    try {
      question = await this.prisma.$transaction(async (transaction) => {
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
    } catch (error: unknown) {
      if (imageObjectKey !== null) {
        await this.storage.delete(imageObjectKey).catch(() => undefined);
      }
      throw error;
    }
    const response = toQuestionResponse(question, now);
    try {
      this.publisher.publishQuestionCreated(room.id, roomSlug, response, now);
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : 'UnknownError';
      this.logger.warn(`Question event publication failed: ${name}`);
    }
    return response;
  }

  async getImage(
    questionId: string,
    user: AuthenticatedUser,
  ): Promise<{ path: string; mimeType: string; originalName: string }> {
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
      path: await this.storage.getPrivateDownload(question.imageObjectKey, 60),
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

  async acceptAnswer(
    questionId: string,
    user: AuthenticatedUser,
    answerId: string,
    now = new Date(),
  ): Promise<QuestionDetailResponse> {
    return this.completeQuestion(questionId, user, answerId, now);
  }

  async resolve(
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
    if (identity === null) throw this.notFoundProblem();
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
      if (current === null) throw this.notFoundProblem();
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
    return this.get(questionId, user, now);
  }

  private notFoundProblem(): ProblemException {
    return new ProblemException(
      'QUESTION_NOT_FOUND',
      '질문을 찾을 수 없습니다.',
      HttpStatus.NOT_FOUND,
    );
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

function mode<T extends string>(values: T[]): T | null {
  if (values.length === 0) return null;
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return (
    [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ??
    null
  );
}

export function buildLiveSummary(
  category: string,
  answers: ReturnType<typeof toAnswerResponse>[],
  now = new Date(),
): LiveStatusSummary | null {
  if (category !== 'WAITING' && category !== 'CROWD') return null;
  const allObservations = answers
    .filter((answer) => !answer.removed && answer.observation !== null)
    .map((answer) => ({ authorId: answer.author.id, ...answer.observation! }))
    .sort(
      (left, right) =>
        new Date(right.observedAt).getTime() -
        new Date(left.observedAt).getTime(),
    );
  const seenAuthors = new Set<string>();
  const observations = allObservations.filter((observation) => {
    if (seenAuthors.has(observation.authorId)) return false;
    seenAuthors.add(observation.authorId);
    return true;
  });
  if (observations.length === 0) return null;
  const waits = observations
    .map((observation) => observation.waitMinutes)
    .filter((value): value is number => value !== null)
    .sort((left, right) => left - right);
  const median =
    waits.length === 0
      ? null
      : (waits[Math.floor((waits.length - 1) / 2)] ?? null);
  const waitRange =
    median === null
      ? null
      : {
          min: Math.max(0, Math.floor(median / 10) * 10),
          max: Math.max(10, Math.ceil(median / 10) * 10),
        };
  if (waitRange !== null && waitRange.min === waitRange.max) {
    waitRange.max += 10;
  }
  const agreementCount =
    median === null
      ? observations.length
      : waits.filter((value) => Math.abs(value - median) <= 10).length;
  const lastObserved = new Date(
    Math.max(
      ...observations.map((observation) =>
        new Date(observation.observedAt).getTime(),
      ),
    ),
  );
  const description =
    waitRange === null
      ? `현장 답변 ${observations.length}건을 기준으로 현재 상태를 정리했습니다.`
      : `현장 답변 기준 현재 대기는 약 ${waitRange.min}~${waitRange.max}분 수준입니다.`;
  return {
    freshness:
      now.getTime() - lastObserved.getTime() > 30 * 60 * 1000
        ? 'STALE'
        : 'LIVE',
    responseCount: observations.length,
    agreementCount,
    waitMinutes: waitRange,
    crowdLevel: mode(
      observations
        .map((observation) => observation.crowdLevel)
        .filter((value): value is NonNullable<typeof value> => value !== null),
    ),
    entryStatus: mode(
      observations
        .map((observation) => observation.entryStatus)
        .filter((value): value is NonNullable<typeof value> => value !== null),
    ),
    lastObservedAt: lastObserved.toISOString(),
    recommendedRecheckAt: new Date(
      lastObserved.getTime() + 10 * 60 * 1000,
    ).toISOString(),
    staleAfter: new Date(lastObserved.getTime() + 30 * 60 * 1000).toISOString(),
    description,
  };
}
