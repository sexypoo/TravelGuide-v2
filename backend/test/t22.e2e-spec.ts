import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { VerificationStatus, VerificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Server } from 'node:net';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

type TestAgent = ReturnType<typeof request.agent>;

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected object response');
  }
  return value as Record<string, unknown>;
}

describe('T22 place favorites', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let destinationId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.listen(0, '127.0.0.1');
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
    const room = await prisma.destinationRoom.findUniqueOrThrow({
      where: { slug: 'jeju' },
    });
    destinationId = room.destinationId;
  });

  beforeEach(async () => {
    await prisma.placeFavorite.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.placeFavorite.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  async function createVerifiedUser(name: string): Promise<TestAgent> {
    const password = 'password123';
    const user = await prisma.user.create({
      data: {
        email: `t22-${name}@example.com`,
        nickname: `T22-${name}`,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    await prisma.verification.create({
      data: {
        userId: user.id,
        destinationId,
        type: VerificationType.TRAVELER,
        status: VerificationStatus.APPROVED,
        startsAt: new Date(Date.now() - 60_000),
        endsAt: new Date(Date.now() + 3_600_000),
        proofObjectKey: `test/${user.id}/traveler`,
        proofOriginalName: 'proof.pdf',
        proofMimeType: 'application/pdf',
        proofSizeBytes: 10,
        reviewedAt: new Date(),
      },
    });
    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/login')
      .send({ email: user.email, password })
      .expect(200);
    return agent;
  }

  it('persists a place once and enforces favorite ownership', async () => {
    const owner = await createVerifiedUser('owner');
    const other = await createVerifiedUser('other');
    const message = await owner
      .post('/api/v1/rooms/jeju/messages/places')
      .send({
        googlePlaceId: 'ChIJ-google-place',
        placeName: '동백식당',
        address: '제주시 바다로 1',
        latitude: 33.5,
        longitude: 126.5,
        note: '고등어구이가 좋아요.',
      })
      .expect(201);
    const messageId = String(record(message.body as unknown).id);

    const first = await owner
      .post('/api/v1/place-favorites')
      .send({ messageId })
      .expect(201);
    const firstId = String(record(first.body as unknown).id);
    await expect(
      prisma.placeFavorite.findUniqueOrThrow({ where: { id: firstId } }),
    ).resolves.toMatchObject({
      provider: 'GOOGLE',
      providerPlaceId: 'ChIJ-google-place',
    });
    const duplicate = await owner
      .post('/api/v1/place-favorites')
      .send({ messageId })
      .expect(201);
    expect(record(duplicate.body as unknown).id).toBe(firstId);

    const list = await owner.get('/api/v1/place-favorites').expect(200);
    expect(record(list.body as unknown).items).toEqual([
      expect.objectContaining({
        id: firstId,
        sourceMessageId: messageId,
        name: '동백식당',
        latitude: 33.5,
        longitude: 126.5,
      }),
    ]);

    await other.post(`/api/v1/place-favorites/${firstId}/remove`).expect(404);
    await owner
      .post(`/api/v1/place-favorites/${firstId}/remove`)
      .expect(201, { saved: false });
    await owner.get('/api/v1/place-favorites').expect(200, { items: [] });
  });
});
