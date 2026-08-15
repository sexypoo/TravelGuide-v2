import {
  AnswerSourceType,
  ChatMessageType,
  CrowdLevel,
  EntryStatus,
  PrismaClient,
  QuestionCategory,
  QuestionStatus,
  QuestionUrgency,
  ReportTargetType,
  RoomParticipantKind,
} from '@prisma/client';

const WAITING_TOPIC_CONTENT = '지금 성산일출봉 입장 대기 얼마나 걸리나요?';
const DEMO_CHAT_CONTENT = {
  traveler: '성산일출봉에 곧 도착해요. 입장 대기 상황 아시는 분 계실까요?',
  local: '현장에 있어요. 표 사는 줄과 입장 줄을 나눠서 확인해볼게요.',
  topicShare: '성산일출봉 입장 대기 현황을 토픽으로 공유했어요.',
} as const;

export async function ensureDemoWaitingTopic(
  prisma: PrismaClient,
  now = new Date(),
): Promise<string> {
  const [room, admin, traveler, travelerB, localA, localB] = await Promise.all([
    prisma.destinationRoom.findUnique({
      where: { slug: 'jeju' },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { email: 'admin@travelguide.local' },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { email: 'demo@travelguide.local' },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { email: 'traveler2@travelguide.local' },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { email: 'local1@travelguide.local' },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { email: 'local2@travelguide.local' },
      select: { id: true },
    }),
  ]);
  if (
    room === null ||
    admin === null ||
    traveler === null ||
    travelerB === null ||
    localA === null ||
    localB === null
  ) {
    throw new Error('Run the base and account demo seeds first');
  }

  const demoParticipantIds = [traveler.id, travelerB.id, localA.id, localB.id];
  const existingTopics = await prisma.question.findMany({
    where: {
      roomId: room.id,
      authorId: traveler.id,
      content: WAITING_TOPIC_CONTENT,
    },
    select: { id: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
  const existing = existingTopics[0] ?? null;
  const topicCreatedAt = new Date(now.getTime() - 15 * 60 * 1000);
  const resettableMessages = await prisma.chatMessage.findMany({
    where: {
      roomId: room.id,
      authorId: { in: demoParticipantIds },
      imageObjectKey: null,
    },
    select: { id: true },
  });
  const resettableMessageIds = resettableMessages.map(({ id }) => id);

  await prisma.$transaction([
    prisma.question.updateMany({
      where: {
        roomId: room.id,
        authorId: { in: demoParticipantIds },
        ...(existing === null ? {} : { id: { not: existing.id } }),
        removedAt: null,
      },
      data: {
        status: QuestionStatus.REMOVED,
        removedAt: now,
        removedById: admin.id,
      },
    }),
    prisma.report.deleteMany({
      where: {
        targetType: ReportTargetType.MESSAGE,
        targetId: { in: resettableMessageIds },
      },
    }),
    prisma.chatMessage.deleteMany({
      where: { id: { in: resettableMessageIds } },
    }),
    prisma.chatMessage.updateMany({
      where: {
        roomId: room.id,
        authorId: { in: demoParticipantIds },
        imageObjectKey: { not: null },
        removedAt: null,
      },
      data: { removedAt: now, removedById: admin.id },
    }),
  ]);
  const questionData = {
    category: QuestionCategory.WAITING,
    urgency: QuestionUrgency.NORMAL,
    content: WAITING_TOPIC_CONTENT,
    areaText: '성산일출봉',
    authorKind: RoomParticipantKind.TRAVELER,
    status: QuestionStatus.OPEN,
    acceptedAnswerId: null,
    resolvedAt: null,
    removedAt: null,
    removedById: null,
    createdAt: topicCreatedAt,
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  };
  const question =
    existing === null
      ? await prisma.question.create({
          data: {
            roomId: room.id,
            authorId: traveler.id,
            ...questionData,
          },
          select: { id: true },
        })
      : await prisma.question.update({
          where: { id: existing.id },
          data: questionData,
          select: { id: true },
        });

  await prisma.answer.updateMany({
    where: { questionId: question.id, removedAt: null },
    data: { removedAt: now, removedById: admin.id },
  });

  const observations = [
    {
      authorId: localA.id,
      content:
        '표 사는 줄과 입장 줄이 나뉘어 있어요. 지금은 입장까지 약 35분 정도 걸립니다.',
      waitMinutes: 35,
      observedAt: new Date(now.getTime() - 6 * 60 * 1000),
    },
    {
      authorId: localB.id,
      content:
        '현장 입구에서 확인했어요. 온라인 예매 줄이 조금 더 빠르고 입장은 계속 진행 중입니다.',
      waitMinutes: 40,
      observedAt: new Date(now.getTime() - 9 * 60 * 1000),
    },
  ] as const;

  for (const observation of observations) {
    const answer = await prisma.answer.findFirst({
      where: { questionId: question.id, authorId: observation.authorId },
      select: { id: true },
    });
    const data = {
      authorKind: RoomParticipantKind.LOCAL,
      content: observation.content,
      sourceType: AnswerSourceType.ON_SITE_NOW,
      sourceUrl: null,
      waitMinutes: observation.waitMinutes,
      crowdLevel: CrowdLevel.BUSY,
      entryStatus: EntryStatus.OPEN,
      observedAt: observation.observedAt,
      removedAt: null,
      removedById: null,
      createdAt: observation.observedAt,
    };
    if (answer === null) {
      await prisma.answer.create({
        data: {
          questionId: question.id,
          authorId: observation.authorId,
          ...data,
        },
      });
    } else {
      await prisma.answer.update({ where: { id: answer.id }, data });
    }
  }

  const demoMessages = [
    {
      authorId: traveler.id,
      authorKind: RoomParticipantKind.TRAVELER,
      type: ChatMessageType.TEXT,
      content: DEMO_CHAT_CONTENT.traveler,
      sharedQuestionId: null,
      createdAt: new Date(now.getTime() - 18 * 60 * 1000),
    },
    {
      authorId: localA.id,
      authorKind: RoomParticipantKind.LOCAL,
      type: ChatMessageType.TEXT,
      content: DEMO_CHAT_CONTENT.local,
      sharedQuestionId: null,
      createdAt: new Date(now.getTime() - 12 * 60 * 1000),
    },
    {
      authorId: traveler.id,
      authorKind: RoomParticipantKind.TRAVELER,
      type: ChatMessageType.TOPIC_SHARE,
      content: DEMO_CHAT_CONTENT.topicShare,
      sharedQuestionId: question.id,
      createdAt: new Date(now.getTime() - 10 * 60 * 1000),
    },
  ] as const;

  for (const message of demoMessages) {
    const existingMessage = await prisma.chatMessage.findFirst({
      where: {
        roomId: room.id,
        authorId: message.authorId,
        type: message.type,
        content: message.content,
      },
      select: { id: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    const data = {
      authorKind: message.authorKind,
      type: message.type,
      content: message.content,
      sharedQuestionId: message.sharedQuestionId,
      createdAt: message.createdAt,
      removedAt: null,
      removedById: null,
    };
    if (existingMessage === null) {
      await prisma.chatMessage.create({
        data: { roomId: room.id, authorId: message.authorId, ...data },
      });
    } else {
      await prisma.chatMessage.update({
        where: { id: existingMessage.id },
        data,
      });
    }
  }

  return question.id;
}
