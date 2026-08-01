import { HealthController } from './health.controller';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  const prisma = new PrismaService();
  const queryRaw = jest.spyOn(prisma, '$queryRaw');

  beforeEach(() => queryRaw.mockReset());

  it('returns a live status with a UTC timestamp', () => {
    const controller = new HealthController(prisma);

    const response = controller.getLive();

    expect(response.status).toBe('ok');
    expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp);
  });

  it('reports ready only after the database responds', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    const response = await new HealthController(prisma).getReady();
    expect(response).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('returns a safe service-unavailable problem when the database fails', async () => {
    queryRaw.mockRejectedValue(new Error('password=must-not-leak'));
    await expect(new HealthController(prisma).getReady()).rejects.toMatchObject(
      {
        code: 'DATABASE_UNAVAILABLE',
      } satisfies Partial<ProblemException>,
    );
  });
});
