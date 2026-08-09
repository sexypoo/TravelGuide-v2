import { ProblemException } from '../common/http/problem.exception';
import { TravelRecordsService } from './travel-records.service';

describe('TravelRecordsService', () => {
  const baseInput = {
    title: '봄날의 제주',
    destination: '제주',
    startedOn: '2026-04-03',
    endedOn: '2026-04-06',
    note: '바닷길을 천천히 걸었다.',
  };

  it('stores normalized UTC dates for the owner', async () => {
    const prisma = {
      travelRecord: { create: jest.fn().mockResolvedValue({ id: 'record-1' }) },
    };
    const service = new TravelRecordsService(prisma as never);

    await service.create('user-1', baseInput);

    expect(prisma.travelRecord.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        title: '봄날의 제주',
        destination: '제주',
        startedOn: new Date('2026-04-03T00:00:00.000Z'),
        endedOn: new Date('2026-04-06T00:00:00.000Z'),
        note: '바닷길을 천천히 걸었다.',
      },
    });
  });

  it.each([
    { startedOn: '2026-02-30', endedOn: '2026-03-01' },
    { startedOn: '2026-04-06', endedOn: '2026-04-03' },
  ])('rejects invalid date ranges: %p', (dates) => {
    const service = new TravelRecordsService({} as never);

    expect(() => service.create('user-1', { ...baseInput, ...dates })).toThrow(
      ProblemException,
    );
    expect(() => service.create('user-1', { ...baseInput, ...dates })).toThrow(
      '여행 종료일은 시작일보다 빠를 수 없습니다.',
    );
  });

  it('does not reveal or mutate another user record', async () => {
    const prisma = {
      travelRecord: {
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };
    const service = new TravelRecordsService(prisma as never);

    await expect(
      service.update('other-user', 'record-1', baseInput),
    ).rejects.toMatchObject({
      code: 'TRAVEL_RECORD_NOT_FOUND',
    } satisfies Partial<ProblemException>);
    expect(prisma.travelRecord.update).not.toHaveBeenCalled();
  });
});
