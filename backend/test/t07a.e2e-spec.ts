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
  RealtimeEnvelope,
  RoomMembershipResult,
  ServerToClientEvents,
} from '../src/realtime/realtime.types';
import type { MessageResponse } from '../src/messages/dto/message.response';

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

describe('T07A room chat and topics', () => {
  let app: INestApplication;
  let server: Server;
  let baseUrl: string;
  let prisma: PrismaService;
  let jwt: JwtService;
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
    const room = await prisma.destinationRoom.findUniqueOrThrow({
      where: { slug: 'jeju' },
    });
    destinationId = room.destinationId;
    roomId = room.id;
  });

  beforeEach(async () => {
    await prisma.question.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.destination.deleteMany({ where: { slug: 't07a-other' } });
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(() => {
    for (const socket of sockets.splice(0)) socket.close();
  });

  afterAll(async () => {
    await prisma.question.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.destination.deleteMany({ where: { slug: 't07a-other' } });
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
        email: `t07a-${name}@example.com`,
        nickname: `T07A-${name}`,
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
      { sub: user.id, role },
      { expiresIn: 3600, secret },
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
            ? new Date(now + 2 * 60 * 60 * 1000)
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

  it('gates writes and lets travelers and locals exchange paginated plain text', async () => {
    await request(server).get('/api/v1/rooms/jeju/messages').expect(401);
    const unverified = await createUser('unverified');
    const denied = await unverified.agent
      .post('/api/v1/rooms/jeju/messages')
      .send({ content: '안녕하세요' })
      .expect(403);
    expect(record(denied.body as unknown).code).toBe(
      'ROOM_PARTICIPANT_VERIFICATION_REQUIRED',
    );

    const admin = await createUser('admin', UserRole.ADMIN);
    await admin.agent
      .post('/api/v1/rooms/jeju/messages')
      .send({ content: '관리자는 쓰지 않습니다.' })
      .expect(403);

    const traveler = await createUser('traveler');
    const local = await createUser('local');
    await approve(traveler.id, VerificationType.TRAVELER);
    await approve(local.id, VerificationType.LOCAL);

    const travelerMessage = await traveler.agent
      .post('/api/v1/rooms/jeju/messages')
      .send({ content: '  <b>공항 버스가 조금 밀리고 있어요.</b>  ' })
      .expect(201);
    expect(travelerMessage.body).toMatchObject({
      content: '<b>공항 버스가 조금 밀리고 있어요.</b>',
      contentFormat: 'PLAIN_TEXT',
      topicId: null,
      author: { id: traveler.id, badge: 'VERIFIED_TRAVELER' },
    });
    expect(JSON.stringify(travelerMessage.body)).not.toMatch(
      /email|password|proof|gps|verification/i,
    );

    const localMessage = await local.agent
      .post('/api/v1/rooms/jeju/messages')
      .send({ content: '현장에서도 같은 지연을 확인했어요.' })
      .expect(201);
    expect(localMessage.body).toMatchObject({
      author: { id: local.id, badge: 'VERIFIED_LOCAL' },
    });

    const firstPage = await traveler.agent
      .get('/api/v1/rooms/jeju/messages?limit=1')
      .expect(200);
    const firstBody = record(firstPage.body as unknown);
    expect(Array.isArray(firstBody.items)).toBe(true);
    expect(record((firstBody.items as unknown[])[0]).id).toBe(
      record(localMessage.body as unknown).id,
    );
    expect(typeof firstBody.nextCursor).toBe('string');

    const olderPage = await traveler.agent
      .get(
        `/api/v1/rooms/jeju/messages?limit=1&cursor=${encodeURIComponent(String(firstBody.nextCursor))}`,
      )
      .expect(200);
    expect(
      record((record(olderPage.body as unknown).items as unknown[])[0]).id,
    ).toBe(record(travelerMessage.body as unknown).id);
  });

  it('promotes only an own, same-room message once and allows direct local topics', async () => {
    const traveler = await createUser('topic-traveler');
    const local = await createUser('topic-local');
    await approve(traveler.id, VerificationType.TRAVELER);
    await approve(local.id, VerificationType.LOCAL);

    const message = await traveler.agent
      .post('/api/v1/rooms/jeju/messages')
      .send({
        content: '공항에서 서귀포로 가는 버스가 현재 많이 지연되고 있나요?',
      })
      .expect(201);
    const messageId = String(record(message.body as unknown).id);

    await local.agent
      .post('/api/v1/rooms/jeju/questions')
      .send({
        category: 'TRANSPORT',
        urgency: 'URGENT',
        sourceMessageId: messageId,
      })
      .expect(404);

    const otherDestination = await prisma.destination.create({
      data: {
        slug: 't07a-other',
        nameKo: '다른 지역',
        countryCode: 'KR',
        timezone: 'Asia/Seoul',
        centerLatitude: 35,
        centerLongitude: 127,
        radiusKm: 20,
        room: {
          create: { slug: 't07a-other', title: '다른 지역 도움방' },
        },
      },
      include: { room: true },
    });
    if (otherDestination.room === null) throw new Error('Expected other room');
    const otherRoomMessage = await prisma.chatMessage.create({
      data: {
        roomId: otherDestination.room.id,
        authorId: traveler.id,
        authorKind: 'TRAVELER',
        content: '이 메시지는 제주가 아닌 다른 지역 방에서 작성했습니다.',
      },
    });
    const crossRoom = await traveler.agent
      .post('/api/v1/rooms/jeju/questions')
      .send({
        category: 'OTHER',
        urgency: 'NORMAL',
        sourceMessageId: otherRoomMessage.id,
      })
      .expect(404);
    expect(record(crossRoom.body as unknown).code).toBe(
      'MESSAGE_NOT_AVAILABLE_FOR_PROMOTION',
    );

    const promoted = await traveler.agent
      .post('/api/v1/rooms/jeju/questions')
      .send({
        category: 'TRANSPORT',
        urgency: 'URGENT',
        sourceMessageId: messageId,
      })
      .expect(201);
    expect(promoted.body).toMatchObject({
      sourceMessageId: messageId,
      content: '공항에서 서귀포로 가는 버스가 현재 많이 지연되고 있나요?',
      author: { badge: 'VERIFIED_TRAVELER' },
    });

    const repeated = await traveler.agent
      .post('/api/v1/rooms/jeju/questions')
      .send({
        category: 'TRANSPORT',
        urgency: 'URGENT',
        sourceMessageId: messageId,
      })
      .expect(409);
    expect(record(repeated.body as unknown).code).toBe(
      'MESSAGE_ALREADY_PROMOTED',
    );

    const concurrentMessage = await traveler.agent
      .post('/api/v1/rooms/jeju/messages')
      .send({
        content: '동시에 요청해도 이 메시지는 토픽 하나로만 만들어져야 합니다.',
      })
      .expect(201);
    const concurrentMessageId = String(
      record(concurrentMessage.body as unknown).id,
    );
    const promotionInput = {
      category: 'OTHER',
      urgency: 'NORMAL',
      sourceMessageId: concurrentMessageId,
    };
    const concurrentResults = await Promise.all([
      traveler.agent.post('/api/v1/rooms/jeju/questions').send(promotionInput),
      traveler.agent.post('/api/v1/rooms/jeju/questions').send(promotionInput),
    ]);
    expect(concurrentResults.map((response) => response.status).sort()).toEqual(
      [201, 409],
    );
    await expect(
      prisma.question.count({
        where: { sourceMessageId: concurrentMessageId },
      }),
    ).resolves.toBe(1);

    const directLocalTopic = await local.agent
      .post('/api/v1/rooms/jeju/questions')
      .send({
        category: 'WEATHER',
        urgency: 'NORMAL',
        content: '오늘 오후 서귀포 쪽 소나기 상황을 함께 공유해 주세요.',
      })
      .expect(201);
    expect(record(record(directLocalTopic.body as unknown).author).badge).toBe(
      'VERIFIED_LOCAL',
    );
  });

  it('broadcasts one committed message event to joined participants', async () => {
    const traveler = await createUser('socket-traveler');
    const local = await createUser('socket-local');
    await approve(traveler.id, VerificationType.TRAVELER);
    await approve(local.id, VerificationType.LOCAL);
    const socket = await connect(local);
    await expect(join(socket)).resolves.toEqual({ ok: true, roomSlug: 'jeju' });

    const eventPromise = new Promise<RealtimeEnvelope<MessageResponse>>(
      (resolve) => socket.once('room.message.created', resolve),
    );
    const created = await traveler.agent
      .post('/api/v1/rooms/jeju/messages')
      .send({ content: '지금 공항 도착장 대기 줄 정보를 공유합니다.' })
      .expect(201);
    const event = await eventPromise;
    expect(event.roomSlug).toBe('jeju');
    expect(event.payload.id).toBe(record(created.body as unknown).id);
    await expect(
      prisma.chatMessage.findUnique({ where: { id: event.payload.id } }),
    ).resolves.toMatchObject({ roomId, content: event.payload.content });
  });
});
