import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  AnswerSourceType,
  AuthProvider,
  CommunityPostCategory,
  QuestionCategory,
  QuestionUrgency,
  ReportReason,
  ReportTargetType,
  RoomParticipantKind,
  UserRole,
  VerificationType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AUTH_COOKIE_NAME } from '../src/auth/auth-cookie';
import { AuthService } from '../src/auth/auth.service';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  STORAGE_SERVICE,
  type StorageService,
} from '../src/storage/storage.service';
import { UsersService } from '../src/users/users.service';

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected an object response');
  }
  return value as Record<string, unknown>;
}

async function readPrivateObject(
  storage: StorageService,
  objectKey: string,
): Promise<Buffer> {
  const stream = await storage.getPrivateDownload(objectKey, 60);
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

describe('Account deletion', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let auth: AuthService;
  let users: UsersService;
  let storage: StorageService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
    auth = app.get(AuthService);
    users = app.get(UsersService);
    storage = app.get<StorageService>(STORAGE_SERVICE);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.preorderRegistration.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.preorderRegistration.deleteMany();
    await app.close();
  });

  it('reauthenticates and removes cascaded content, target reports, and private objects', async () => {
    const agent = request.agent(server);
    await agent
      .post('/api/v1/auth/register')
      .send({
        email: 'delete-me@example.com',
        nickname: '삭제대상사용자',
        password: 'deletepass123',
        termsAgreed: true,
      })
      .expect(201);
    const owner = await prisma.user.findUniqueOrThrow({
      where: { email: 'delete-me@example.com' },
    });
    const other = await prisma.user.create({
      data: {
        email: 'remaining@example.com',
        nickname: '남는사용자',
        passwordHash: await bcrypt.hash('remaining123', 12),
      },
    });
    const room = await prisma.destinationRoom.findUniqueOrThrow({
      where: { slug: 'jeju' },
      include: { destination: true },
    });

    const objectKeys = [
      'profile-images/delete-user/00000000-0000-4000-8000-000000000001',
      'verification/delete-user/00000000-0000-4000-8000-000000000002',
      'room-media/delete-user/00000000-0000-4000-8000-000000000003',
      'question-media/delete-user/00000000-0000-4000-8000-000000000004',
      'answer-media/delete-user/00000000-0000-4000-8000-000000000005',
      'answer-media/delete-user/00000000-0000-4000-8000-000000000006',
    ];
    for (const objectKey of objectKeys) {
      await storage.delete(objectKey);
      await storage.putPrivate({ objectKey, contents: Buffer.from(objectKey) });
    }
    await prisma.user.update({
      where: { id: owner.id },
      data: {
        avatarObjectKey: objectKeys[0],
        avatarOriginalName: 'avatar.webp',
        avatarMimeType: 'image/webp',
        avatarSizeBytes: 10,
      },
    });
    await prisma.verification.create({
      data: {
        userId: owner.id,
        destinationId: room.destinationId,
        type: VerificationType.TRAVELER,
        proofObjectKey: objectKeys[1] ?? '',
        proofOriginalName: 'proof.webp',
        proofMimeType: 'image/webp',
        proofSizeBytes: 10,
      },
    });
    const message = await prisma.chatMessage.create({
      data: {
        roomId: room.id,
        authorId: owner.id,
        authorKind: RoomParticipantKind.TRAVELER,
        content: '삭제될 채팅',
        imageObjectKey: objectKeys[2],
      },
    });
    const ownerQuestion = await prisma.question.create({
      data: {
        roomId: room.id,
        authorId: owner.id,
        category: QuestionCategory.WAITING,
        urgency: QuestionUrgency.NORMAL,
        content: '삭제될 질문',
        expiresAt: new Date(Date.now() + 60_000),
        imageObjectKey: objectKeys[3],
      },
    });
    const cascadedAnswer = await prisma.answer.create({
      data: {
        questionId: ownerQuestion.id,
        authorId: other.id,
        content: '질문과 함께 삭제될 다른 사용자의 답변',
        sourceType: AnswerSourceType.RECENT_EXPERIENCE,
        imageObjectKey: objectKeys[4],
      },
    });
    const otherQuestion = await prisma.question.create({
      data: {
        roomId: room.id,
        authorId: other.id,
        category: QuestionCategory.PLACE,
        urgency: QuestionUrgency.NORMAL,
        content: '남을 질문',
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    const ownAnswer = await prisma.answer.create({
      data: {
        questionId: otherQuestion.id,
        authorId: owner.id,
        content: '삭제될 답변',
        sourceType: AnswerSourceType.PERSONAL_OPINION,
        imageObjectKey: objectKeys[5],
      },
    });
    const ownerPost = await prisma.communityPost.create({
      data: {
        authorId: owner.id,
        category: CommunityPostCategory.QUESTION,
        title: '삭제될 게시물',
        content: '삭제될 내용',
      },
    });
    const cascadedComment = await prisma.communityComment.create({
      data: {
        postId: ownerPost.id,
        authorId: other.id,
        content: '게시물과 함께 삭제될 댓글',
      },
    });
    const otherPost = await prisma.communityPost.create({
      data: {
        authorId: other.id,
        category: CommunityPostCategory.TRAVEL_TIP,
        title: '남을 게시물',
        content: '남을 내용',
      },
    });
    const ownComment = await prisma.communityComment.create({
      data: {
        postId: otherPost.id,
        authorId: owner.id,
        content: '삭제될 댓글',
      },
    });
    const targets = [
      [ReportTargetType.USER, owner.id],
      [ReportTargetType.MESSAGE, message.id],
      [ReportTargetType.QUESTION, ownerQuestion.id],
      [ReportTargetType.ANSWER, cascadedAnswer.id],
      [ReportTargetType.ANSWER, ownAnswer.id],
      [ReportTargetType.COMMUNITY_POST, ownerPost.id],
      [ReportTargetType.COMMUNITY_COMMENT, cascadedComment.id],
      [ReportTargetType.COMMUNITY_COMMENT, ownComment.id],
    ] as const;
    for (const [targetType, targetId] of targets) {
      await prisma.report.create({
        data: {
          reporterId: other.id,
          targetType,
          targetId,
          reason: ReportReason.OTHER,
        },
      });
    }
    await prisma.preorderRegistration.create({
      data: {
        name: '삭제대상',
        email: owner.email,
        consentedAt: new Date(),
      },
    });

    const ownProfile = await agent.get('/api/v1/users/me').expect(200);
    expect(asRecord(ownProfile.body as unknown)).toMatchObject({
      hasPassword: true,
    });
    const failed = await agent
      .delete('/api/v1/auth/account')
      .send({ confirmation: '계정 삭제', password: 'wrong-password' })
      .expect(401);
    expect(asRecord(failed.body as unknown).code).toBe(
      'ACCOUNT_DELETION_REAUTH_FAILED',
    );
    expect(await prisma.user.count({ where: { id: owner.id } })).toBe(1);

    await agent
      .delete('/api/v1/auth/account')
      .send({ confirmation: '계정 삭제', password: 'deletepass123' })
      .expect('set-cookie', /tg_access=;/)
      .expect(204);

    await agent.get('/api/v1/auth/me').expect(401);
    expect(
      await prisma.user.findUnique({ where: { id: owner.id } }),
    ).toBeNull();
    expect(
      await prisma.preorderRegistration.findUnique({
        where: { email: owner.email },
      }),
    ).toBeNull();
    expect(await prisma.report.count({ where: { reporterId: other.id } })).toBe(
      0,
    );
    expect(
      await prisma.answer.findUnique({ where: { id: cascadedAnswer.id } }),
    ).toBeNull();
    expect(
      await prisma.communityComment.findUnique({
        where: { id: cascadedComment.id },
      }),
    ).toBeNull();
    expect(
      await prisma.question.findUnique({ where: { id: otherQuestion.id } }),
    ).not.toBeNull();
    expect(
      await prisma.communityPost.findUnique({ where: { id: otherPost.id } }),
    ).not.toBeNull();
    for (const objectKey of objectKeys) {
      await expect(readPrivateObject(storage, objectKey)).rejects.toThrow();
    }
  });

  it('allows social-only deletion and blocks administrator deletion', async () => {
    const socialUser = await users.findOrCreateSocialUser({
      provider: AuthProvider.KAKAO,
      providerUserId: 'delete-social-user',
      email: 'delete-social@example.com',
      nicknameHint: '소셜삭제사용자',
      allowCreate: true,
    });
    const socialSession = await auth.createSession(socialUser);
    await request(server)
      .delete('/api/v1/auth/account')
      .set('Cookie', `${AUTH_COOKIE_NAME}=${socialSession.token}`)
      .send({ confirmation: '계정 삭제' })
      .expect(204);
    expect(
      await prisma.user.findUnique({ where: { id: socialUser.id } }),
    ).toBeNull();

    const admin = await users.create({
      email: 'protected-admin@example.com',
      nickname: '보호관리자',
      passwordHash: await bcrypt.hash('adminpass123', 12),
    });
    await prisma.user.update({
      where: { id: admin.id },
      data: { role: UserRole.ADMIN },
    });
    const currentAdmin = await users.findAuthByEmail(admin.email);
    if (currentAdmin === null) throw new Error('Expected admin account');
    const adminSession = await auth.createSession(currentAdmin);
    const response = await request(server)
      .delete('/api/v1/auth/account')
      .set('Cookie', `${AUTH_COOKIE_NAME}=${adminSession.token}`)
      .send({ confirmation: '계정 삭제', password: 'adminpass123' })
      .expect(403);
    expect(asRecord(response.body as unknown).code).toBe(
      'ADMIN_ACCOUNT_DELETION_NOT_ALLOWED',
    );
    expect(await prisma.user.count({ where: { id: admin.id } })).toBe(1);
  });

  it('requires the exact destructive confirmation phrase', async () => {
    const user = await users.create({
      email: 'phrase@example.com',
      nickname: '문구확인사용자',
      passwordHash: await bcrypt.hash('password123', 12),
    });
    const session = await auth.createSession(user);
    const response = await request(server)
      .delete('/api/v1/auth/account')
      .set('Cookie', `${AUTH_COOKIE_NAME}=${session.token}`)
      .send({ confirmation: '삭제', password: 'password123' })
      .expect(400);
    expect(asRecord(response.body as unknown).code).toBe('VALIDATION_FAILED');
    expect(await prisma.user.count({ where: { id: user.id } })).toBe(1);
  });
});
