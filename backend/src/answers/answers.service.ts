import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisher } from '../realtime/realtime.publisher';
import { RoomAccessService } from '../rooms/room-access.service';
import {
  type MessageImageFile,
  validateMessageImage,
} from '../messages/message-image-file';
import {
  STORAGE_SERVICE,
  type StorageService,
} from '../storage/storage.service';
import type { CreateAnswerDto } from './dto/create-answer.dto';
import { toAnswerResponse, type AnswerResponse } from './dto/answer.response';

const answerInclude = {
  author: { select: { id: true, nickname: true } },
} satisfies Prisma.AnswerInclude;

export function normalizeSourceUrl(input: CreateAnswerDto): string | null {
  const value = input.sourceUrl;
  if (
    input.sourceType === 'OFFICIAL_SOURCE' &&
    (value === undefined || value === null || value === '')
  ) {
    throw new ProblemException(
      'SOURCE_URL_REQUIRED',
      '공식 정보 출처에는 HTTPS URL이 필요합니다.',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (value === undefined || value === null || value === '') {
    return null;
  }
  try {
    const parsed = new URL(value);
    if (
      parsed.protocol !== 'https:' ||
      parsed.username.length > 0 ||
      parsed.password.length > 0
    ) {
      throw new Error('HTTPS is required');
    }
    return parsed.toString();
  } catch {
    throw new ProblemException(
      'INVALID_SOURCE_URL',
      '출처 URL은 유효한 HTTPS 주소여야 합니다.',
      HttpStatus.BAD_REQUEST,
    );
  }
}

@Injectable()
export class AnswersService {
  private readonly logger = new Logger(AnswersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly roomAccess: RoomAccessService,
    private readonly publisher: RealtimePublisher,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async create(
    questionId: string,
    user: AuthenticatedUser,
    input: CreateAnswerDto,
    now = new Date(),
    image?: MessageImageFile,
  ): Promise<AnswerResponse> {
    const initialQuestion = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        category: true,
        room: { select: { id: true, slug: true, destinationId: true } },
      },
    });
    if (initialQuestion === null) {
      throw this.questionNotFound();
    }
    const capability = await this.roomAccess.assertCanAnswer(
      user,
      initialQuestion.room.destinationId,
      now,
    );
    const normalizedSourceUrl = normalizeSourceUrl(input);
    const supportsObservation =
      initialQuestion.category === 'WAITING' ||
      initialQuestion.category === 'CROWD';
    const hasObservation =
      input.waitMinutes !== undefined ||
      input.crowdLevel !== undefined ||
      input.entryStatus !== undefined;
    if (supportsObservation && !hasObservation) {
      throw new ProblemException(
        'STATUS_OBSERVATION_REQUIRED',
        '대기·혼잡 토픽에는 현재 대기 또는 현장 상태를 하나 이상 알려주세요.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!supportsObservation && hasObservation) {
      throw new ProblemException(
        'STATUS_OBSERVATION_NOT_ALLOWED',
        '이 토픽 종류에는 현장 상태 항목을 추가할 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const observedAt = hasObservation
      ? input.observedAt === undefined
        ? now
        : new Date(input.observedAt)
      : null;
    if (observedAt !== null && observedAt > new Date(now.getTime() + 60_000)) {
      throw new ProblemException(
        'INVALID_OBSERVED_AT',
        '현장 확인 시각은 미래일 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    let imageObjectKey: string | null = null;
    if (image !== undefined) {
      validateMessageImage(image);
      imageObjectKey = `answer-media/${initialQuestion.room.id}/${randomUUID()}`;
      await this.storage.putPrivate({
        objectKey: imageObjectKey,
        contents: image.buffer,
      });
    }
    let answer;
    try {
      answer = await this.prisma.$transaction(async (transaction) => {
        const lockKey = `answer:${user.id}:${questionId}`;
        await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
        const question = await transaction.question.findUnique({
          where: { id: questionId },
          select: {
            authorId: true,
            status: true,
            expiresAt: true,
            removedAt: true,
          },
        });
        if (question === null) {
          throw this.questionNotFound();
        }
        if (question.authorId === user.id) {
          throw new ProblemException(
            'CANNOT_ANSWER_OWN_QUESTION',
            '자신이 작성한 질문에는 답변할 수 없습니다.',
            HttpStatus.FORBIDDEN,
          );
        }
        if (question.removedAt !== null || question.status !== 'OPEN') {
          throw new ProblemException(
            'QUESTION_NOT_OPEN',
            '열린 질문에만 답변할 수 있습니다.',
            HttpStatus.CONFLICT,
          );
        }
        if (question.expiresAt <= now) {
          throw new ProblemException(
            'QUESTION_EXPIRED',
            '만료된 질문에는 답변할 수 없습니다.',
            HttpStatus.CONFLICT,
          );
        }
        const answerCount = await transaction.answer.count({
          where: { questionId, authorId: user.id, removedAt: null },
        });
        if (answerCount >= 3) {
          throw new ProblemException(
            'ANSWER_LIMIT_REACHED',
            '한 질문에 작성할 수 있는 답변은 최대 3개입니다.',
            HttpStatus.CONFLICT,
          );
        }
        return transaction.answer.create({
          data: {
            questionId,
            authorId: user.id,
            authorKind: capability.kind,
            content: input.content,
            sourceType: input.sourceType,
            sourceUrl: normalizedSourceUrl,
            waitMinutes: input.waitMinutes,
            crowdLevel: input.crowdLevel,
            entryStatus: input.entryStatus,
            observedAt,
            imageObjectKey,
            imageOriginalName:
              image === undefined
                ? null
                : basename(image.originalname).slice(0, 255),
            imageMimeType: image?.mimetype,
            imageSizeBytes: image?.size,
            createdAt: now,
          },
          include: answerInclude,
        });
      });
    } catch (error: unknown) {
      if (imageObjectKey !== null) {
        await this.storage.delete(imageObjectKey).catch(() => undefined);
      }
      throw error;
    }
    const response = toAnswerResponse(answer, capability.verifiedAt);
    try {
      this.publisher.publishAnswerCreated(
        initialQuestion.room.id,
        initialQuestion.room.slug,
        response,
        now,
      );
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : 'UnknownError';
      this.logger.warn(`Answer event publication failed: ${name}`);
    }
    return response;
  }

  async getImage(
    answerId: string,
    user: AuthenticatedUser,
  ): Promise<{ path: string; mimeType: string; originalName: string }> {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        removedAt: true,
        imageObjectKey: true,
        imageMimeType: true,
        imageOriginalName: true,
        question: {
          select: { room: { select: { destinationId: true } } },
        },
      },
    });
    if (
      answer === null ||
      answer.removedAt !== null ||
      answer.imageObjectKey === null ||
      answer.imageMimeType === null ||
      answer.imageOriginalName === null
    ) {
      throw new ProblemException(
        'ANSWER_IMAGE_NOT_FOUND',
        '답변 이미지를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.roomAccess.assertCanViewContent(
      user,
      answer.question.room.destinationId,
    );
    return {
      path: await this.storage.getPrivateDownload(answer.imageObjectKey, 60),
      mimeType: answer.imageMimeType,
      originalName: answer.imageOriginalName,
    };
  }

  private questionNotFound(): ProblemException {
    return new ProblemException(
      'QUESTION_NOT_FOUND',
      '질문을 찾을 수 없습니다.',
      HttpStatus.NOT_FOUND,
    );
  }
}
