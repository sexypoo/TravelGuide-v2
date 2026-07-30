import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns a live status with a UTC timestamp', () => {
    const controller = new HealthController();

    const response = controller.getLive();

    expect(response.status).toBe('ok');
    expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp);
  });
});
