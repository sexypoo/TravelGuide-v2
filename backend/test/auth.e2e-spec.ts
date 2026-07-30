import {
  Controller,
  Get,
  type INestApplication,
  UseGuards,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AdminGuard } from '../src/auth/guards/admin.guard';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

@Controller('test/admin')
@UseGuards(JwtAuthGuard, AdminGuard)
class TestAdminController {
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected an object response');
  }

  return value as Record<string, unknown>;
}

describe('Authentication', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestAdminController],
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

  it('registers, reads the session, logs out, and logs in again', async () => {
    const agent = request.agent(server);
    const registration = await agent
      .post('/api/v1/auth/register')
      .send({
        email: '  Traveler@Example.COM ',
        nickname: ' 제주여행자 ',
        password: 'travelpass123',
        termsAgreed: true,
      })
      .expect('set-cookie', /tg_access=/)
      .expect('set-cookie', /HttpOnly/)
      .expect('set-cookie', /SameSite=Lax/)
      .expect(201);

    const registrationBody: unknown = registration.body;
    expect(asRecord(registrationBody)).toMatchObject({
      email: 'traveler@example.com',
      nickname: '제주여행자',
      role: 'USER',
      isAdmin: false,
      verificationSummary: { traveler: null, local: null },
    });
    expect(JSON.stringify(registrationBody)).not.toContain('passwordHash');
    expect(JSON.stringify(registrationBody)).not.toContain('token');
    expect(registration.get('x-request-id')).toMatch(/^req_/);

    const storedUser = await prisma.user.findUniqueOrThrow({
      where: { email: 'traveler@example.com' },
    });
    expect(storedUser.passwordHash).not.toBe('travelpass123');
    expect(storedUser.passwordHash).toMatch(/^\$2[aby]\$12\$/);
    await expect(
      bcrypt.compare('travelpass123', storedUser.passwordHash),
    ).resolves.toBe(true);

    const me = await agent.get('/api/v1/auth/me').expect(200);
    const meBody: unknown = me.body;
    expect(asRecord(meBody)).toMatchObject({
      id: storedUser.id,
      email: 'traveler@example.com',
    });
    expect(JSON.stringify(meBody)).not.toContain('passwordHash');

    await agent
      .post('/api/v1/auth/logout')
      .expect('set-cookie', /tg_access=;/)
      .expect(204);

    const unauthorized = await agent.get('/api/v1/auth/me').expect(401);
    const unauthorizedBody = asRecord(unauthorized.body as unknown);
    expect(unauthorizedBody.code).toBe('AUTHENTICATION_REQUIRED');
    expect(unauthorizedBody.requestId).toBe(unauthorized.get('x-request-id'));

    await agent
      .post('/api/v1/auth/login')
      .send({
        email: 'TRAVELER@example.com',
        password: 'travelpass123',
      })
      .expect('set-cookie', /tg_access=/)
      .expect(200);
    await agent.get('/api/v1/auth/me').expect(200);
  });

  it('returns stable duplicate email and nickname conflicts', async () => {
    await request(server)
      .post('/api/v1/auth/register')
      .send({
        email: 'first@example.com',
        nickname: '첫번째사용자',
        password: 'password123',
        termsAgreed: true,
      })
      .expect(201);

    const emailConflict = await request(server)
      .post('/api/v1/auth/register')
      .send({
        email: ' FIRST@example.com ',
        nickname: '다른닉네임',
        password: 'password123',
        termsAgreed: true,
      })
      .expect(409);
    expect(asRecord(emailConflict.body as unknown).code).toBe(
      'EMAIL_ALREADY_EXISTS',
    );

    const nicknameConflict = await request(server)
      .post('/api/v1/auth/register')
      .send({
        email: 'second@example.com',
        nickname: ' 첫번째사용자 ',
        password: 'password123',
        termsAgreed: true,
      })
      .expect(409);
    expect(asRecord(nicknameConflict.body as unknown).code).toBe(
      'NICKNAME_ALREADY_EXISTS',
    );
  });

  it('maps a concurrent duplicate-email race to one stable conflict', async () => {
    const [first, second] = await Promise.all([
      request(server).post('/api/v1/auth/register').send({
        email: 'race@example.com',
        nickname: '동시사용자A',
        password: 'password123',
        termsAgreed: true,
      }),
      request(server).post('/api/v1/auth/register').send({
        email: 'RACE@example.com',
        nickname: '동시사용자B',
        password: 'password123',
        termsAgreed: true,
      }),
    ]);

    expect([first.status, second.status].sort()).toEqual([201, 409]);
    const conflict = first.status === 409 ? first : second;
    expect(asRecord(conflict.body as unknown).code).toBe(
      'EMAIL_ALREADY_EXISTS',
    );
  });

  it('returns request-correlated validation problems', async () => {
    const response = await request(server)
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid',
        nickname: ' ',
        password: 'short',
        termsAgreed: false,
      })
      .expect(400);
    const body = asRecord(response.body as unknown);

    expect(body).toMatchObject({
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      code: 'VALIDATION_FAILED',
    });
    expect(body.requestId).toBe(response.get('x-request-id'));
  });

  it('denies USER and allows current ADMIN role through AdminGuard', async () => {
    const userAgent = request.agent(server);
    await userAgent
      .post('/api/v1/auth/register')
      .send({
        email: 'user@example.com',
        nickname: '일반사용자',
        password: 'password123',
        termsAgreed: true,
      })
      .expect(201);

    const forbidden = await userAgent.get('/api/v1/test/admin').expect(403);
    expect(asRecord(forbidden.body as unknown).code).toBe('ADMIN_REQUIRED');

    const passwordHash = await bcrypt.hash('adminpass123', 12);
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        nickname: '관리자계정',
        passwordHash,
        role: UserRole.ADMIN,
      },
    });
    const adminAgent = request.agent(server);
    await adminAgent
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'adminpass123' })
      .expect(200);
    await adminAgent.get('/api/v1/test/admin').expect(200);
  });
});
