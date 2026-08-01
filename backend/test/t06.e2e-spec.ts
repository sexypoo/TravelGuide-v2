import { type INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import {
  AnswerSourceType,
  QuestionCategory,
  QuestionStatus,
  QuestionUrgency,
  VerificationStatus,
  VerificationType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Server } from 'node:net';
import request from 'supertest';
import { io, type Socket as ClientSocket } from 'socket.io-client';
import type { AnswerResponse } from '../src/answers/dto/answer.response';
import { AppModule } from '../src/app.module';
import { AUTH_COOKIE_NAME } from '../src/auth/auth-cookie';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';
import { RealtimePublisher } from '../src/realtime/realtime.publisher';
import type {
  ClientToServerEvents,
  RealtimeEnvelope,
  RoomMembershipResult,
  ServerToClientEvents,
} from '../src/realtime/realtime.types';

type TestAgent = ReturnType<typeof request.agent>;
type RealtimeClient = ClientSocket<ServerToClientEvents, ClientToServerEvents>;

interface TestUser {
  id: string;
  agent: TestAgent;
  cookie: string;
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected object');
  }
  return value as Record<string, unknown>;
}

function records(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected array');
  }
  return value.map(record);
}

describe('T06 answers and realtime', () => {
  let app: INestApplication;
  let server: Server;
  let baseUrl: string;
  let prisma: PrismaService;
  let jwt: JwtService;
  let publisher: RealtimePublisher;
  let destinationId: string;
  let roomId: string;
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
      throw new Error('Expected TCP server address');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
    prisma = app.get(PrismaService);
    jwt = app.get(JwtService);
    publisher = app.get(RealtimePublisher);
    const room = await prisma.destinationRoom.findUniqueOrThrow({
      where: { slug: 'jeju' },
    });
    destinationId = room.destinationId;
    roomId = room.id;
  });

  beforeEach(async () => {
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(() => {
    for (const socket of sockets.splice(0)) {
      socket.close();
    }
  });

  afterAll(async () => {
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  async function createUser(name: string): Promise<TestUser> {
    const email = `t06-${name}@example.com`;
    const password = 'password123';
    const user = await prisma.user.create({
      data: {
        email,
        nickname: `T06-${name}`,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);
    const secret = process.env.JWT_SECRET;
    if (secret === undefined) {
      throw new Error('JWT_SECRET is required');
    }
    const token = await jwt.signAsync(
      { sub: user.id, role: user.role },
      { expiresIn: 3600, secret },
    );
    return { id: user.id, agent, cookie: `${AUTH_COOKIE_NAME}=${token}` };
  }

  async function approve(
    userId: string,
    type: VerificationType,
    options: { expired?: boolean } = {},
  ): Promise<Date> {
    const now = Date.now();
    const reviewedAt = new Date(now - 5 * 24 * 60 * 60 * 1000);
    const expired = options.expired === true;
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
            ? new Date(now + 2 * 60 * 60 * 1000)
            : null,
        expiresAt:
          type === VerificationType.LOCAL
            ? new Date(now + (expired ? -1000 : 90 * 24 * 60 * 60 * 1000))
            : null,
        proofObjectKey: `test/${userId}/${type}`,
        proofOriginalName: 'proof.pdf',
        proofMimeType: 'application/pdf',
        proofSizeBytes: 10,
        reviewedAt,
      },
    });
    return reviewedAt;
  }

  async function createQuestion(
    authorId: string,
    options: { expiresAt?: Date; status?: QuestionStatus } = {},
  ): Promise<string> {
    const question = await prisma.question.create({
      data: {
        roomId,
        authorId,
        category: QuestionCategory.PLACE,
        urgency: QuestionUrgency.NORMAL,
        content: '제주에서 지금 방문할 수 있는 실내 장소를 자세히 알려주세요.',
        status: options.status ?? QuestionStatus.OPEN,
        expiresAt:
          options.expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000),
        resolvedAt:
          options.status === QuestionStatus.RESOLVED ? new Date() : null,
      },
    });
    return question.id;
  }

  async function connect(cookie?: string): Promise<RealtimeClient> {
    const socket = io(baseUrl, {
      extraHeaders: cookie === undefined ? undefined : { Cookie: cookie },
      forceNew: true,
      reconnection: false,
      transports: ['websocket'],
    });
    sockets.push(socket);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Socket connection timed out')),
        1500,
      );
      socket.once('connect', () => {
        clearTimeout(timer);
        resolve();
      });
      socket.once('connect_error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
    return socket;
  }

  async function join(socket: RealtimeClient): Promise<RoomMembershipResult> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Room join timed out')),
        1500,
      );
      socket.emit('room.join', { roomSlug: 'jeju' }, (result) => {
        clearTimeout(timer);
        resolve(result);
      });
    });
  }

  function nextQuestionEvent(
    socket: RealtimeClient,
  ): Promise<
    RealtimeEnvelope<
      import('../src/questions/dto/question.response').QuestionResponse
    >
  > {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Question event timed out')),
        1500,
      );
      socket.once('room.question.created', (event) => {
        clearTimeout(timer);
        resolve(event);
      });
    });
  }

  function nextAnswerEvent(
    socket: RealtimeClient,
  ): Promise<RealtimeEnvelope<AnswerResponse>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Answer event timed out')),
        1500,
      );
      socket.once('room.answer.created', (event) => {
        clearTimeout(timer);
        resolve(event);
      });
    });
  }

  const answerInput = {
    content:
      '<script>alert(1)</script> 지금 직접 확인했으며 정상적으로 방문할 수 있습니다.',
    sourceType: AnswerSourceType.ON_SITE_NOW,
    sourceUrl: null,
  };

  it('creates a verified local answer and returns it from REST detail', async () => {
    const traveler = await createUser('traveler');
    const local = await createUser('local');
    await approve(traveler.id, VerificationType.TRAVELER);
    const reviewedAt = await approve(local.id, VerificationType.LOCAL);
    const questionId = await createQuestion(traveler.id);

    const created = await local.agent
      .post(`/api/v1/questions/${questionId}/answers`)
      .send(answerInput)
      .expect(201);
    const body = record(created.body as unknown);
    expect(body).toMatchObject({
      questionId,
      content: answerInput.content,
      contentFormat: 'PLAIN_TEXT',
      sourceType: 'ON_SITE_NOW',
      sourceUrl: null,
      author: {
        id: local.id,
        nickname: 'T06-local',
        badge: 'VERIFIED_LOCAL',
        verifiedAt: reviewedAt.toISOString(),
      },
    });
    expect(JSON.stringify(body)).not.toMatch(/email|role|gps|proof/);
    expect(await prisma.answer.count({ where: { questionId } })).toBe(1);

    const detail = await traveler.agent
      .get(`/api/v1/questions/${questionId}`)
      .expect(200);
    const detailBody = record(detail.body as unknown);
    expect(detailBody.answerCount).toBe(1);
    expect(records(detailBody.answers)).toEqual([
      expect.objectContaining({ id: body.id, questionId }),
    ]);
    const feed = await traveler.agent
      .get('/api/v1/rooms/jeju/questions')
      .expect(200);
    expect(records(record(feed.body as unknown).items)[0]?.answerCount).toBe(1);

    const publicationFailure = jest
      .spyOn(publisher, 'publishAnswerCreated')
      .mockImplementationOnce(() => {
        throw new Error('Simulated socket publication failure');
      });
    await local.agent
      .post(`/api/v1/questions/${questionId}/answers`)
      .send({ ...answerInput, content: `${answerInput.content} 추가 확인` })
      .expect(201);
    publicationFailure.mockRestore();
    expect(await prisma.answer.count({ where: { questionId } })).toBe(2);
  });

  it('validates official source URLs with domain error codes', async () => {
    const traveler = await createUser('source-traveler');
    const local = await createUser('source-local');
    await approve(traveler.id, VerificationType.TRAVELER);
    await approve(local.id, VerificationType.LOCAL);
    const questionId = await createQuestion(traveler.id);
    const base = {
      content: '제주도 공식 공지에서 현재 운영 여부를 확인했습니다.',
      sourceType: AnswerSourceType.OFFICIAL_SOURCE,
    };

    const missing = await local.agent
      .post(`/api/v1/questions/${questionId}/answers`)
      .send(base)
      .expect(400);
    expect(record(missing.body as unknown).code).toBe('SOURCE_URL_REQUIRED');
    const http = await local.agent
      .post(`/api/v1/questions/${questionId}/answers`)
      .send({ ...base, sourceUrl: 'http://example.com/notice' })
      .expect(400);
    expect(record(http.body as unknown).code).toBe('INVALID_SOURCE_URL');
    await local.agent
      .post(`/api/v1/questions/${questionId}/answers`)
      .send({ ...base, sourceUrl: 'https://example.com/notice' })
      .expect(201);
  });

  it('allows verified participants and enforces ownership, state, and limits', async () => {
    const dual = await createUser('dual');
    const otherTraveler = await createUser('other-traveler');
    const local = await createUser('limited-local');
    const expiredLocal = await createUser('expired-local');
    await approve(dual.id, VerificationType.TRAVELER);
    await approve(dual.id, VerificationType.LOCAL);
    await approve(otherTraveler.id, VerificationType.TRAVELER);
    await approve(local.id, VerificationType.LOCAL);
    await approve(expiredLocal.id, VerificationType.LOCAL, { expired: true });
    const ownQuestion = await createQuestion(dual.id);

    const own = await dual.agent
      .post(`/api/v1/questions/${ownQuestion}/answers`)
      .send(answerInput)
      .expect(403);
    expect(record(own.body as unknown).code).toBe('CANNOT_ANSWER_OWN_QUESTION');
    const travelerOnly = await otherTraveler.agent
      .post(`/api/v1/questions/${ownQuestion}/answers`)
      .send(answerInput)
      .expect(201);
    expect(record(record(travelerOnly.body as unknown).author).badge).toBe(
      'VERIFIED_TRAVELER',
    );
    const expiredIdentity = await expiredLocal.agent
      .post(`/api/v1/questions/${ownQuestion}/answers`)
      .send(answerInput)
      .expect(403);
    expect(record(expiredIdentity.body as unknown).code).toBe(
      'PARTICIPANT_VERIFICATION_REQUIRED',
    );

    const expiredQuestion = await createQuestion(otherTraveler.id, {
      expiresAt: new Date(Date.now() - 1000),
    });
    const expired = await local.agent
      .post(`/api/v1/questions/${expiredQuestion}/answers`)
      .send(answerInput)
      .expect(409);
    expect(record(expired.body as unknown).code).toBe('QUESTION_EXPIRED');
    const resolvedQuestion = await createQuestion(otherTraveler.id, {
      status: QuestionStatus.RESOLVED,
    });
    const resolved = await local.agent
      .post(`/api/v1/questions/${resolvedQuestion}/answers`)
      .send(answerInput)
      .expect(409);
    expect(record(resolved.body as unknown).code).toBe('QUESTION_NOT_OPEN');

    const limitedQuestion = await createQuestion(otherTraveler.id);
    for (let index = 0; index < 2; index += 1) {
      await local.agent
        .post(`/api/v1/questions/${limitedQuestion}/answers`)
        .send({ ...answerInput, content: `${answerInput.content} ${index}` })
        .expect(201);
    }
    const concurrent = await Promise.all([
      local.agent
        .post(`/api/v1/questions/${limitedQuestion}/answers`)
        .send({ ...answerInput, content: `${answerInput.content} 동시 A` }),
      local.agent
        .post(`/api/v1/questions/${limitedQuestion}/answers`)
        .send({ ...answerInput, content: `${answerInput.content} 동시 B` }),
    ]);
    expect(concurrent.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);
    expect(
      record(
        concurrent.find((response) => response.status === 409)?.body as unknown,
      ).code,
    ).toBe('ANSWER_LIMIT_REACHED');
  });

  it('authenticates joins, broadcasts committed public DTOs once, and recovers via REST', async () => {
    const traveler = await createUser('socket-traveler');
    const localA = await createUser('socket-local-a');
    const localB = await createUser('socket-local-b');
    const unverified = await createUser('socket-locked');
    await approve(traveler.id, VerificationType.TRAVELER);
    await approve(localA.id, VerificationType.LOCAL);
    await approve(localB.id, VerificationType.LOCAL);

    const unauthorized = io(baseUrl, {
      forceNew: true,
      reconnection: false,
      transports: ['websocket'],
    });
    sockets.push(unauthorized);
    const connectionError = await new Promise<Error>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Unauthorized socket did not fail')),
        1500,
      );
      unauthorized.once('connect_error', (error) => {
        clearTimeout(timer);
        resolve(error);
      });
    });
    expect(connectionError.message).toContain('로그인');

    const lockedSocket = await connect(unverified.cookie);
    await expect(join(lockedSocket)).resolves.toMatchObject({
      ok: false,
      code: 'ROOM_ACCESS_DENIED',
    });
    const travelerSocket = await connect(traveler.cookie);
    const localASocket = await connect(localA.cookie);
    const localBSocket = await connect(localB.cookie);
    await expect(join(travelerSocket)).resolves.toEqual({
      ok: true,
      roomSlug: 'jeju',
    });
    await expect(join(localASocket)).resolves.toEqual({
      ok: true,
      roomSlug: 'jeju',
    });
    await expect(join(localBSocket)).resolves.toEqual({
      ok: true,
      roomSlug: 'jeju',
    });

    const localAQuestionEvent = nextQuestionEvent(localASocket);
    const localBQuestionEvent = nextQuestionEvent(localBSocket);
    const questionCreated = await traveler.agent
      .post('/api/v1/rooms/jeju/questions')
      .send({
        category: 'PLACE',
        urgency: 'URGENT',
        content: '실시간 답변을 받고 싶은 제주 실내 장소 질문입니다.',
        areaText: '제주시',
      })
      .expect(201);
    const questionId = String(record(questionCreated.body as unknown).id);
    const [questionEventA, questionEventB] = await Promise.all([
      localAQuestionEvent,
      localBQuestionEvent,
    ]);
    expect(questionEventA).toMatchObject({
      roomSlug: 'jeju',
      payload: { id: questionId },
    });
    expect(questionEventB.payload.id).toBe(questionId);
    expect(questionEventA.eventId).toMatch(/^evt_[0-9a-f-]{36}$/);
    expect(questionEventA.eventId).toBe(questionEventB.eventId);

    const travelerAnswers: string[] = [];
    travelerSocket.on('room.answer.created', (event) => {
      travelerAnswers.push(event.payload.id);
    });
    const travelerAnswerEvent = nextAnswerEvent(travelerSocket);
    const localBAnswerEvent = nextAnswerEvent(localBSocket);
    const answerCreated = await localA.agent
      .post(`/api/v1/questions/${questionId}/answers`)
      .send(answerInput)
      .expect(201);
    const answerId = String(record(answerCreated.body as unknown).id);
    const [answerEventTraveler, answerEventLocalB] = await Promise.all([
      travelerAnswerEvent,
      localBAnswerEvent,
    ]);
    expect(answerEventTraveler).toMatchObject({
      roomSlug: 'jeju',
      payload: {
        id: answerId,
        author: { badge: 'VERIFIED_LOCAL' },
      },
    });
    expect(answerEventLocalB.eventId).toBe(answerEventTraveler.eventId);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(travelerAnswers.filter((id) => id === answerId)).toHaveLength(1);
    expect(JSON.stringify(answerEventTraveler)).not.toMatch(
      /email|role|gps|proof/,
    );

    let failedWriteEvents = 0;
    travelerSocket.on('room.answer.created', () => {
      failedWriteEvents += 1;
    });
    await localA.agent
      .post(`/api/v1/questions/${questionId}/answers`)
      .send({
        ...answerInput,
        sourceType: 'OFFICIAL_SOURCE',
        sourceUrl: 'http://unsafe.example.com',
      })
      .expect(400);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(failedWriteEvents).toBe(0);

    const transactionFailure = jest
      .spyOn(prisma, '$transaction')
      .mockRejectedValueOnce(new Error('Simulated database failure'));
    await localA.agent
      .post(`/api/v1/questions/${questionId}/answers`)
      .send({ ...answerInput, content: `${answerInput.content} DB 실패` })
      .expect(500);
    transactionFailure.mockRestore();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(failedWriteEvents).toBe(0);

    travelerSocket.close();
    const missedAnswer = await localB.agent
      .post(`/api/v1/questions/${questionId}/answers`)
      .send({
        ...answerInput,
        content: `${answerInput.content} 두 번째 현지인`,
      })
      .expect(201);
    const missedAnswerId = String(record(missedAnswer.body as unknown).id);
    const reconnected = await connect(traveler.cookie);
    await expect(join(reconnected)).resolves.toEqual({
      ok: true,
      roomSlug: 'jeju',
    });
    const detail = await traveler.agent
      .get(`/api/v1/questions/${questionId}`)
      .expect(200);
    expect(
      records(record(detail.body as unknown).answers).map(
        (answer) => answer.id,
      ),
    ).toEqual([answerId, missedAnswerId]);
  });
});
