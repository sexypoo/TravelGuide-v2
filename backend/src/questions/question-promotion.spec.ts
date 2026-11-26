import { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { PrivateObjectLifecycleService } from '../storage/private-object-lifecycle.service';
import { QuestionCommandService } from './question-command.service';
import { QuestionQueryService } from './question-query.service';

const user: AuthenticatedUser = {
  id: 'traveler-id',
  email: 'traveler@example.com',
  nickname: '여행자',
  role: UserRole.USER,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
};

const now = new Date('2026-08-01T00:10:00.000Z');
const sourceContent =
  '공항에서 서귀포로 가는 버스가 현재 많이 지연되고 있나요?';

interface SourceMessage {
  roomId: string;
  authorId: string;
  type: 'TEXT' | 'IMAGE' | 'PLACE' | 'TOPIC_SHARE';
  content: string;
  removedAt: Date | null;
  topic: { id: string } | null;
}

function ownTextMessage(overrides: Partial<SourceMessage> = {}): SourceMessage {
  return {
    roomId: 'room-id',
    authorId: user.id,
    type: 'TEXT',
    content: sourceContent,
    removedAt: null,
    topic: null,
    ...overrides,
  };
}

function serviceWith(message: SourceMessage): {
  commands: QuestionCommandService;
  transaction: {
    chatMessage: { findUnique: jest.Mock };
    question: { count: jest.Mock; create: jest.Mock };
  };
} {
  const transaction = {
    $executeRaw: jest.fn().mockResolvedValue(1),
    chatMessage: { findUnique: jest.fn().mockResolvedValue(message) },
    question: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({
        id: 'question-id',
        roomId: 'room-id',
        authorId: user.id,
        authorKind: 'TRAVELER',
        sourceMessageId: 'message-id',
        category: 'TRANSPORT',
        urgency: 'URGENT',
        content: message.content,
        areaText: null,
        imageObjectKey: null,
        imageOriginalName: null,
        imageMimeType: null,
        imageSizeBytes: null,
        status: 'OPEN',
        acceptedAnswerId: null,
        expiresAt: new Date('2026-08-02T00:10:00.000Z'),
        resolvedAt: null,
        removedAt: null,
        createdAt: now,
        updatedAt: now,
        author: { id: user.id, nickname: user.nickname },
        _count: { answers: 0 },
      }),
    },
  };
  const prisma = {
    $transaction: jest.fn(
      (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    ),
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
  };
  const publisher = { publishQuestionCreated: jest.fn() };
  const storage = {
    putPrivate: jest.fn(),
    getPrivateDownload: jest.fn(),
    delete: jest.fn(),
  };
  const queries = new QuestionQueryService(
    prisma as never,
    rooms as never,
    roomAccess as never,
    storage,
  );
  return {
    commands: new QuestionCommandService(
      prisma as never,
      rooms as never,
      roomAccess as never,
      publisher as never,
      new PrivateObjectLifecycleService(storage),
      queries,
    ),
    transaction,
  };
}

function promote(commands: QuestionCommandService): Promise<unknown> {
  return commands.create(
    'jeju',
    user,
    { category: 'TRANSPORT', urgency: 'URGENT', sourceMessageId: 'message-id' },
    now,
  );
}

describe('message promotion checks', () => {
  it.each([
    ['a hidden text message', ownTextMessage({ removedAt: now })],
    ['a topic share message', ownTextMessage({ type: 'TOPIC_SHARE' })],
    ['an image message', ownTextMessage({ type: 'IMAGE' })],
  ])('rejects %s without creating a topic', async (_label, message) => {
    const { commands, transaction } = serviceWith(message);
    await expect(promote(commands)).rejects.toMatchObject({
      code: 'MESSAGE_NOT_AVAILABLE_FOR_PROMOTION',
    });
    expect(transaction.question.create).not.toHaveBeenCalled();
  });

  it('still promotes an own visible text message', async () => {
    const { commands, transaction } = serviceWith(ownTextMessage());
    await expect(promote(commands)).resolves.toMatchObject({
      sourceMessageId: 'message-id',
      content: sourceContent,
    });
    expect(transaction.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sourceMessageId: 'message-id',
          content: sourceContent,
        }) as unknown,
      }),
    );
  });
});
