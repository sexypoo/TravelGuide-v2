import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

describe('Health endpoint', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health/live returns 200', async () => {
    const server = app.getHttpServer() as Server;

    const response = await request(server)
      .get('/api/v1/health/live')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.headers['x-request-id']).toMatch(/^req_/);
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['content-security-policy']).toContain(
      "frame-ancestors 'none'",
    );
  });

  it('GET /api/v1/health/ready verifies PostgreSQL', async () => {
    await request(app.getHttpServer() as Server)
      .get('/api/v1/health/ready')
      .expect(200)
      .expect(({ body }: { body: unknown }) => {
        expect(body).toMatchObject({ status: 'ok', database: 'up' });
      });
  });

  it('allows only the configured credentialed CORS origin', async () => {
    const server = app.getHttpServer() as Server;
    const allowed = await request(server)
      .options('/api/v1/health/live')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);
    expect(allowed.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');
    const denied = await request(server)
      .get('/api/v1/health/live')
      .set('Origin', 'https://evil.example')
      .expect(200);
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
});
