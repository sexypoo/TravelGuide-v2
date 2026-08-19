import {
  Controller,
  Get,
  type INestApplication,
  UseGuards,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthProvider, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AdminGuard } from '../src/auth/guards/admin.guard';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersService } from '../src/users/users.service';

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
  let users: UsersService;

  beforeAll(async () => {
    process.env.RESEND_API_KEY = 're_integration_test';
    process.env.EMAIL_FROM = '여쭈어 <no-reply@travelguide.test>';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestAdminController],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
    users = app.get(UsersService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
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
    if (storedUser.passwordHash === null) {
      throw new Error('registered password hash must be present');
    }
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

  it('resets a password once without exposing account existence', async () => {
    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/register')
      .send({
        email: 'recovery@example.com',
        nickname: '복구사용자',
        password: 'oldpassword123',
        termsAgreed: true,
      })
      .expect(201);

    const emailRequest = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'email-1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await request(server)
      .post('/api/v1/auth/password/forgot')
      .send({ email: ' recovery@example.com ' })
      .expect(204);
    await request(server)
      .post('/api/v1/auth/password/forgot')
      .send({ email: 'missing@example.com' })
      .expect(204);
    expect(emailRequest).toHaveBeenCalledTimes(1);

    const options = emailRequest.mock.calls[0]?.[1];
    if (typeof options?.body !== 'string') {
      throw new Error('expected Resend request body');
    }
    const body = asRecord(JSON.parse(options.body) as unknown);
    if (typeof body.text !== 'string') {
      throw new Error('expected reset email text');
    }
    const token = /[?&]token=([A-Za-z0-9_-]{43})/u.exec(body.text)?.[1];
    if (token === undefined) throw new Error('expected reset token in email');
    emailRequest.mockRestore();

    await request(server)
      .post('/api/v1/auth/password/reset')
      .send({ token, password: 'newpassword456' })
      .expect(204);

    await agent.get('/api/v1/auth/me').expect(401);
    await request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'recovery@example.com', password: 'newpassword456' })
      .expect(200);

    const reused = await request(server)
      .post('/api/v1/auth/password/reset')
      .send({ token, password: 'anotherpass789' })
      .expect(400);
    expect(asRecord(reused.body as unknown).code).toBe(
      'PASSWORD_RESET_TOKEN_INVALID',
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

  it('links a verified social identity and requires register intent for new users', async () => {
    const registered = await users.create({
      email: 'linked@example.com',
      nickname: '연결사용자',
      passwordHash: await bcrypt.hash('password123', 12),
    });
    const linked = await users.findOrCreateSocialUser({
      provider: AuthProvider.GOOGLE,
      providerUserId: 'google-linked-user',
      email: 'linked@example.com',
      nicknameHint: 'Google User',
      allowCreate: false,
    });
    expect(linked.id).toBe(registered.id);
    expect(
      await prisma.authIdentity.count({ where: { userId: registered.id } }),
    ).toBe(1);

    await expect(
      users.findOrCreateSocialUser({
        provider: AuthProvider.KAKAO,
        providerUserId: 'kakao-new-user',
        email: 'social-new@example.com',
        nicknameHint: '카카오여행자',
        allowCreate: false,
      }),
    ).rejects.toMatchObject({ code: 'SOCIAL_ACCOUNT_NOT_FOUND' });

    const created = await users.findOrCreateSocialUser({
      provider: AuthProvider.KAKAO,
      providerUserId: 'kakao-new-user',
      email: 'social-new@example.com',
      nicknameHint: '카카오여행자',
      allowCreate: true,
    });
    expect(created.passwordHash).toBeNull();
    expect(created.email).toBe('social-new@example.com');
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
