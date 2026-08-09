import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
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

describe('T24 travel profile and owner records', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.listen(0, '127.0.0.1');
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.travelRecord.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.travelRecord.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  async function createUser(name: string): Promise<TestAgent> {
    const password = 'password123';
    const user = await prisma.user.create({
      data: {
        email: `t24-${name}@example.com`,
        nickname: `T24-${name}`,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/login')
      .send({ email: user.email, password })
      .expect(200);
    return agent;
  }

  it('persists travel styles and keeps travel records owner-only', async () => {
    const owner = await createUser('owner');
    const other = await createUser('other');

    const profile = await owner
      .patch('/api/v1/users/me')
      .send({ travelStyles: ['SLOW_TRAVEL', 'FOOD_EXPLORER'] })
      .expect(200);
    expect(record(profile.body as unknown).travelStyles).toEqual([
      'SLOW_TRAVEL',
      'FOOD_EXPLORER',
    ]);

    const created = await owner
      .post('/api/v1/travel-records')
      .send({
        title: '봄날의 제주',
        destination: '제주',
        startedOn: '2026-04-03',
        endedOn: '2026-04-06',
        note: '바닷길을 천천히 걸었다.',
      })
      .expect(201);
    const recordId = String(record(created.body as unknown).id);

    const list = await owner.get('/api/v1/travel-records').expect(200);
    expect(record(list.body as unknown).items).toEqual([
      expect.objectContaining({
        id: recordId,
        destination: '제주',
        startedOn: '2026-04-03',
        endedOn: '2026-04-06',
      }),
    ]);

    await other
      .patch(`/api/v1/travel-records/${recordId}`)
      .send({
        title: '훔친 기록',
        destination: '서울',
        startedOn: '2026-05-01',
        endedOn: '2026-05-02',
      })
      .expect(404);
    await other.delete(`/api/v1/travel-records/${recordId}`).expect(404);

    await owner
      .post('/api/v1/travel-records')
      .send({
        title: '잘못된 일정',
        destination: '부산',
        startedOn: '2026-06-03',
        endedOn: '2026-06-01',
      })
      .expect(400);
    await owner.delete(`/api/v1/travel-records/${recordId}`).expect(200, {
      deleted: true,
    });
  });
});
