import { PrismaClient, QuestionStatus, UserRole } from '@prisma/client';
import { ensureDemoWaitingTopic } from '../prisma/demo-content';

describe('T25 presentation demo reset', () => {
  const prisma = new PrismaClient();
  const now = new Date('2026-08-15T03:00:00.000Z');
  const identities = [
    ['admin@travelguide.local', 'T25관리자', UserRole.ADMIN],
    ['demo@travelguide.local', 'T25여행자A', UserRole.USER],
    ['traveler2@travelguide.local', 'T25여행자B', UserRole.USER],
    ['local1@travelguide.local', 'T25현지인A', UserRole.USER],
    ['local2@travelguide.local', 'T25현지인B', UserRole.USER],
  ] as const;

  beforeAll(async () => {
    for (const [email, nickname, role] of identities) {
      await prisma.user.upsert({
        where: { email },
        create: {
          email,
          nickname,
          role,
          passwordHash: 'not-used-in-this-test',
        },
        update: { nickname, role },
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('keeps unrelated content and refreshes one coherent managed demo scene', async () => {
    const room = await prisma.destinationRoom.findUniqueOrThrow({
      where: { slug: 'jeju' },
      select: { id: true },
    });
    const traveler = await prisma.user.findUniqueOrThrow({
      where: { email: 'demo@travelguide.local' },
      select: { id: true },
    });
    const unrelated = await prisma.user.create({
      data: {
        email: `t25-${Date.now()}@example.com`,
        nickname: `외부${Date.now().toString().slice(-8)}`,
        passwordHash: 'not-used-in-this-test',
      },
      select: { id: true },
    });
    const staleQuestion = await prisma.question.create({
      data: {
        roomId: room.id,
        authorId: traveler.id,
        category: 'OTHER',
        urgency: 'NORMAL',
        content: '이전 발표 연습용 토픽',
        expiresAt: new Date(now.getTime() + 60_000),
      },
      select: { id: true },
    });
    const unrelatedMessage = await prisma.chatMessage.create({
      data: {
        roomId: room.id,
        authorId: unrelated.id,
        authorKind: 'TRAVELER',
        content: '비데모 사용자의 메시지',
      },
      select: { id: true },
    });
    const staleManagedMessage = await prisma.chatMessage.create({
      data: {
        roomId: room.id,
        authorId: traveler.id,
        authorKind: 'TRAVELER',
        content: '이전 발표 연습용 메시지',
      },
      select: { id: true },
    });

    const topicId = await ensureDemoWaitingTopic(prisma, now);
    await ensureDemoWaitingTopic(prisma, now);
    const managedUsers = await prisma.user.findMany({
      where: { email: { in: identities.slice(1).map(([email]) => email) } },
      select: { id: true },
    });

    const [
      topic,
      answers,
      visibleManagedMessages,
      stale,
      removedManagedMessage,
      preserved,
    ] = await Promise.all([
      prisma.question.findUniqueOrThrow({ where: { id: topicId } }),
      prisma.answer.findMany({
        where: { questionId: topicId, removedAt: null },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.chatMessage.findMany({
        where: {
          roomId: room.id,
          authorId: { in: managedUsers.map(({ id }) => id) },
          removedAt: null,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.question.findUniqueOrThrow({ where: { id: staleQuestion.id } }),
      prisma.chatMessage.findUnique({ where: { id: staleManagedMessage.id } }),
      prisma.chatMessage.findUniqueOrThrow({
        where: { id: unrelatedMessage.id },
      }),
    ]);

    expect(topic.status).toBe(QuestionStatus.OPEN);
    expect(topic.createdAt).toEqual(new Date(now.getTime() - 15 * 60_000));
    expect(topic.expiresAt).toEqual(new Date(now.getTime() + 24 * 60 * 60_000));
    expect(answers).toHaveLength(2);
    expect(answers.map((answer) => answer.createdAt)).toEqual([
      new Date(now.getTime() - 9 * 60_000),
      new Date(now.getTime() - 6 * 60_000),
    ]);
    expect(stale.status).toBe(QuestionStatus.REMOVED);
    expect(removedManagedMessage).toBeNull();
    expect(preserved.removedAt).toBeNull();
    expect(visibleManagedMessages).toHaveLength(3);
    expect(visibleManagedMessages.map((message) => message.createdAt)).toEqual([
      new Date(now.getTime() - 18 * 60_000),
      new Date(now.getTime() - 12 * 60_000),
      new Date(now.getTime() - 10 * 60_000),
    ]);
  });
});
