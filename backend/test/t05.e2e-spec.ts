import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  QuestionCategory,
  QuestionStatus,
  QuestionUrgency,
  VerificationStatus,
  VerificationType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

type TestAgent = ReturnType<typeof request.agent>;

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected object');
  }
  return value as Record<string, unknown>;
}

function items(value: unknown): Record<string, unknown>[] {
  const body = record(value);
  if (!Array.isArray(body.items)) {
    throw new Error('Expected items array');
  }
  return body.items.map(record);
}

describe('T05 room questions', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let destinationId: string;
  let roomId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
    const room = await prisma.destinationRoom.findUniqueOrThrow({
      where: { slug: 'jeju' },
    });
    destinationId = room.destinationId;
    roomId = room.id;
  });

  beforeEach(async () => {
    await prisma.question.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.question.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  async function createUser(
    name: string,
  ): Promise<{ id: string; agent: TestAgent }> {
    const email = `${name}@example.com`;
    const password = 'password123';
    const user = await prisma.user.create({
      data: {
        email,
        nickname: `사용자-${name}`,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);
    return { id: user.id, agent };
  }

  async function approve(
    userId: string,
    type: VerificationType,
    options: { expired?: boolean } = {},
  ): Promise<void> {
    const now = Date.now();
    const expired = options.expired === true;
    await prisma.verification.create({
      data: {
        userId,
        destinationId,
        type,
        status: VerificationStatus.APPROVED,
        startsAt:
          type === VerificationType.TRAVELER
            ? new Date(now - 48 * 60 * 60 * 1000)
            : null,
        endsAt:
          type === VerificationType.TRAVELER
            ? new Date(
                now + (expired ? -25 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000),
              )
            : null,
        expiresAt:
          type === VerificationType.LOCAL
            ? new Date(now + 90 * 24 * 60 * 60 * 1000)
            : null,
        proofObjectKey: `test/${userId}/${type}`,
        proofOriginalName: 'proof.pdf',
        proofMimeType: 'application/pdf',
        proofSizeBytes: 10,
        reviewedAt: new Date(now - 1000),
      },
    });
  }

  const validQuestion = {
    category: QuestionCategory.PLACE,
    urgency: QuestionUrgency.URGENT,
    content:
      '<script>alert(1)</script> 제주 공항 근처에서 늦게까지 여는 장소가 궁금해요.',
    areaText: '제주 공항 근처',
  };

  it('requires authentication and room verification to read the feed', async () => {
    await request(server).get('/api/v1/rooms/jeju/questions').expect(401);
    const unverified = await createUser('unverified');
    const response = await unverified.agent
      .get('/api/v1/rooms/jeju/questions')
      .expect(403);
    expect(record(response.body as unknown).code).toBe('ROOM_ACCESS_DENIED');
  });

  it('lets a verified traveler create and read a plain-text question', async () => {
    const traveler = await createUser('traveler');
    await approve(traveler.id, VerificationType.TRAVELER);

    const created = await traveler.agent
      .post('/api/v1/rooms/jeju/questions')
      .send(validQuestion)
      .expect(201);
    const body = record(created.body as unknown);
    expect(body).toMatchObject({
      category: 'PLACE',
      urgency: 'URGENT',
      content: validQuestion.content,
      contentFormat: 'PLAIN_TEXT',
      areaText: validQuestion.areaText,
      status: 'OPEN',
      answerCount: 0,
      safetyNotice: null,
      author: {
        id: traveler.id,
        nickname: '사용자-traveler',
        badge: 'VERIFIED_TRAVELER',
      },
    });
    expect(JSON.stringify(body)).not.toMatch(
      /email|password|bio|proofObjectKey|gpsLat/,
    );

    const stored = await prisma.question.findUniqueOrThrow({
      where: { id: String(body.id) },
    });
    expect(stored.status).toBe(QuestionStatus.OPEN);
    expect(stored.expiresAt.getTime() - stored.createdAt.getTime()).toBe(
      24 * 60 * 60 * 1000,
    );

    const feed = await traveler.agent
      .get('/api/v1/rooms/jeju/questions')
      .expect(200);
    expect(items(feed.body as unknown).map((item) => item.id)).toEqual([
      body.id,
    ]);
    const detail = await traveler.agent
      .get(`/api/v1/questions/${String(body.id)}`)
      .expect(200);
    expect(detail.body).toMatchObject(body);
  });

  it('rejects local-only and expired traveler identities when creating', async () => {
    const local = await createUser('local');
    await approve(local.id, VerificationType.LOCAL);
    const localResponse = await local.agent
      .post('/api/v1/rooms/jeju/questions')
      .send(validQuestion)
      .expect(403);
    expect(record(localResponse.body as unknown).code).toBe(
      'TRAVELER_VERIFICATION_REQUIRED',
    );

    const expired = await createUser('expired');
    await approve(expired.id, VerificationType.TRAVELER, { expired: true });
    const expiredResponse = await expired.agent
      .post('/api/v1/rooms/jeju/questions')
      .send(validQuestion)
      .expect(403);
    expect(record(expiredResponse.body as unknown).code).toBe(
      'TRAVELER_VERIFICATION_REQUIRED',
    );
  });

  it('serializes concurrent creation and enforces three active questions', async () => {
    const traveler = await createUser('limited');
    await approve(traveler.id, VerificationType.TRAVELER);
    for (let index = 0; index < 2; index += 1) {
      await traveler.agent
        .post('/api/v1/rooms/jeju/questions')
        .send({
          ...validQuestion,
          content: `${validQuestion.content} ${index}`,
        })
        .expect(201);
    }

    const responses = await Promise.all([
      traveler.agent
        .post('/api/v1/rooms/jeju/questions')
        .send({ ...validQuestion, content: `${validQuestion.content} 동시 A` }),
      traveler.agent
        .post('/api/v1/rooms/jeju/questions')
        .send({ ...validQuestion, content: `${validQuestion.content} 동시 B` }),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);
    const conflict = responses.find((response) => response.status === 409);
    expect(record(conflict?.body as unknown).code).toBe(
      'OPEN_QUESTION_LIMIT_REACHED',
    );
    expect(
      await prisma.question.count({
        where: { authorId: traveler.id, status: QuestionStatus.OPEN },
      }),
    ).toBe(3);
  });

  it('derives expired status and keeps resolved filtering separate', async () => {
    const traveler = await createUser('status');
    await approve(traveler.id, VerificationType.TRAVELER);
    const now = new Date();
    const expired = await prisma.question.create({
      data: {
        roomId,
        authorId: traveler.id,
        category: QuestionCategory.SAFETY,
        urgency: QuestionUrgency.NORMAL,
        content: '해안 산책로의 현재 안전 통제 여부를 확인하고 싶습니다.',
        status: QuestionStatus.OPEN,
        createdAt: new Date(now.getTime() - 25 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 1000),
      },
    });
    await prisma.question.create({
      data: {
        roomId,
        authorId: traveler.id,
        category: QuestionCategory.FOOD,
        urgency: QuestionUrgency.NORMAL,
        content: '제주 시내에서 채식 메뉴가 있는 식당을 추천해 주세요.',
        status: QuestionStatus.RESOLVED,
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
        resolvedAt: now,
      },
    });

    const openFeed = await traveler.agent
      .get('/api/v1/rooms/jeju/questions')
      .query({ status: 'OPEN' })
      .expect(200);
    const openItems = items(openFeed.body as unknown);
    expect(openItems).toHaveLength(1);
    expect(openItems[0]).toMatchObject({
      id: expired.id,
      status: 'EXPIRED',
    });
    expect(String(openItems[0]?.safetyNotice)).toContain('112');
    const detail = await traveler.agent
      .get(`/api/v1/questions/${expired.id}`)
      .expect(200);
    expect(record(detail.body as unknown).status).toBe('EXPIRED');
    const resolvedFeed = await traveler.agent
      .get('/api/v1/rooms/jeju/questions')
      .query({ status: 'RESOLVED' })
      .expect(200);
    expect(items(resolvedFeed.body as unknown)).toHaveLength(1);
    expect(items(resolvedFeed.body as unknown)[0]?.status).toBe('RESOLVED');
  });

  it('paginates deterministically and validates cursor and limits', async () => {
    const traveler = await createUser('pagination');
    await approve(traveler.id, VerificationType.TRAVELER);
    const createdAt = new Date('2026-07-31T12:00:00.000Z');
    for (const id of ['question-a', 'question-b', 'question-c']) {
      await prisma.question.create({
        data: {
          id,
          roomId,
          authorId: traveler.id,
          category: QuestionCategory.WEATHER,
          urgency: QuestionUrgency.NORMAL,
          content: `오늘 제주 지역의 시간대별 날씨를 자세히 알고 싶습니다. ${id}`,
          expiresAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000),
          createdAt,
        },
      });
    }

    const first = await traveler.agent
      .get('/api/v1/rooms/jeju/questions')
      .query({ limit: 2 })
      .expect(200);
    expect(items(first.body as unknown).map((item) => item.id)).toEqual([
      'question-c',
      'question-b',
    ]);
    const cursor = String(record(first.body as unknown).nextCursor);
    const second = await traveler.agent
      .get('/api/v1/rooms/jeju/questions')
      .query({ limit: 2, cursor })
      .expect(200);
    expect(items(second.body as unknown).map((item) => item.id)).toEqual([
      'question-a',
    ]);
    expect(record(second.body as unknown).nextCursor).toBeNull();

    const invalidCursor = await traveler.agent
      .get('/api/v1/rooms/jeju/questions')
      .query({ cursor: 'not-a-cursor' })
      .expect(400);
    expect(record(invalidCursor.body as unknown).code).toBe('INVALID_CURSOR');
    await traveler.agent
      .get('/api/v1/rooms/jeju/questions')
      .query({ limit: 51 })
      .expect(400);
  });
});
