import { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { QuestionsService } from './questions.service';

const user: AuthenticatedUser = {
  id: 'traveler-id',
  email: 'traveler@example.com',
  nickname: '여행자',
  role: UserRole.USER,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
};

function serviceWith(answer: unknown = null): {
  service: QuestionsService;
  roomAccess: {
    assertCanParticipate: jest.Mock;
    assertCanViewContent: jest.Mock;
  };
  storage: {
    putPrivate: jest.Mock;
    getPrivateDownload: jest.Mock;
    delete: jest.Mock;
  };
} {
  const prisma = {
    question: { findUnique: jest.fn().mockResolvedValue(answer) },
    $transaction: jest.fn().mockRejectedValue(new Error('db failed')),
  };
  const rooms = {
    getIdentity: jest.fn().mockResolvedValue({
      id: 'room-id',
      slug: 'jeju',
      destinationId: 'destination-id',
    }),
  };
  const roomAccess = {
    assertCanParticipate: jest.fn().mockResolvedValue({ kind: 'TRAVELER' }),
    assertCanViewContent: jest.fn().mockResolvedValue(undefined),
  };
  const publisher = { publishQuestionCreated: jest.fn() };
  const storage = {
    putPrivate: jest.fn().mockResolvedValue({
      objectKey: 'question-media/room-id/generated-id',
      sizeBytes: 8,
    }),
    getPrivateDownload: jest.fn().mockResolvedValue('/private/question.png'),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  return {
    service: new QuestionsService(
      prisma as never,
      rooms as never,
      roomAccess as never,
      publisher as never,
      storage,
    ),
    roomAccess,
    storage,
  };
}

describe('question image access and cleanup', () => {
  it('authorizes the room before resolving a private image', async () => {
    const { service, roomAccess, storage } = serviceWith({
      status: 'OPEN',
      removedAt: null,
      imageObjectKey: 'question-media/room-id/image-id',
      imageMimeType: 'image/png',
      imageOriginalName: '현장.png',
      room: { destinationId: 'destination-id' },
    });
    await expect(service.getImage('question-id', user)).resolves.toEqual({
      path: '/private/question.png',
      mimeType: 'image/png',
      originalName: '현장.png',
    });
    expect(roomAccess.assertCanViewContent).toHaveBeenCalledWith(
      user,
      'destination-id',
    );
    expect(storage.getPrivateDownload).toHaveBeenCalledWith(
      'question-media/room-id/image-id',
      60,
    );
  });

  it('denies image reads after the topic is removed', async () => {
    const { service, roomAccess, storage } = serviceWith({
      status: 'REMOVED',
      removedAt: new Date('2026-08-01T00:30:00.000Z'),
      imageObjectKey: 'question-media/room-id/image-id',
      imageMimeType: 'image/png',
      imageOriginalName: '현장.png',
      room: { destinationId: 'destination-id' },
    });
    await expect(service.getImage('question-id', user)).rejects.toMatchObject({
      code: 'QUESTION_IMAGE_NOT_FOUND',
    });
    expect(roomAccess.assertCanViewContent).not.toHaveBeenCalled();
    expect(storage.getPrivateDownload).not.toHaveBeenCalled();
  });

  it('deletes the upload when topic persistence fails', async () => {
    const { service, storage } = serviceWith();
    const image = {
      originalname: '현장.png',
      mimetype: 'image/png',
      size: 8,
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    };
    await expect(
      service.create(
        'jeju',
        user,
        {
          category: 'PLACE',
          urgency: 'NORMAL',
          content: '현재 현장 상황을 사진과 함께 자세히 공유합니다.',
        },
        new Date('2026-08-01T00:10:00.000Z'),
        image,
      ),
    ).rejects.toThrow('db failed');
    expect(storage.putPrivate).toHaveBeenCalledTimes(1);
    expect(storage.delete).toHaveBeenCalledWith(
      expect.stringMatching(/^question-media\/room-id\//),
    );
  });
});
