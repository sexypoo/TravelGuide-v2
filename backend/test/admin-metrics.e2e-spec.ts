import { type INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import {
  QuestionStatus,
  UserRole,
  VerificationStatus,
  VerificationType,
} from '@prisma/client';
import type { Server } from 'node:net';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AUTH_COOKIE_NAME } from '../src/auth/auth-cookie';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

const FORBIDDEN_KEYS = [
  'email',
  'passwordHash',
  'gpsLat',
  'gpsLng',
  'gpsAccuracyMeters',
  'gpsCapturedAt',
  'proofObjectKey',
  'proofOriginalName',
  'submittedNote',
];

function collectKeys(value: unknown, keys: Set<string>): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys);
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      keys.add(key);
      collectKeys(child, keys);
    }
  }
  return keys;
}

describe('Admin metrics planning signals (ADR-051)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let jwt: JwtService;
  let destinationId: string;
  let roomId: string;
  const base = new Date('2026-09-01T00:00:00.000Z');

  function minutesAfter(minutes: number): Date {
    return new Date(base.getTime() + minutes * 60_000);
  }

  async function clean(): Promise<void> {
    await prisma.report.deleteMany();
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
    jwt = app.get(JwtService);
    const room = await prisma.destinationRoom.findUniqueOrThrow({
      where: { slug: 'jeju' },
      select: { id: true, destinationId: true },
    });
    roomId = room.id;
    destinationId = room.destinationId;
  });

  beforeEach(clean);

  afterAll(async () => {
    await clean();
    await app.close();
  });

  async function createUser(
    name: string,
    role: UserRole = UserRole.USER,
  ): Promise<{ id: string; cookie: string }> {
    const user = await prisma.user.create({
      data: {
        email: `metrics-${name}@example.com`,
        nickname: `M-${name.slice(0, 16)}`,
        passwordHash: 'not-used-in-this-test',
        role,
      },
    });
    const secret = process.env.JWT_SECRET;
    if (secret === undefined) throw new Error('JWT_SECRET is required');
    const token = await jwt.signAsync(
      { sub: user.id, role, sessionVersion: user.sessionVersion },
      { secret, expiresIn: 3600 },
    );
    return { id: user.id, cookie: `${AUTH_COOKIE_NAME}=${token}` };
  }

  async function verification(
    userId: string,
    type: VerificationType,
    status: VerificationStatus,
    reviewed: boolean,
  ): Promise<void> {
    await prisma.verification.create({
      data: {
        userId,
        destinationId,
        type,
        status,
        proofObjectKey: `verifications/${userId}/${type}-${status}.jpg`,
        proofOriginalName: 'proof.jpg',
        proofMimeType: 'image/jpeg',
        proofSizeBytes: 1024,
        gpsLat: 33.4996,
        gpsLng: 126.5312,
        reviewedAt: reviewed ? base : null,
      },
    });
  }

  async function question(
    authorId: string,
    data: {
      status?: QuestionStatus;
      removed?: boolean;
    } = {},
  ): Promise<string> {
    const created = await prisma.question.create({
      data: {
        roomId,
        authorId,
        category: 'OTHER',
        urgency: 'NORMAL',
        content: '지표 통합 테스트 토픽',
        status: data.removed
          ? QuestionStatus.REMOVED
          : (data.status ?? QuestionStatus.OPEN),
        removedAt: data.removed ? base : null,
        expiresAt: minutesAfter(24 * 60),
        createdAt: base,
      },
      select: { id: true },
    });
    return created.id;
  }

  async function answer(
    questionId: string,
    authorId: string,
    minutes: number,
    removed = false,
  ): Promise<string> {
    const created = await prisma.answer.create({
      data: {
        questionId,
        authorId,
        authorKind: 'LOCAL',
        content: '지표 통합 테스트 답변',
        sourceType: 'ON_SITE_NOW',
        createdAt: minutesAfter(minutes),
        removedAt: removed ? base : null,
      },
      select: { id: true },
    });
    return created.id;
  }

  it('rejects anonymous and non-admin requests', async () => {
    const member = await createUser('member');

    await request(server).get('/api/v1/admin/metrics').expect(401);
    await request(server)
      .get('/api/v1/admin/metrics')
      .set('Cookie', member.cookie)
      .expect(403);
  });

  it('returns the user funnel and supply signals from real records without personal fields', async () => {
    const admin = await createUser('admin', UserRole.ADMIN);
    const traveler = await createUser('traveler');
    const rejected = await createUser('rejected');
    const local = await createUser('local');
    await createUser('signup-only');

    await verification(
      admin.id,
      VerificationType.LOCAL,
      VerificationStatus.APPROVED,
      true,
    );
    await verification(
      traveler.id,
      VerificationType.TRAVELER,
      VerificationStatus.APPROVED,
      true,
    );
    await verification(
      traveler.id,
      VerificationType.TRAVELER,
      VerificationStatus.PENDING,
      false,
    );
    await verification(
      rejected.id,
      VerificationType.TRAVELER,
      VerificationStatus.REJECTED,
      true,
    );
    await verification(
      local.id,
      VerificationType.LOCAL,
      VerificationStatus.EXPIRED,
      true,
    );

    const adminTopic = await question(admin.id);
    await answer(adminTopic, local.id, 4);

    const acceptedTopic = await question(traveler.id, {
      status: QuestionStatus.RESOLVED,
    });
    const acceptedAnswer = await answer(acceptedTopic, local.id, 6);
    await answer(acceptedTopic, local.id, 8);
    await prisma.question.update({
      where: { id: acceptedTopic },
      data: { acceptedAnswerId: acceptedAnswer, resolvedAt: minutesAfter(9) },
    });

    const expiredTopic = await question(traveler.id, {
      status: QuestionStatus.EXPIRED,
    });
    await answer(expiredTopic, local.id, 2, true);

    await question(rejected.id, { removed: true });

    const response = await request(server)
      .get('/api/v1/admin/metrics')
      .set('Cookie', admin.cookie)
      .expect(200);
    const body: unknown = response.body;

    expect(body).toMatchObject({
      questionCount: 3,
      answeredQuestionCount: 2,
      userFunnel: {
        signedUpCount: 4,
        verificationAppliedCount: 3,
        verificationAppliedRate: 75,
        verificationApprovedCount: 2,
        verificationApprovedRate: 66.7,
        travelerApprovedCount: 1,
        localApprovedCount: 1,
        firstTopicCount: 1,
        firstTopicRate: 50,
        answerReceivedCount: 1,
        answerReceivedRate: 100,
        answerAcceptedCount: 1,
        answerAcceptedRate: 100,
      },
      supply: {
        unansweredExpiredQuestionCount: 1,
        unansweredExpiredQuestionRate: 33.3,
        averageAnswersPerAnsweredQuestion: 1.5,
        medianFirstAnswerMinutes: 5,
      },
    });

    const keys = collectKeys(body, new Set<string>());
    for (const key of FORBIDDEN_KEYS) {
      expect(keys.has(key)).toBe(false);
    }
    expect(JSON.stringify(body)).not.toContain('@example.com');
  });
});
