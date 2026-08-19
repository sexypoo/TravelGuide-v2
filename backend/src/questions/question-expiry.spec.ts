import { QuestionsService } from './questions.service';

function expiryService(updatedCount: number): {
  service: QuestionsService;
  prisma: {
    question: { findMany: jest.Mock };
    $transaction: jest.Mock;
  };
  transaction: {
    question: { updateMany: jest.Mock; findUnique: jest.Mock };
  };
  publisher: { publishQuestionUpdated: jest.Mock };
  order: string[];
} {
  const order: string[] = [];
  const transaction = {
    question: {
      updateMany: jest.fn(() => {
        order.push('update');
        return Promise.resolve({ count: updatedCount });
      }),
      findUnique: jest.fn(() => {
        order.push('read');
        return Promise.resolve({
          id: 'question-id',
          roomId: 'room-id',
          authorId: 'traveler-id',
          authorKind: 'TRAVELER',
          sourceMessageId: null,
          category: 'PLACE',
          urgency: 'NORMAL',
          content: '마감 시간이 지난 토픽의 자세한 본문입니다.',
          areaText: null,
          imageObjectKey: null,
          imageOriginalName: null,
          imageMimeType: null,
          imageSizeBytes: null,
          status: 'EXPIRED',
          acceptedAnswerId: null,
          expiresAt: new Date('2026-08-01T00:00:00.000Z'),
          resolvedAt: null,
          removedAt: null,
          removedById: null,
          createdAt: new Date('2026-07-31T00:00:00.000Z'),
          updatedAt: new Date('2026-08-01T00:00:00.000Z'),
          author: { id: 'traveler-id', nickname: '여행자' },
          _count: { answers: 0 },
          room: { id: 'room-id', slug: 'jeju' },
        });
      }),
    },
  };
  const prisma = {
    question: {
      findMany: jest.fn().mockResolvedValue([{ id: 'question-id' }]),
    },
    $transaction: jest.fn(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        const result = await callback(transaction);
        order.push('commit');
        return result;
      },
    ),
  };
  const publisher = {
    publishQuestionUpdated: jest.fn(() => order.push('publish')),
  };
  return {
    service: new QuestionsService(
      prisma as never,
      {} as never,
      {} as never,
      publisher as never,
      {} as never,
      {} as never,
    ),
    prisma,
    transaction,
    publisher,
    order,
  };
}

describe('topic expiry batch', () => {
  it('expires due open topics at the exact boundary and publishes after commit', async () => {
    const now = new Date('2026-08-01T00:00:00.000Z');
    const { service, prisma, transaction, publisher, order } = expiryService(1);
    await expect(service.expireDue(now)).resolves.toBe(1);
    expect(prisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'OPEN', expiresAt: { lte: now } },
        take: 100,
      }),
    );
    expect(transaction.question.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'question-id',
        status: 'OPEN',
        expiresAt: { lte: now },
      },
      data: { status: 'EXPIRED' },
    });
    expect(publisher.publishQuestionUpdated).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['update', 'read', 'commit', 'publish']);
  });

  it('does not read or publish when another worker won the transition', async () => {
    const { service, transaction, publisher, order } = expiryService(0);
    await expect(
      service.expireDue(new Date('2026-08-01T00:00:00.000Z')),
    ).resolves.toBe(0);
    expect(transaction.question.findUnique).not.toHaveBeenCalled();
    expect(publisher.publishQuestionUpdated).not.toHaveBeenCalled();
    expect(order).toEqual(['update', 'commit']);
  });
});
