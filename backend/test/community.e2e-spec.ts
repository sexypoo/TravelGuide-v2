import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

type Agent = ReturnType<typeof request.agent>;

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null)
    throw new Error('object expected');
  return value as Record<string, unknown>;
}

describe('open travel community', () => {
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
    await prisma.report.deleteMany();
    await prisma.communityComment.deleteMany();
    await prisma.communityPost.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.report.deleteMany();
    await prisma.communityComment.deleteMany();
    await prisma.communityPost.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  async function register(name: string): Promise<{ id: string; agent: Agent }> {
    const agent = request.agent(server);
    const response = await agent
      .post('/api/v1/auth/register')
      .send({
        email: `community-${name}@example.com`,
        password: 'password123',
        nickname: `여행자${name}`,
        termsAgreed: true,
      })
      .expect(201);
    return { id: String(record(response.body as unknown).id), agent };
  }

  it('requires a login but not evidence verification for posts and comments', async () => {
    await request(server).get('/api/v1/community/posts').expect(401);
    const author = await register('작성자');
    const commenter = await register('댓글러');
    expect(await prisma.verification.count()).toBe(0);

    const created = await author.agent
      .post('/api/v1/community/posts')
      .send({
        category: 'TRAVEL_TIP',
        areaText: '부산',
        title: '비 오는 날 부산역 짐 보관 팁',
        content: '역 안쪽 보관함이 붐빌 때 이용할 수 있는 대안을 공유합니다.',
      })
      .expect(201);
    const postId = String(record(created.body as unknown).id);
    await commenter.agent
      .post(`/api/v1/community/posts/${postId}/comments`)
      .send({ content: '주말에도 이용 가능한지 궁금해요.' })
      .expect(201);

    const page = await commenter.agent
      .get('/api/v1/community/posts?category=TRAVEL_TIP&limit=20')
      .expect(200);
    expect(page.body).toMatchObject({
      items: [
        {
          id: postId,
          areaText: '부산',
          commentCount: 1,
          author: { id: author.id },
        },
      ],
      nextCursor: null,
    });
    const detail = await author.agent
      .get(`/api/v1/community/posts/${postId}`)
      .expect(200);
    expect(record(detail.body as unknown).comments).toHaveLength(1);
  });

  it('validates content and connects reports to admin soft removal', async () => {
    const author = await register('원문작성');
    const reporter = await register('신고회원');
    const adminAgent = request.agent(server);
    const email = 'community-admin@example.com';
    await prisma.user.create({
      data: {
        email,
        nickname: '커뮤니티관리자',
        passwordHash: await bcrypt.hash('password123', 12),
        role: UserRole.ADMIN,
      },
    });
    await adminAgent
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' })
      .expect(200);

    await author.agent
      .post('/api/v1/community/posts')
      .send({ category: 'OTHER', title: '짧음', content: '짧음' })
      .expect(400);
    const created = await author.agent
      .post('/api/v1/community/posts')
      .send({
        category: 'PLACE',
        areaText: '서울',
        title: '운영자가 확인해야 하는 잘못된 장소 정보',
        content:
          '검증을 위해 공개 응답에서 제거되어야 하는 충분히 긴 원문입니다.',
      })
      .expect(201);
    const postId = String(record(created.body as unknown).id);
    const report = await reporter.agent
      .post('/api/v1/reports')
      .send({
        targetType: 'COMMUNITY_POST',
        targetId: postId,
        reason: 'FALSE_INFORMATION',
      })
      .expect(201);
    const reportId = String(record(report.body as unknown).id);
    await adminAgent
      .patch(`/api/v1/admin/reports/${reportId}/review`)
      .send({ decision: 'REMOVE', note: '잘못된 장소 정보로 확인했습니다.' })
      .expect(200);

    const detail = await reporter.agent
      .get(`/api/v1/community/posts/${postId}`)
      .expect(200);
    expect(detail.body).toMatchObject({
      removed: true,
      title: '숨김 처리된 게시글',
      areaText: null,
    });
    expect(JSON.stringify(detail.body)).not.toContain('제거되어야 하는');
  });
});
