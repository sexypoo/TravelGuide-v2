import { HttpStatus, Injectable } from '@nestjs/common';
import type { TravelRecord } from '@prisma/client';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import type { SaveTravelRecordDto } from './dto/save-travel-record.dto';

@Injectable()
export class TravelRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string): Promise<TravelRecord[]> {
    return this.prisma.travelRecord.findMany({
      where: { userId },
      orderBy: [{ startedOn: 'desc' }, { id: 'desc' }],
    });
  }

  create(userId: string, input: SaveTravelRecordDto): Promise<TravelRecord> {
    const dates = this.dates(input);
    return this.prisma.travelRecord.create({
      data: {
        userId,
        title: input.title,
        destination: input.destination,
        ...dates,
        note: input.note?.trim() || null,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    input: SaveTravelRecordDto,
  ): Promise<TravelRecord> {
    await this.owned(userId, id);
    const dates = this.dates(input);
    return this.prisma.travelRecord.update({
      where: { id },
      data: {
        title: input.title,
        destination: input.destination,
        ...dates,
        note: input.note?.trim() || null,
      },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.owned(userId, id);
    await this.prisma.travelRecord.delete({ where: { id } });
  }

  private dates(input: SaveTravelRecordDto): {
    startedOn: Date;
    endedOn: Date;
  } {
    const startedOn = new Date(`${input.startedOn}T00:00:00.000Z`);
    const endedOn = new Date(`${input.endedOn}T00:00:00.000Z`);
    if (
      Number.isNaN(startedOn.getTime()) ||
      Number.isNaN(endedOn.getTime()) ||
      startedOn.toISOString().slice(0, 10) !== input.startedOn ||
      endedOn.toISOString().slice(0, 10) !== input.endedOn ||
      endedOn < startedOn
    ) {
      throw new ProblemException(
        'TRAVEL_RECORD_DATES_INVALID',
        '여행 종료일은 시작일보다 빠를 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { startedOn, endedOn };
  }

  private async owned(userId: string, id: string): Promise<void> {
    const record = await this.prisma.travelRecord.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (record === null) {
      throw new ProblemException(
        'TRAVEL_RECORD_NOT_FOUND',
        '여행 기록을 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
