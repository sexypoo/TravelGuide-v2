import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, ReportReason, ReportTargetType } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateReportDto } from './dto/create-report.dto';
import { toReportResponse, type ReportResponse } from './dto/report.response';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user: AuthenticatedUser,
    input: CreateReportDto,
  ): Promise<ReportResponse> {
    const detail = input.detail?.trim() || null;
    if (
      input.reason === ReportReason.OTHER &&
      (detail === null || detail.length < 10)
    ) {
      throw new ProblemException(
        'REPORT_DETAIL_REQUIRED',
        '기타 신고 사유는 10자 이상 입력해 주세요.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const authorId = await this.targetAuthor(input.targetType, input.targetId);
    if (authorId === user.id) {
      throw new ProblemException(
        'CANNOT_REPORT_OWN_CONTENT',
        '자신의 콘텐츠나 계정은 신고할 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const report = await this.prisma.report.create({
        data: {
          reporterId: user.id,
          targetType: input.targetType,
          targetId: input.targetId,
          reason: input.reason,
          detail,
        },
      });
      return toReportResponse(report);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ProblemException(
          'REPORT_ALREADY_EXISTS',
          '이미 신고한 대상입니다.',
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }
  }

  private async targetAuthor(
    targetType: ReportTargetType,
    targetId: string,
  ): Promise<string> {
    if (targetType === ReportTargetType.MESSAGE) {
      const target = await this.prisma.chatMessage.findUnique({
        where: { id: targetId },
        select: { authorId: true, removedAt: true },
      });
      if (target === null || target.removedAt !== null) throw this.notFound();
      return target.authorId;
    }
    if (targetType === ReportTargetType.QUESTION) {
      const target = await this.prisma.question.findUnique({
        where: { id: targetId },
        select: { authorId: true, removedAt: true },
      });
      if (target === null || target.removedAt !== null) throw this.notFound();
      return target.authorId;
    }
    if (targetType === ReportTargetType.ANSWER) {
      const target = await this.prisma.answer.findUnique({
        where: { id: targetId },
        select: { authorId: true, removedAt: true },
      });
      if (target === null || target.removedAt !== null) throw this.notFound();
      return target.authorId;
    }
    if (targetType === ReportTargetType.COMMUNITY_POST) {
      const target = await this.prisma.communityPost.findUnique({
        where: { id: targetId },
        select: { authorId: true, removedAt: true },
      });
      if (target === null || target.removedAt !== null) throw this.notFound();
      return target.authorId;
    }
    if (targetType === ReportTargetType.COMMUNITY_COMMENT) {
      const target = await this.prisma.communityComment.findUnique({
        where: { id: targetId },
        select: { authorId: true, removedAt: true },
      });
      if (target === null || target.removedAt !== null) throw this.notFound();
      return target.authorId;
    }
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true },
    });
    if (target === null) throw this.notFound();
    return target.id;
  }

  private notFound(): ProblemException {
    return new ProblemException(
      'REPORT_TARGET_NOT_FOUND',
      '신고 대상을 찾을 수 없습니다.',
      HttpStatus.NOT_FOUND,
    );
  }
}
