import { type INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserRole, VerificationStatus, VerificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Server } from 'node:net';
import { io, type Socket as ClientSocket } from 'socket.io-client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AUTH_COOKIE_NAME } from '../src/auth/auth-cookie';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';
import type {
  ClientToServerEvents,
  ContentRemovedPayload,
  RealtimeEnvelope,
  RoomMembershipResult,
  ServerToClientEvents,
} from '../src/realtime/realtime.types';
import type { QuestionResponse } from '../src/questions/dto/question.response';

type Agent = ReturnType<typeof request.agent>;
type RealtimeClient = ClientSocket<ServerToClientEvents, ClientToServerEvents>;

interface TestUser {
  id: string;
  agent: Agent;
  cookie: string;
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected object');
  }
  return value as Record<string, unknown>;
}

function records(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw new Error('Expected array');
  return value.map(record);
}

describe('T08 resolution, reports, and moderation', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let jwt: JwtService;
  let destinationId: string;
  let baseUrl: string;
  const sockets: RealtimeClient[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.listen(0, '127.0.0.1');
    server = app.getHttpServer() as Server;
    const address = server.address();
    if (address === null || typeof address === 'string') {
      throw new Error('Expected TCP address');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
    prisma = app.get(PrismaService);
    jwt = app.get(JwtService);
    destinationId = (
      await prisma.destination.findUniqueOrThrow({ where: { slug: 'jeju' } })
    ).id;
  });

  beforeEach(async () => {
    await prisma.report.deleteMany();
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(() => {
    for (const socket of sockets.splice(0)) socket.close();
  });

  afterAll(async () => {
    await prisma.report.deleteMany();
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  async function createUser(
    name: string,
    role: UserRole = UserRole.USER,
  ): Promise<TestUser> {
    const password = 'password123';
    const user = await prisma.user.create({
      data: {
        email: `t08-${name}@example.com`,
        nickname: `T08-${name.slice(0, 16)}`,
        passwordHash: await bcrypt.hash(password, 12),
        role,
      },
    });
    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/login')
      .send({ email: user.email, password })
      .expect(200);
    const secret = process.env.JWT_SECRET;
    if (secret === undefined) throw new Error('JWT_SECRET is required');
    const token = await jwt.signAsync(
      { sub: user.id, role, sessionVersion: user.sessionVersion },
      { secret, expiresIn: 3600 },
    );
    return { id: user.id, agent, cookie: `${AUTH_COOKIE_NAME}=${token}` };
  }

  async function approve(
    userId: string,
    type: VerificationType,
  ): Promise<void> {
    const now = Date.now();
    await prisma.verification.create({
      data: {
        userId,
        destinationId,
        type,
        status: VerificationStatus.APPROVED,
        startsAt:
          type === VerificationType.TRAVELER
            ? new Date(now - 60 * 60 * 1000)
            : null,
        endsAt:
          type === VerificationType.TRAVELER
            ? new Date(now + 4 * 60 * 60 * 1000)
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

  async function createTopic(
    owner: TestUser,
    content: string,
  ): Promise<string> {
    const response = await owner.agent
      .post('/api/v1/rooms/jeju/questions')
      .send({ category: 'TRANSPORT', urgency: 'NORMAL', content })
      .expect(201);
    return String(record(response.body as unknown).id);
  }

  async function createAnswer(
    local: TestUser,
    questionId: string,
    content: string,
  ): Promise<string> {
    const response = await local.agent
      .post(`/api/v1/questions/${questionId}/answers`)
      .send({ sourceType: 'ON_SITE_NOW', content })
      .expect(201);
    return String(record(response.body as unknown).id);
  }

  async function connect(user: TestUser): Promise<RealtimeClient> {
    const socket: RealtimeClient = io(baseUrl, {
      transports: ['websocket'],
      extraHeaders: { Cookie: user.cookie },
      forceNew: true,
      reconnection: false,
    });
    sockets.push(socket);
    await new Promise<void>((resolve, reject) => {
      socket.once('connect', resolve);
      socket.once('connect_error', reject);
    });
    return socket;
  }

  async function join(socket: RealtimeClient): Promise<RoomMembershipResult> {
    return new Promise((resolve) => {
      socket.emit('room.join', { roomSlug: 'jeju' }, resolve);
    });
  }

  it('accepts one same-topic answer transactionally and rejects later answers', async () => {
    const owner = await createUser('owner');
    const other = await createUser('other');
    const localA = await createUser('local-a');
    const localB = await createUser('local-b');
    await approve(owner.id, VerificationType.TRAVELER);
    await approve(other.id, VerificationType.TRAVELER);
    await approve(localA.id, VerificationType.LOCAL);
    await approve(localB.id, VerificationType.LOCAL);
    const questionId = await createTopic(
      owner,
      '공항에서 서귀포로 이동할 때 지금 가장 빠른 교통편이 궁금합니다.',
    );
    const answerA = await createAnswer(
      localA,
      questionId,
      '현재 공항 리무진 승차장은 대기 줄이 짧아 바로 탑승할 수 있습니다.',
    );
    const otherQuestion = await createTopic(
      other,
      '성산 방향 도로 상황과 우회할 수 있는 길을 알려주실 수 있나요?',
    );
    const mismatched = await createAnswer(
      localA,
      otherQuestion,
      '현재 성산 방향은 통행이 원활하고 별도 우회는 필요하지 않습니다.',
    );

    const denied = await other.agent
      .patch(`/api/v1/questions/${questionId}/accept-answer`)
      .send({ answerId: answerA })
      .expect(403);
    expect(record(denied.body as unknown).code).toBe('NOT_QUESTION_OWNER');
    const mismatch = await owner.agent
      .patch(`/api/v1/questions/${questionId}/accept-answer`)
      .send({ answerId: mismatched })
      .expect(400);
    expect(record(mismatch.body as unknown).code).toBe('ANSWER_NOT_AVAILABLE');

    const socket = await connect(owner);
    expect(await join(socket)).toEqual({ ok: true, roomSlug: 'jeju' });
    const eventPromise = new Promise<RealtimeEnvelope<QuestionResponse>>(
      (resolve) => socket.once('room.question.updated', resolve),
    );
    const accepted = await owner.agent
      .patch(`/api/v1/questions/${questionId}/accept-answer`)
      .send({ answerId: answerA })
      .expect(200);
    expect(accepted.body).toMatchObject({
      id: questionId,
      status: 'RESOLVED',
      acceptedAnswerId: answerA,
    });
    expect(record((await eventPromise).payload as unknown)).toMatchObject({
      id: questionId,
      status: 'RESOLVED',
      acceptedAnswerId: answerA,
    });
    const rejected = await localB.agent
      .post(`/api/v1/questions/${questionId}/answers`)
      .send({
        sourceType: 'ON_SITE_NOW',
        content: '해결 이후에는 추가 답변이 저장되면 안 됩니다.',
      })
      .expect(409);
    expect(record(rejected.body as unknown).code).toBe('QUESTION_NOT_OPEN');
  });

  async function answerIsWaitingOnLock(): Promise<boolean> {
    const rows = await prisma.$queryRaw<{ waiting: bigint }[]>`
      SELECT count(*) AS waiting
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid <> pg_backend_pid()
        AND wait_event_type = 'Lock'
        AND query ILIKE '%FOR SHARE%'`;
    return (rows[0]?.waiting ?? BigInt(0)) > BigInt(0);
  }

  it('rejects an answer that commits after a concurrent resolve (#62)', async () => {
    const owner = await createUser('race-owner');
    const local = await createUser('race-local');
    await approve(owner.id, VerificationType.TRAVELER);
    await approve(local.id, VerificationType.LOCAL);
    const questionId = await createTopic(
      owner,
      '해결 처리와 동시에 도착한 답변이 저장되지 않는지 확인하는 토픽입니다.',
    );

    let markUpdated: () => void = () => undefined;
    const updated = new Promise<void>((resolve) => {
      markUpdated = resolve;
    });
    let commitResolve: () => void = () => undefined;
    const commitGate = new Promise<void>((resolve) => {
      commitResolve = resolve;
    });
    const resolving = prisma.$transaction(
      async (transaction) => {
        await transaction.question.update({
          where: { id: questionId },
          data: { status: 'RESOLVED', resolvedAt: new Date() },
        });
        markUpdated();
        await commitGate;
      },
      { timeout: 20_000 },
    );

    try {
      await updated;
      let settled = false;
      const answering = Promise.resolve(
        local.agent.post(`/api/v1/questions/${questionId}/answers`).send({
          sourceType: 'ON_SITE_NOW',
          content: '해결 처리 중에 보낸 답변은 저장되면 안 됩니다.',
        }),
      ).finally(() => {
        settled = true;
      });

      const deadline = Date.now() + 10_000;
      let waiting = false;
      while (!settled && !waiting && Date.now() < deadline) {
        waiting = await answerIsWaitingOnLock();
        if (!waiting) {
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
      }
      expect({ waiting, settled }).toEqual({ waiting: true, settled: false });

      commitResolve();
      await resolving;
      const response = await answering;
      expect(response.status).toBe(409);
      expect(record(response.body as unknown).code).toBe('QUESTION_NOT_OPEN');
      expect(await prisma.answer.count({ where: { questionId } })).toBe(0);
    } finally {
      commitResolve();
      await resolving.catch(() => undefined);
    }
  });

  it('lets different locals answer the same open topic concurrently', async () => {
    const owner = await createUser('parallel-owner');
    const localA = await createUser('parallel-a');
    const localB = await createUser('parallel-b');
    await approve(owner.id, VerificationType.TRAVELER);
    await approve(localA.id, VerificationType.LOCAL);
    await approve(localB.id, VerificationType.LOCAL);
    const questionId = await createTopic(
      owner,
      '여러 현지인이 동시에 답변해도 모두 저장되는지 확인하는 토픽입니다.',
    );

    const responses = await Promise.all(
      [localA, localB].map((local) =>
        Promise.resolve(
          local.agent.post(`/api/v1/questions/${questionId}/answers`).send({
            sourceType: 'ON_SITE_NOW',
            content: '지금 현장에서 직접 확인한 상황을 알려드립니다.',
          }),
        ),
      ),
    );
    expect(responses.map((response) => response.status)).toEqual([201, 201]);
    expect(await prisma.answer.count({ where: { questionId } })).toBe(2);
  });

  it('resolves an owned topic without accepting an answer', async () => {
    const owner = await createUser('resolve-owner');
    await approve(owner.id, VerificationType.TRAVELER);
    const questionId = await createTopic(
      owner,
      '직접 확인하여 해결된 교통 상황을 답변 채택 없이 종료하려고 합니다.',
    );
    const response = await owner.agent
      .patch(`/api/v1/questions/${questionId}/resolve`)
      .send({})
      .expect(200);
    expect(response.body).toMatchObject({
      status: 'RESOLVED',
      acceptedAnswerId: null,
    });
    expect(record(response.body as unknown).resolvedAt).not.toBeNull();
  });

  it('validates self, other-detail, and duplicate reports', async () => {
    const owner = await createUser('report-owner');
    const reporter = await createUser('reporter');
    await approve(owner.id, VerificationType.TRAVELER);
    const questionId = await createTopic(
      owner,
      '신고 검증을 위해 작성한 충분히 긴 제주 교통 상황 토픽입니다.',
    );
    const own = await owner.agent
      .post('/api/v1/reports')
      .send({
        targetType: 'QUESTION',
        targetId: questionId,
        reason: 'SPAM',
      })
      .expect(400);
    expect(record(own.body as unknown).code).toBe('CANNOT_REPORT_OWN_CONTENT');
    const shortOther = await reporter.agent
      .post('/api/v1/reports')
      .send({
        targetType: 'QUESTION',
        targetId: questionId,
        reason: 'OTHER',
        detail: '짧음',
      })
      .expect(400);
    expect(record(shortOther.body as unknown).code).toBe(
      'REPORT_DETAIL_REQUIRED',
    );
    await reporter.agent
      .post('/api/v1/reports')
      .send({
        targetType: 'QUESTION',
        targetId: questionId,
        reason: 'FALSE_INFORMATION',
        detail: '현장 정보와 내용이 다릅니다.',
      })
      .expect(201);
    const duplicate = await reporter.agent
      .post('/api/v1/reports')
      .send({
        targetType: 'QUESTION',
        targetId: questionId,
        reason: 'SAFETY',
      })
      .expect(409);
    expect(record(duplicate.body as unknown).code).toBe(
      'REPORT_ALREADY_EXISTS',
    );
  });

  it('guards admin reports and redacts a soft-deleted answer after audit', async () => {
    const owner = await createUser('moderation-owner');
    const local = await createUser('moderation-local');
    const reporter = await createUser('moderation-reporter');
    const admin = await createUser('moderation-admin', UserRole.ADMIN);
    await approve(owner.id, VerificationType.TRAVELER);
    await approve(local.id, VerificationType.LOCAL);
    const questionId = await createTopic(
      owner,
      '관리자 신고 처리와 답변 숨김을 확인하기 위한 제주 토픽입니다.',
    );
    const original =
      '공개 응답에서 반드시 사라져야 하는 잘못된 현장 정보입니다.';
    const answerId = await createAnswer(local, questionId, original);
    const created = await reporter.agent
      .post('/api/v1/reports')
      .send({
        targetType: 'ANSWER',
        targetId: answerId,
        reason: 'FALSE_INFORMATION',
        detail: '현장 상황과 반대되는 내용입니다.',
      })
      .expect(201);
    const reportId = String(record(created.body as unknown).id);
    const forbidden = await reporter.agent
      .get('/api/v1/admin/reports')
      .expect(403);
    expect(record(forbidden.body as unknown).code).toBe('ADMIN_REQUIRED');
    const list = await admin.agent
      .get('/api/v1/admin/reports?status=PENDING&targetType=ANSWER')
      .expect(200);
    const reportList = records(list.body as unknown);
    expect(reportList).toHaveLength(1);
    expect(reportList[0]).toMatchObject({
      id: reportId,
      target: { content: original, removed: false },
    });

    const socket = await connect(owner);
    expect(await join(socket)).toEqual({ ok: true, roomSlug: 'jeju' });
    const eventPromise = new Promise<RealtimeEnvelope<ContentRemovedPayload>>(
      (resolve) => socket.once('room.content.removed', resolve),
    );
    const review = await admin.agent
      .patch(`/api/v1/admin/reports/${reportId}/review`)
      .send({
        decision: 'REMOVE',
        note: '현장 정보와 공식 안내를 확인하여 숨김 처리했습니다.',
      })
      .expect(200);
    expect(review.body).toMatchObject({
      status: 'RESOLVED',
      reviewedBy: { id: admin.id },
      target: { removed: true },
    });
    expect(record(review.body as unknown).reviewedAt).not.toBeNull();
    expect((await eventPromise).payload).toEqual({
      targetType: 'ANSWER',
      targetId: answerId,
      questionId,
    });

    const detail = await owner.agent
      .get(`/api/v1/questions/${questionId}`)
      .expect(200);
    const serialized = JSON.stringify(detail.body);
    expect(serialized).not.toContain(original);
    expect(serialized).toContain('운영 정책에 따라 숨김 처리된 답변입니다.');
    const detailBody = record(detail.body as unknown);
    const answers = records(detailBody.answers);
    expect(answers[0]).toMatchObject({
      removed: true,
      sourceUrl: null,
    });
    const repeated = await admin.agent
      .patch(`/api/v1/admin/reports/${reportId}/review`)
      .send({ decision: 'KEEP' })
      .expect(409);
    expect(record(repeated.body as unknown).code).toBe(
      'REPORT_ALREADY_REVIEWED',
    );

    const questionOriginal =
      '공개 응답에서 반드시 사라져야 하는 두 번째 신고 대상 토픽 원문입니다.';
    const removableQuestionId = await createTopic(owner, questionOriginal);
    const questionReport = await reporter.agent
      .post('/api/v1/reports')
      .send({
        targetType: 'QUESTION',
        targetId: removableQuestionId,
        reason: 'PRIVACY',
        detail: '공개되면 안 되는 개인 정보가 포함되어 있습니다.',
      })
      .expect(201);
    const questionReportId = String(record(questionReport.body as unknown).id);
    await admin.agent
      .patch(`/api/v1/admin/reports/${questionReportId}/review`)
      .send({
        decision: 'REMOVE',
        note: '개인정보 노출 가능성을 확인했습니다.',
      })
      .expect(200);
    const removedQuestion = await owner.agent
      .get(`/api/v1/questions/${removableQuestionId}`)
      .expect(200);
    expect(removedQuestion.body).toMatchObject({
      status: 'REMOVED',
      content: '운영 정책에 따라 숨김 처리된 질문입니다.',
      areaText: null,
    });
    expect(JSON.stringify(removedQuestion.body)).not.toContain(
      questionOriginal,
    );
  });
});
