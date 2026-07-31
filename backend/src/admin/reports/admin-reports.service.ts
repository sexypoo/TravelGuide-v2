import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Prisma, ReportStatus, ReportTargetType } from '@prisma/client';
import { ProblemException } from '../../common/http/problem.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimePublisher } from '../../realtime/realtime.publisher';
import type { AdminReportQueryDto } from './dto/admin-report-query.dto';
import type { AdminReportResponse } from './dto/admin-report.response';
import {
  ReportReviewDecision,
  type ReviewReportDto,
} from './dto/review-report.dto';

const reportInclude = {
  reporter: { select: { id: true, nickname: true } },
  reviewedBy: { select: { id: true, nickname: true } },
} satisfies Prisma.ReportInclude;

type ReportRecord = Prisma.ReportGetPayload<{ include: typeof reportInclude }>;

interface RemovalEvent {
  roomId: string;
  roomSlug: string;
  targetType: 'QUESTION' | 'ANSWER';
  targetId: string;
  questionId: string;
}

@Injectable()
export class AdminReportsService {
  private readonly logger = new Logger(AdminReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly publisher: RealtimePublisher,
  ) {}

  async list(query: AdminReportQueryDto): Promise<AdminReportResponse[]> {
    const reports = await this.prisma.report.findMany({
      where: {
        ...(query.status === undefined ? {} : { status: query.status }),
        ...(query.targetType === undefined
          ? {}
          : { targetType: query.targetType }),
      },
      include: reportInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return Promise.all(reports.map((report) => this.toResponse(report)));
  }

  async get(id: string): Promise<AdminReportResponse> {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: reportInclude,
    });
    if (report === null) throw this.notFound();
    return this.toResponse(report);
  }

  async review(
    id: string,
    reviewerId: string,
    input: ReviewReportDto,
    now = new Date(),
  ): Promise<AdminReportResponse> {
    const note = input.note?.trim() || null;
    const removal = await this.prisma.$transaction(async (transaction) => {
      const lockKey = `review-report:${id}`;
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
      const report = await transaction.report.findUnique({ where: { id } });
      if (report === null) throw this.notFound();
      if (report.status !== ReportStatus.PENDING) {
        throw new ProblemException(
          'REPORT_ALREADY_REVIEWED',
          '이미 처리된 신고입니다.',
          HttpStatus.CONFLICT,
        );
      }
      if (
        input.decision === ReportReviewDecision.REMOVE &&
        report.targetType === ReportTargetType.USER
      ) {
        throw new ProblemException(
          'USER_REMOVAL_NOT_SUPPORTED',
          '사용자 차단은 현재 지원하지 않습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
      const removalEvent =
        input.decision === ReportReviewDecision.REMOVE
          ? await this.removeTarget(transaction, report, reviewerId, now)
          : null;
      if (input.decision !== ReportReviewDecision.REMOVE) {
        await this.assertTargetExists(transaction, report);
      }
      await transaction.report.update({
        where: { id },
        data: {
          status:
            input.decision === ReportReviewDecision.REMOVE
              ? ReportStatus.RESOLVED
              : input.decision === ReportReviewDecision.DISMISS
                ? ReportStatus.DISMISSED
                : ReportStatus.REVIEWED,
          reviewedById: reviewerId,
          reviewedAt: now,
          resolutionNote: note,
        },
      });
      return removalEvent;
    });
    if (removal !== null) {
      try {
        this.publisher.publishContentRemoved(
          removal.roomId,
          removal.roomSlug,
          {
            targetType: removal.targetType,
            targetId: removal.targetId,
            questionId: removal.questionId,
          },
          now,
        );
      } catch (error: unknown) {
        const name = error instanceof Error ? error.name : 'UnknownError';
        this.logger.warn(`Content removal event publication failed: ${name}`);
      }
    }
    return this.get(id);
  }

  private async removeTarget(
    transaction: Prisma.TransactionClient,
    report: { targetType: ReportTargetType; targetId: string },
    reviewerId: string,
    now: Date,
  ): Promise<RemovalEvent> {
    if (report.targetType === ReportTargetType.QUESTION) {
      const question = await transaction.question.findUnique({
        where: { id: report.targetId },
        select: { id: true, room: { select: { id: true, slug: true } } },
      });
      if (question === null) throw this.targetNotFound();
      await transaction.question.update({
        where: { id: question.id },
        data: {
          status: 'REMOVED',
          removedAt: now,
          removedById: reviewerId,
        },
      });
      return {
        roomId: question.room.id,
        roomSlug: question.room.slug,
        targetType: 'QUESTION',
        targetId: question.id,
        questionId: question.id,
      };
    }
    const answer = await transaction.answer.findUnique({
      where: { id: report.targetId },
      select: {
        id: true,
        questionId: true,
        question: { select: { room: { select: { id: true, slug: true } } } },
      },
    });
    if (answer === null) throw this.targetNotFound();
    await transaction.answer.update({
      where: { id: answer.id },
      data: { removedAt: now, removedById: reviewerId },
    });
    return {
      roomId: answer.question.room.id,
      roomSlug: answer.question.room.slug,
      targetType: 'ANSWER',
      targetId: answer.id,
      questionId: answer.questionId,
    };
  }

  private async assertTargetExists(
    transaction: Prisma.TransactionClient,
    report: { targetType: ReportTargetType; targetId: string },
  ): Promise<void> {
    const exists =
      report.targetType === ReportTargetType.QUESTION
        ? await transaction.question.findUnique({
            where: { id: report.targetId },
            select: { id: true },
          })
        : report.targetType === ReportTargetType.ANSWER
          ? await transaction.answer.findUnique({
              where: { id: report.targetId },
              select: { id: true },
            })
          : await transaction.user.findUnique({
              where: { id: report.targetId },
              select: { id: true },
            });
    if (exists === null) throw this.targetNotFound();
  }

  private async toResponse(report: ReportRecord): Promise<AdminReportResponse> {
    const target = await this.targetDetail(report.targetType, report.targetId);
    return {
      id: report.id,
      reporter: report.reporter,
      targetType: report.targetType,
      targetId: report.targetId,
      target,
      reason: report.reason,
      detail: report.detail,
      status: report.status,
      reviewedBy: report.reviewedBy,
      reviewedAt: report.reviewedAt?.toISOString() ?? null,
      resolutionNote: report.resolutionNote,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };
  }

  private async targetDetail(
    type: ReportTargetType,
    id: string,
  ): Promise<AdminReportResponse['target']> {
    if (type === ReportTargetType.QUESTION) {
      const item = await this.prisma.question.findUnique({
        where: { id },
        select: {
          content: true,
          removedAt: true,
          author: { select: { id: true, nickname: true } },
          room: { select: { slug: true } },
        },
      });
      if (item === null) throw this.targetNotFound();
      return {
        author: item.author,
        content: item.content,
        removed: item.removedAt !== null,
        roomSlug: item.room.slug,
        questionId: id,
      };
    }
    if (type === ReportTargetType.ANSWER) {
      const item = await this.prisma.answer.findUnique({
        where: { id },
        select: {
          content: true,
          removedAt: true,
          author: { select: { id: true, nickname: true } },
          questionId: true,
          question: { select: { room: { select: { slug: true } } } },
        },
      });
      if (item === null) throw this.targetNotFound();
      return {
        author: item.author,
        content: item.content,
        removed: item.removedAt !== null,
        roomSlug: item.question.room.slug,
        questionId: item.questionId,
      };
    }
    const item = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, nickname: true },
    });
    if (item === null) throw this.targetNotFound();
    return {
      author: item,
      content: null,
      removed: false,
      roomSlug: null,
      questionId: null,
    };
  }

  private notFound(): ProblemException {
    return new ProblemException(
      'REPORT_NOT_FOUND',
      '신고를 찾을 수 없습니다.',
      HttpStatus.NOT_FOUND,
    );
  }

  private targetNotFound(): ProblemException {
    return new ProblemException(
      'REPORT_TARGET_NOT_FOUND',
      '신고 대상을 찾을 수 없습니다.',
      HttpStatus.NOT_FOUND,
    );
  }
}
