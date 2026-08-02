import { AnswerSourceType, UserRole } from '@prisma/client';
import { Readable } from 'node:stream';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { AnswersService } from './answers.service';

const user: AuthenticatedUser = {
  id: 'traveler-id',
  email: 'traveler@example.com',
  nickname: '여행자',
  role: UserRole.USER,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
};

function serviceWith(input: { answer?: unknown; transaction?: jest.Mock }): {
  service: AnswersService;
  roomAccess: {
    assertCanAnswer: jest.Mock;
    assertCanViewContent: jest.Mock;
  };
  storage: {
    putPrivate: jest.Mock;
    getPrivateDownload: jest.Mock;
    delete: jest.Mock;
  };
} {
  const prisma = {
    answer: { findUnique: jest.fn().mockResolvedValue(input.answer ?? null) },
    question: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'question-id',
        category: 'PLACE',
        room: {
          id: 'room-id',
          slug: 'jeju',
          destinationId: 'destination-id',
        },
      }),
    },
    $transaction:
      input.transaction ?? jest.fn().mockRejectedValue(new Error('db failed')),
  };
  const roomAccess = {
    assertCanAnswer: jest.fn().mockResolvedValue({
      kind: 'TRAVELER',
      verifiedAt: new Date('2026-08-01T00:00:00.000Z'),
    }),
    assertCanViewContent: jest.fn().mockResolvedValue(undefined),
  };
  const publisher = { publishAnswerCreated: jest.fn() };
  const storage = {
    putPrivate: jest.fn().mockResolvedValue({
      objectKey: 'answer-media/room-id/generated-id',
      sizeBytes: 8,
    }),
    getPrivateDownload: jest.fn().mockResolvedValue(Readable.from('image')),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  return {
    service: new AnswersService(
      prisma as never,
      roomAccess as never,
      publisher as never,
      storage,
    ),
    roomAccess,
    storage,
  };
}

describe('answer image access and cleanup', () => {
  it('checks room access before resolving a private answer image', async () => {
    const { service, roomAccess, storage } = serviceWith({
      answer: {
        removedAt: null,
        imageObjectKey: 'answer-media/room-id/image-id',
        imageMimeType: 'image/png',
        imageOriginalName: '현장.png',
        question: { room: { destinationId: 'destination-id' } },
      },
    });

    const download = await service.getImage('answer-id', user);
    expect(download.stream).toBeInstanceOf(Readable);
    expect(download).toMatchObject({
      mimeType: 'image/png',
      originalName: '현장.png',
    });
    expect(roomAccess.assertCanViewContent).toHaveBeenCalledWith(
      user,
      'destination-id',
    );
    expect(storage.getPrivateDownload).toHaveBeenCalledWith(
      'answer-media/room-id/image-id',
      60,
    );
  });

  it('denies an image after its answer is removed', async () => {
    const { service, roomAccess, storage } = serviceWith({
      answer: {
        removedAt: new Date('2026-08-01T00:30:00.000Z'),
        imageObjectKey: 'answer-media/room-id/image-id',
        imageMimeType: 'image/png',
        imageOriginalName: '현장.png',
        question: { room: { destinationId: 'destination-id' } },
      },
    });

    await expect(service.getImage('answer-id', user)).rejects.toMatchObject({
      code: 'ANSWER_IMAGE_NOT_FOUND',
    });
    expect(roomAccess.assertCanViewContent).not.toHaveBeenCalled();
    expect(storage.getPrivateDownload).not.toHaveBeenCalled();
  });

  it('deletes an uploaded image when the answer transaction fails', async () => {
    const { service, storage } = serviceWith({});
    const image = {
      originalname: '현장.png',
      mimetype: 'image/png',
      size: 8,
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    };

    await expect(
      service.create(
        'question-id',
        user,
        {
          content: '현장에서 직접 확인한 자세한 답변입니다.',
          sourceType: AnswerSourceType.ON_SITE_NOW,
        },
        new Date('2026-08-01T00:10:00.000Z'),
        image,
      ),
    ).rejects.toThrow('db failed');
    expect(storage.putPrivate).toHaveBeenCalledTimes(1);
    expect(storage.delete).toHaveBeenCalledWith(
      expect.stringMatching(/^answer-media\/room-id\//),
    );
  });
});
