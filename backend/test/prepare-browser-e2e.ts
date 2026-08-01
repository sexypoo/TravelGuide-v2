import 'dotenv/config';
import {
  PrismaClient,
  UserRole,
  VerificationStatus,
  VerificationType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const password = 'e2e-password123';

async function createParticipant(
  email: string,
  nickname: string,
  type: VerificationType,
  destinationId: string,
): Promise<void> {
  const user = await prisma.user.create({
    data: { email, nickname, passwordHash: await bcrypt.hash(password, 12) },
  });
  const now = Date.now();
  await prisma.verification.create({
    data: {
      userId: user.id,
      destinationId,
      type,
      status: VerificationStatus.APPROVED,
      startsAt:
        type === VerificationType.TRAVELER
          ? new Date(now - 60 * 60 * 1000)
          : null,
      endsAt:
        type === VerificationType.TRAVELER
          ? new Date(now + 24 * 60 * 60 * 1000)
          : null,
      expiresAt:
        type === VerificationType.LOCAL
          ? new Date(now + 90 * 24 * 60 * 60 * 1000)
          : null,
      proofObjectKey: `e2e/${user.id}/${type}`,
      proofOriginalName: 'e2e-proof.pdf',
      proofMimeType: 'application/pdf',
      proofSizeBytes: 10,
      reviewedAt: new Date(),
    },
  });
}

async function prepare(): Promise<void> {
  const room = await prisma.destinationRoom.findUniqueOrThrow({
    where: { slug: 'jeju' },
  });
  await prisma.report.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.communityComment.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  await createParticipant(
    'traveler@e2e.local',
    'E2E여행자',
    VerificationType.TRAVELER,
    room.destinationId,
  );
  await createParticipant(
    'local-a@e2e.local',
    'E2E현지인A',
    VerificationType.LOCAL,
    room.destinationId,
  );
  await createParticipant(
    'local-b@e2e.local',
    'E2E현지인B',
    VerificationType.LOCAL,
    room.destinationId,
  );
  await prisma.user.create({
    data: {
      email: 'admin@e2e.local',
      nickname: 'E2E관리자',
      passwordHash: await bcrypt.hash(password, 12),
      role: UserRole.ADMIN,
    },
  });
}

async function run(): Promise<void> {
  try {
    await prepare();
  } finally {
    await prisma.$disconnect();
  }
}

void run();
