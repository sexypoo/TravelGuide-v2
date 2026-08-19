import { Prisma } from '@prisma/client';

export const questionInclude = {
  author: { select: { id: true, nickname: true } },
  _count: { select: { answers: { where: { removedAt: null } } } },
} satisfies Prisma.QuestionInclude;

export type QuestionRecord = Prisma.QuestionGetPayload<{
  include: typeof questionInclude;
}>;

export const expiringQuestionInclude = {
  ...questionInclude,
  room: { select: { id: true, slug: true } },
} satisfies Prisma.QuestionInclude;
