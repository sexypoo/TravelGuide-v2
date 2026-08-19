import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, VerificationStatus, VerificationType } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import { PrivateObjectLifecycleService } from '../storage/private-object-lifecycle.service';
import { haversineDistanceKm } from './distance';
import type { CreateLocalVerificationDto } from './dto/create-local-verification.dto';
import type { CreateTravelerVerificationDto } from './dto/create-traveler-verification.dto';
import {
  toVerificationResponse,
  type VerificationResponse,
} from './dto/verification.response';
import { type EvidenceFile, validateEvidenceFile } from './evidence-file';

const responseInclude = {
  destination: { select: { id: true, slug: true, nameKo: true } },
} satisfies Prisma.VerificationInclude;

@Injectable()
export class VerificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly privateObjects: PrivateObjectLifecycleService,
  ) {}

  async createTraveler(
    userId: string,
    input: CreateTravelerVerificationDto,
    file: EvidenceFile | undefined,
  ): Promise<VerificationResponse> {
    validateEvidenceFile(file);
    if (file === undefined) {
      throw new Error('Evidence validation did not narrow the file');
    }

    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    const submittedAt = new Date();
    if (startsAt > endsAt) {
      throw new ProblemException(
        'INVALID_TRAVEL_DATES',
        '여행 시작일은 종료일보다 늦을 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (endsAt < submittedAt) {
      throw new ProblemException(
        'TRAVEL_END_DATE_IN_PAST',
        '여행 종료일은 신청 시각보다 이전일 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.requireDestination(input.destinationId);
    await this.rejectDuplicateOrCoveredTrip(
      userId,
      input.destinationId,
      startsAt,
      endsAt,
    );

    return this.storeAndCreate(userId, file, {
      userId,
      destinationId: input.destinationId,
      type: VerificationType.TRAVELER,
      startsAt,
      endsAt,
      submittedNote: input.note === '' ? null : input.note,
    });
  }

  async createLocal(
    userId: string,
    input: CreateLocalVerificationDto,
    file: EvidenceFile | undefined,
  ): Promise<VerificationResponse> {
    validateEvidenceFile(file);
    if (file === undefined) {
      throw new Error('Evidence validation did not narrow the file');
    }

    if (input.accuracyMeters > 200) {
      throw new ProblemException(
        'GPS_ACCURACY_TOO_LOW',
        'GPS 정확도가 낮습니다. 위치를 다시 확인해 주세요.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const destination = await this.requireDestination(input.destinationId);
    const distanceKm = haversineDistanceKm(
      { latitude: input.latitude, longitude: input.longitude },
      {
        latitude: destination.centerLatitude.toNumber(),
        longitude: destination.centerLongitude.toNumber(),
      },
    );
    if (distanceKm > destination.radiusKm.toNumber()) {
      throw new ProblemException(
        'OUTSIDE_DESTINATION_AREA',
        '선택한 여행지의 인증 가능 지역 밖입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.rejectPending(
      userId,
      input.destinationId,
      VerificationType.LOCAL,
    );
    return this.storeAndCreate(userId, file, {
      userId,
      destinationId: input.destinationId,
      type: VerificationType.LOCAL,
      localProofType: input.localProofType,
      gpsLat: input.latitude,
      gpsLng: input.longitude,
      gpsAccuracyMeters: input.accuracyMeters,
      gpsCapturedAt: new Date(input.capturedAt),
      submittedNote: input.note,
    });
  }

  async listMine(userId: string): Promise<VerificationResponse[]> {
    const verifications = await this.prisma.verification.findMany({
      where: { userId },
      include: responseInclude,
      orderBy: { createdAt: 'desc' },
    });
    return verifications.map(toVerificationResponse);
  }

  private async requireDestination(destinationId: string): Promise<{
    id: string;
    centerLatitude: Prisma.Decimal;
    centerLongitude: Prisma.Decimal;
    radiusKm: Prisma.Decimal;
  }> {
    const destination = await this.prisma.destination.findUnique({
      where: { id: destinationId },
      select: {
        id: true,
        centerLatitude: true,
        centerLongitude: true,
        radiusKm: true,
      },
    });
    if (destination === null) {
      throw new ProblemException(
        'DESTINATION_NOT_FOUND',
        '여행지를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    return destination;
  }

  private async rejectPending(
    userId: string,
    destinationId: string,
    type: VerificationType,
  ): Promise<void> {
    const pending = await this.prisma.verification.findFirst({
      where: {
        userId,
        destinationId,
        type,
        status: VerificationStatus.PENDING,
      },
      select: { id: true },
    });
    if (pending !== null) {
      throw this.pendingProblem();
    }
  }

  private async rejectDuplicateOrCoveredTrip(
    userId: string,
    destinationId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<void> {
    await this.rejectPending(userId, destinationId, VerificationType.TRAVELER);
    const covered = await this.prisma.verification.findFirst({
      where: {
        userId,
        destinationId,
        type: VerificationType.TRAVELER,
        status: VerificationStatus.APPROVED,
        startsAt: { lte: startsAt },
        endsAt: { gte: endsAt },
      },
      select: { id: true },
    });
    if (covered !== null) {
      throw new ProblemException(
        'TRAVEL_PERIOD_ALREADY_APPROVED',
        '이미 승인된 여행 기간에 포함된 신청입니다.',
        HttpStatus.CONFLICT,
      );
    }
  }

  private async storeAndCreate(
    userId: string,
    file: EvidenceFile,
    data: Omit<
      Prisma.VerificationUncheckedCreateInput,
      | 'proofObjectKey'
      | 'proofOriginalName'
      | 'proofMimeType'
      | 'proofSizeBytes'
    >,
  ): Promise<VerificationResponse> {
    const objectKey = `verification/${userId}/${randomUUID()}`;
    try {
      const verification = await this.privateObjects.storeThenPersist(
        { objectKey, contents: file.buffer },
        () =>
          this.prisma.verification.create({
            data: {
              ...data,
              proofObjectKey: objectKey,
              proofOriginalName: basename(file.originalname).slice(0, 255),
              proofMimeType: file.mimetype,
              proofSizeBytes: file.size,
            },
            include: responseInclude,
          }),
      );
      return toVerificationResponse(verification);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw this.pendingProblem();
      }
      throw error;
    }
  }

  private pendingProblem(): ProblemException {
    return new ProblemException(
      'VERIFICATION_ALREADY_PENDING',
      '같은 유형의 인증이 이미 심사 중입니다.',
      HttpStatus.CONFLICT,
    );
  }
}
