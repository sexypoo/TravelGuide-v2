import {
  AnswerSourceType,
  CrowdLevel,
  EntryStatus,
  PrismaClient,
  QuestionCategory,
  QuestionStatus,
  QuestionUrgency,
  RoomParticipantKind,
} from '@prisma/client';

const WAITING_TOPIC_CONTENT = '지금 성산일출봉 입장 대기 얼마나 걸리나요?';

export async function ensureDemoWaitingTopic(
  prisma: PrismaClient,
  now = new Date(),
): Promise<string> {
  const [room, traveler, localA, localB] = await Promise.all([
    prisma.destinationRoom.findUnique({
      where: { slug: 'jeju' },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { email: 'demo@travelguide.local' },
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
    traveler === null ||
    localA === null ||
    localB === null
  ) {
    throw new Error('Run the base and account demo seeds first');
  }

  const existing = await prisma.question.findFirst({
    where: {
      roomId: room.id,
      authorId: traveler.id,
      content: WAITING_TOPIC_CONTENT,
    },
    select: { id: true },
  });
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
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  };
  const question =
    existing === null
      ? await prisma.question.create({
          data: {
            roomId: room.id,
            authorId: traveler.id,
            ...questionData,
            createdAt: new Date(now.getTime() - 15 * 60 * 1000),
          },
          select: { id: true },
        })
      : await prisma.question.update({
          where: { id: existing.id },
          data: questionData,
          select: { id: true },
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
    };
    if (answer === null) {
      await prisma.answer.create({
        data: {
          questionId: question.id,
          authorId: observation.authorId,
          ...data,
          createdAt: observation.observedAt,
        },
      });
    } else {
      await prisma.answer.update({ where: { id: answer.id }, data });
    }
  }

  return question.id;
}
