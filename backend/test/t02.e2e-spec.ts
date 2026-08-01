import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected an object response');
  }

  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected an array response');
  }

  return value;
}

describe('T02 destination, profile, and room shell', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('keeps the idempotent Jeju seed exact and singular', async () => {
    expect(await prisma.destination.count()).toBe(1);
    expect(await prisma.destinationRoom.count()).toBe(1);

    const room = await prisma.destinationRoom.findUniqueOrThrow({
      where: { slug: 'jeju' },
      include: { destination: true },
    });
    expect(room).toMatchObject({
      slug: 'jeju',
      title: '제주 실시간 여행 도움방',
      destination: {
        slug: 'jeju',
        nameKo: '제주',
        countryCode: 'KR',
        timezone: 'Asia/Seoul',
      },
    });
    expect(room.destination.centerLatitude.toNumber()).toBe(33.3617);
    expect(room.destination.centerLongitude.toNumber()).toBe(126.5292);
    expect(room.destination.radiusKm.toNumber()).toBe(80);
  });

  it('separates authenticated room metadata from locked content', async () => {
    await request(server).get('/api/v1/rooms').expect(401);

    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/register')
      .send({
        email: 'room-user@example.com',
        nickname: '방사용자',
        password: 'password123',
        termsAgreed: true,
      })
      .expect(201);

    const listResponse = await agent.get('/api/v1/rooms').expect(200);
    const rooms = asArray(listResponse.body as unknown);
    expect(rooms).toHaveLength(1);
    expect(asRecord(rooms[0])).toMatchObject({
      slug: 'jeju',
      title: '제주 실시간 여행 도움방',
      destination: {
        slug: 'jeju',
        nameKo: '제주',
        center: { latitude: 33.3617, longitude: 126.5292 },
        radiusKm: 80,
      },
      access: {
        status: 'VERIFICATION_REQUIRED',
        labelKo: '인증 필요',
        canViewContent: false,
      },
    });

    await agent
      .get('/api/v1/rooms/jeju')
      .expect(200)
      .expect(({ body }) => {
        expect(asRecord(body as unknown).access).toMatchObject({
          status: 'VERIFICATION_REQUIRED',
        });
      });

    const denied = await agent
      .get('/api/v1/rooms/jeju/content-access')
      .expect(403);
    expect(asRecord(denied.body as unknown).code).toBe('ROOM_ACCESS_DENIED');

    const missing = await agent.get('/api/v1/rooms/unknown').expect(404);
    expect(asRecord(missing.body as unknown).code).toBe('ROOM_NOT_FOUND');
  });

  it('allows an administrator through the same room access service', async () => {
    const passwordHash = await bcrypt.hash('adminpass123', 12);
    await prisma.user.create({
      data: {
        email: 'room-admin@example.com',
        nickname: '방관리자',
        passwordHash,
        role: UserRole.ADMIN,
      },
    });

    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/login')
      .send({ email: 'room-admin@example.com', password: 'adminpass123' })
      .expect(200);
    await agent.get('/api/v1/rooms/jeju/content-access').expect(204);
  });

  it('updates an own profile and keeps the public card private', async () => {
    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/register')
      .send({
        email: 'profile@example.com',
        nickname: '프로필사용자',
        password: 'password123',
        termsAgreed: true,
      })
      .expect(201);
    const stored = await prisma.user.findUniqueOrThrow({
      where: { email: 'profile@example.com' },
    });

    const updated = await agent
      .patch('/api/v1/users/me')
      .send({ nickname: ' 새닉네임 ', bio: ' 제주 여행을 준비 중입니다. ' })
      .expect(200);
    const updatedBody = asRecord(updated.body as unknown);
    expect(updatedBody).toMatchObject({
      id: stored.id,
      email: 'profile@example.com',
      nickname: '새닉네임',
      bio: '제주 여행을 준비 중입니다.',
      isAdmin: false,
    });
    expect(new Date(String(updatedBody.createdAt)).toISOString()).toBe(
      updatedBody.createdAt,
    );
    expect(new Date(String(updatedBody.updatedAt)).toISOString()).toBe(
      updatedBody.updatedAt,
    );

    const publicResponse = await agent
      .get(`/api/v1/users/${stored.id}/public`)
      .expect(200);
    const publicBody: unknown = publicResponse.body;
    expect(asRecord(publicBody)).toEqual({
      id: stored.id,
      nickname: '새닉네임',
      bio: '제주 여행을 준비 중입니다.',
      isVerifiedLocal: false,
      verifiedDestination: null,
      verifiedAt: null,
      joinedAt: stored.createdAt.toISOString(),
      stats: { answerCount: 0, acceptedAnswerCount: 0 },
    });
    const serialized = JSON.stringify(publicBody);
    expect(serialized).not.toContain('email');
    expect(serialized).not.toContain('passwordHash');
    expect(serialized).not.toContain('role');
    expect(serialized).not.toContain('proofObjectKey');
    expect(serialized).not.toContain('gpsLat');
  });

  it('returns stable profile conflicts and missing-user errors', async () => {
    const first = request.agent(server);
    const second = request.agent(server);
    await first
      .post('/api/v1/auth/register')
      .send({
        email: 'profile-first@example.com',
        nickname: '첫프로필',
        password: 'password123',
        termsAgreed: true,
      })
      .expect(201);
    await second
      .post('/api/v1/auth/register')
      .send({
        email: 'profile-second@example.com',
        nickname: '둘째프로필',
        password: 'password123',
        termsAgreed: true,
      })
      .expect(201);

    const conflict = await first
      .patch('/api/v1/users/me')
      .send({ nickname: ' 둘째프로필 ' })
      .expect(409);
    expect(asRecord(conflict.body as unknown).code).toBe(
      'NICKNAME_ALREADY_EXISTS',
    );

    const missing = await first
      .get('/api/v1/users/missing-user/public')
      .expect(404);
    expect(asRecord(missing.body as unknown).code).toBe('USER_NOT_FOUND');
  });

  it('accepts a 300-character bio and rejects a longer one', async () => {
    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/register')
      .send({
        email: 'bio-limit@example.com',
        nickname: '소개길이검증',
        password: 'password123',
        termsAgreed: true,
      })
      .expect(201);

    await agent
      .patch('/api/v1/users/me')
      .send({ bio: '가'.repeat(300) })
      .expect(200);

    const tooLong = await agent
      .patch('/api/v1/users/me')
      .send({ bio: '가'.repeat(301) })
      .expect(400);
    expect(asRecord(tooLong.body as unknown).code).toBe('VALIDATION_FAILED');
  });
});
