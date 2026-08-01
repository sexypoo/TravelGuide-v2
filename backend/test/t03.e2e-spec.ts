import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Server } from 'node:http';
import request, { type Test as SupertestRequest } from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const pdf = Buffer.from('%PDF-1.4\nproof');
type TestAgent = ReturnType<typeof request.agent>;

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected object');
  }
  return value as Record<string, unknown>;
}

function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected array');
  }
  return value;
}

describe('T03 verification and private storage', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let destinationId: string;
  let adminId: string;
  let admin: TestAgent;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
    destinationId = (
      await prisma.destination.findUniqueOrThrow({ where: { slug: 'jeju' } })
    ).id;
  });

  beforeEach(async () => {
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
    const passwordHash = await bcrypt.hash('adminpass123', 12);
    adminId = (
      await prisma.user.create({
        data: {
          email: 'verification-admin@example.com',
          nickname: '인증관리자',
          passwordHash,
          role: UserRole.ADMIN,
        },
      })
    ).id;
    admin = request.agent(server);
    await admin
      .post('/api/v1/auth/login')
      .send({
        email: 'verification-admin@example.com',
        password: 'adminpass123',
      })
      .expect(200);
  });

  afterAll(async () => {
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  async function registered(
    email: string,
    nickname: string,
  ): Promise<TestAgent> {
    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/register')
      .send({ email, nickname, password: 'password123', termsAgreed: true })
      .expect(201);
    return agent;
  }

  function travelerRequest(agent: TestAgent): SupertestRequest {
    const now = Date.now();
    return agent
      .post('/api/v1/verifications/traveler')
      .field('destinationId', destinationId)
      .field('startsAt', new Date(now - 60 * 60 * 1000).toISOString())
      .field('endsAt', new Date(now + 24 * 60 * 60 * 1000).toISOString())
      .field('note', '제주 여행 항공권입니다.')
      .attach('proofFile', jpeg, {
        filename: '../../ticket.jpg',
        contentType: 'image/jpeg',
      });
  }

  function localRequest(
    agent: TestAgent,
    accuracyMeters = 100,
  ): SupertestRequest {
    return agent
      .post('/api/v1/verifications/local')
      .field('destinationId', destinationId)
      .field('latitude', '33.3617')
      .field('longitude', '126.5292')
      .field('accuracyMeters', String(accuracyMeters))
      .field('capturedAt', new Date().toISOString())
      .field('localProofType', 'RESIDENCE')
      .field(
        'note',
        '제주에 거주하고 있으며 지역 생활 정보를 안내할 수 있습니다.',
      )
      .attach('proofFile', pdf, {
        filename: 'residence.pdf',
        contentType: 'application/pdf',
      });
  }

  it('submits a traveler proof, keeps it private, and grants access after approval', async () => {
    const user = await registered('traveler@example.com', '여행신청자');
    const created = await travelerRequest(user).expect(201);
    const createdBody = record(created.body as unknown);
    expect(createdBody).toMatchObject({ type: 'TRAVELER', status: 'PENDING' });
    expect(JSON.stringify(createdBody)).not.toContain('proofObjectKey');

    const verificationId = String(createdBody.id);
    const stored = await prisma.verification.findUniqueOrThrow({
      where: { id: verificationId },
    });
    expect(stored.proofObjectKey).toMatch(
      /^verification\/[A-Za-z0-9_-]+\/[0-9a-f-]{36}$/,
    );
    expect(stored.proofObjectKey).not.toContain('ticket');

    const pendingList = await admin
      .get('/api/v1/admin/verifications')
      .query({
        status: 'PENDING',
        type: 'TRAVELER',
        destinationId,
      })
      .expect(200);
    expect(array(pendingList.body as unknown)).toHaveLength(1);
    const detail = await admin
      .get(`/api/v1/admin/verifications/${verificationId}`)
      .expect(200);
    expect(JSON.stringify(detail.body)).not.toContain(stored.proofObjectKey);
    expect(JSON.stringify(detail.body)).not.toContain('gpsLat');

    const mine = await user.get('/api/v1/verifications/me').expect(200);
    expect(array(mine.body as unknown)).toHaveLength(1);
    expect(JSON.stringify(mine.body)).not.toContain(stored.proofObjectKey);
    await user
      .get(`/api/v1/admin/verifications/${verificationId}/evidence`)
      .expect(403);
    const evidence = await admin
      .get(`/api/v1/admin/verifications/${verificationId}/evidence`)
      .expect(200)
      .expect('Content-Type', 'image/jpeg')
      .expect('Cache-Control', 'private, no-store')
      .expect('X-Content-Type-Options', 'nosniff');
    expect(evidence.headers['content-disposition']).toContain('inline;');

    const reviewed = await admin
      .patch(`/api/v1/admin/verifications/${verificationId}/review`)
      .send({ decision: 'APPROVE', reason: null })
      .expect(200);
    expect(record(reviewed.body as unknown)).toMatchObject({
      status: 'APPROVED',
      reviewedById: adminId,
    });
    expect(record(reviewed.body as unknown).reviewedAt).not.toBeNull();
    await user.get('/api/v1/rooms/jeju/content-access').expect(204);
  });

  it('rejects oversize, executable, and MIME-spoofed traveler evidence', async () => {
    const user = await registered('invalid-file@example.com', '파일검증자');
    const now = Date.now();
    const base = (): SupertestRequest =>
      user
        .post('/api/v1/verifications/traveler')
        .field('destinationId', destinationId)
        .field('startsAt', new Date(now).toISOString())
        .field('endsAt', new Date(now + 24 * 60 * 60 * 1000).toISOString());

    const tooLarge = await base()
      .attach('proofFile', Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: 'large.jpg',
        contentType: 'image/jpeg',
      })
      .expect(400);
    expect(record(tooLarge.body as unknown).code).toBe('UPLOAD_TOO_LARGE');

    const executable = await base()
      .attach('proofFile', Buffer.from('MZ executable'), {
        filename: 'bad.exe',
        contentType: 'application/octet-stream',
      })
      .expect(400);
    expect(record(executable.body as unknown).code).toBe(
      'UPLOAD_TYPE_NOT_ALLOWED',
    );

    const spoofed = await base()
      .attach('proofFile', Buffer.from('MZ executable'), {
        filename: 'fake.jpg',
        contentType: 'image/jpeg',
      })
      .expect(400);
    expect(record(spoofed.body as unknown).code).toBe(
      'UPLOAD_TYPE_NOT_ALLOWED',
    );
    expect(await prisma.verification.count()).toBe(0);
  });

  it('validates local GPS, approves for 90 days, and exposes no exact GPS', async () => {
    const user = await registered('local@example.com', '현지신청자');
    const inaccurate = await localRequest(user, 300).expect(400);
    expect(record(inaccurate.body as unknown).code).toBe(
      'GPS_ACCURACY_TOO_LOW',
    );

    const outside = await user
      .post('/api/v1/verifications/local')
      .field('destinationId', destinationId)
      .field('latitude', '37.5665')
      .field('longitude', '126.9780')
      .field('accuracyMeters', '100')
      .field('capturedAt', new Date().toISOString())
      .field('localProofType', 'WORK')
      .field('note', '제주 지역에서 근무하며 지역 정보를 충분히 알고 있습니다.')
      .attach('proofFile', pdf, {
        filename: 'work.pdf',
        contentType: 'application/pdf',
      })
      .expect(400);
    expect(record(outside.body as unknown).code).toBe(
      'OUTSIDE_DESTINATION_AREA',
    );

    const created = await localRequest(user).expect(201);
    const id = String(record(created.body as unknown).id);
    expect(JSON.stringify(created.body)).not.toContain('33.3617');
    const beforeReview = Date.now();
    const approved = await admin
      .patch(`/api/v1/admin/verifications/${id}/review`)
      .send({ decision: 'APPROVE' })
      .expect(200);
    const approvedBody = record(approved.body as unknown);
    const expiresAt = new Date(String(approvedBody.expiresAt)).getTime();
    expect(expiresAt - beforeReview).toBeGreaterThanOrEqual(
      90 * 24 * 60 * 60 * 1000 - 1000,
    );
    expect(expiresAt - beforeReview).toBeLessThanOrEqual(
      90 * 24 * 60 * 60 * 1000 + 1000,
    );
    const room = await user.get('/api/v1/rooms/jeju').expect(200);
    expect(record(record(room.body as unknown).access).canAnswer).toBe(true);
  });

  it('requires a rejection reason, allows resubmission, and permits only one racing review', async () => {
    const rejectedUser = await registered('rejected@example.com', '반려신청자');
    const first = await travelerRequest(rejectedUser).expect(201);
    const firstId = String(record(first.body as unknown).id);
    await admin
      .patch(`/api/v1/admin/verifications/${firstId}/review`)
      .send({ decision: 'REJECT' })
      .expect(400);
    await admin
      .patch(`/api/v1/admin/verifications/${firstId}/review`)
      .send({
        decision: 'REJECT',
        reason: '제출 문서에서 여행 기간을 확인할 수 없습니다.',
      })
      .expect(200);
    const mine = await rejectedUser.get('/api/v1/verifications/me').expect(200);
    expect(record(array(mine.body as unknown)[0]).rejectionReason).toBe(
      '제출 문서에서 여행 기간을 확인할 수 없습니다.',
    );
    await travelerRequest(rejectedUser).expect(201);

    const racingUser = await registered('race@example.com', '경쟁신청자');
    const racing = await localRequest(racingUser).expect(201);
    const racingId = String(record(racing.body as unknown).id);
    const [approve, reject] = await Promise.all([
      admin
        .patch(`/api/v1/admin/verifications/${racingId}/review`)
        .send({ decision: 'APPROVE' }),
      admin.patch(`/api/v1/admin/verifications/${racingId}/review`).send({
        decision: 'REJECT',
        reason: '증빙 자료의 주소를 명확히 확인할 수 없습니다.',
      }),
    ]);
    expect([approve.status, reject.status].sort()).toEqual([200, 409]);
    const conflict = approve.status === 409 ? approve : reject;
    expect(record(conflict.body as unknown).code).toBe(
      'VERIFICATION_ALREADY_REVIEWED',
    );
    const final = await prisma.verification.findUniqueOrThrow({
      where: { id: racingId },
    });
    expect(final.reviewedById).toBe(adminId);
    expect(final.reviewedAt).not.toBeNull();
  });
});
