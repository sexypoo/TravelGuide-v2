import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Prisma, VerificationStatus, VerificationType } from '@prisma/client';
import { ProblemException } from '../../common/http/problem.exception';
import { PrismaService } from '../../prisma/prisma.service';
import {
  STORAGE_SERVICE,
  type StorageService,
} from '../../storage/storage.service';
import {
  toAdminVerificationResponse,
  type AdminVerificationResponse,
} from './dto/admin-verification.response';
import type { AdminVerificationQueryDto } from './dto/admin-verification-query.dto';
import {
  ReviewDecision,
  type ReviewVerificationDto,
} from './dto/review-verification.dto';

const adminInclude = {
  user: { select: { id: true, nickname: true } },
  destination: { select: { id: true, slug: true, nameKo: true } },
} satisfies Prisma.VerificationInclude;

export interface EvidenceDownload {
  stream: NodeJS.ReadableStream;
  originalName: string;
  mimeType: string;
}

@Injectable()
export class AdminVerificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async list(
    query: AdminVerificationQueryDto,
  ): Promise<AdminVerificationResponse[]> {
    const items = await this.prisma.verification.findMany({
      where: {
        ...(query.status === undefined ? {} : { status: query.status }),
        ...(query.type === undefined ? {} : { type: query.type }),
        ...(query.destinationId === undefined
          ? {}
          : { destinationId: query.destinationId }),
      },
      include: adminInclude,
      orderBy: { createdAt: 'desc' },
    });
    return items.map(toAdminVerificationResponse);
  }

  async get(id: string): Promise<AdminVerificationResponse> {
    const item = await this.findRecord(id);
    return toAdminVerificationResponse(item);
  }

  async getEvidence(id: string): Promise<EvidenceDownload> {
    const item = await this.prisma.verification.findUnique({
      where: { id },
      select: {
        proofObjectKey: true,
        proofOriginalName: true,
        proofMimeType: true,
      },
    });
    if (item === null) {
      throw this.notFoundProblem();
    }
    return {
      stream: await this.storage.getPrivateDownload(item.proofObjectKey, 60),
      originalName: item.proofOriginalName,
      mimeType: item.proofMimeType,
    };
  }

  async review(
    id: string,
    reviewerId: string,
    input: ReviewVerificationDto,
  ): Promise<AdminVerificationResponse> {
    const reason = input.reason ?? null;
    if (
      input.decision === ReviewDecision.REJECT &&
      (reason === null || reason.length < 10)
    ) {
      throw new ProblemException(
        'REJECTION_REASON_REQUIRED',
        '반려 사유를 10자 이상 입력해 주세요.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = new Date();
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.verification.findUnique({
        where: { id },
        select: { id: true, type: true },
      });
      if (existing === null) {
        throw this.notFoundProblem();
      }

      const approved = input.decision === ReviewDecision.APPROVE;
      const result = await transaction.verification.updateMany({
        where: { id, status: VerificationStatus.PENDING },
        data: {
          status: approved
            ? VerificationStatus.APPROVED
            : VerificationStatus.REJECTED,
          reviewedById: reviewerId,
          reviewedAt: now,
          rejectionReason: approved ? null : reason,
          expiresAt:
            approved && existing.type === VerificationType.LOCAL
              ? new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
              : null,
        },
      });
      if (result.count === 0) {
        throw new ProblemException(
          'VERIFICATION_ALREADY_REVIEWED',
          '이미 처리된 인증 신청입니다.',
          HttpStatus.CONFLICT,
        );
      }

      const updated = await transaction.verification.findUniqueOrThrow({
        where: { id },
        include: adminInclude,
      });
      return toAdminVerificationResponse(updated);
    });
  }

  private async findRecord(
    id: string,
  ): Promise<Prisma.VerificationGetPayload<{ include: typeof adminInclude }>> {
    const item = await this.prisma.verification.findUnique({
      where: { id },
      include: adminInclude,
    });
    if (item === null) {
      throw this.notFoundProblem();
    }
    return item;
  }

  private notFoundProblem(): ProblemException {
    return new ProblemException(
      'VERIFICATION_NOT_FOUND',
      '인증 신청을 찾을 수 없습니다.',
      HttpStatus.NOT_FOUND,
    );
  }
}
