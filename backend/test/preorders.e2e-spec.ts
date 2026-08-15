import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
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

describe('Preorders', () => {
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
    await prisma.preorderRegistration.deleteMany();
  });

  afterAll(async () => {
    await prisma.preorderRegistration.deleteMany();
    await app.close();
  });

  it('stores a normalized registration and returns no personal data', async () => {
    const response = await request(server)
      .post('/api/v1/preorders')
      .send({
        name: ' 제주 여행자 ',
        email: ' First@Example.COM ',
        privacyConsent: true,
      })
      .expect(201);

    expect(response.body).toEqual({ status: 'registered' });
    expect(JSON.stringify(response.body)).not.toContain('first@example.com');
    const stored = await prisma.preorderRegistration.findMany({
      select: { name: true, email: true, consentedAt: true },
    });
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      name: '제주 여행자',
      email: 'first@example.com',
    });
    expect(stored[0]?.consentedAt).toBeInstanceOf(Date);
  });

  it('returns the same success and keeps one row for a normalized duplicate', async () => {
    const first = {
      name: '첫 신청자',
      email: 'same@example.com',
      privacyConsent: true,
    };
    await request(server).post('/api/v1/preorders').send(first).expect(201);
    const duplicate = await request(server)
      .post('/api/v1/preorders')
      .send({ ...first, name: '다른 이름', email: ' SAME@EXAMPLE.COM ' })
      .expect(201);

    expect(duplicate.body).toEqual({ status: 'registered' });
    await expect(prisma.preorderRegistration.count()).resolves.toBe(1);
  });

  it.each([
    { name: '', email: 'valid@example.com', privacyConsent: true },
    { name: '신청자', email: 'invalid', privacyConsent: true },
    { name: '신청자', email: 'valid@example.com', privacyConsent: false },
    {
      name: '신청자',
      email: 'valid@example.com',
      privacyConsent: true,
      unexpected: 'field',
    },
  ])('rejects invalid input without storing it: %p', async (input) => {
    const response = await request(server)
      .post('/api/v1/preorders')
      .send(input)
      .expect(400);

    expect(asRecord(response.body as unknown).code).toBe('VALIDATION_FAILED');
    await expect(prisma.preorderRegistration.count()).resolves.toBe(0);
  });

  it('does not expose a public applicant list', async () => {
    await request(server).get('/api/v1/preorders').expect(404);
  });
});
