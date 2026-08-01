import { RateLimitService } from './rate-limit.service';

describe('RateLimitService', () => {
  it('allows five logins per minute and returns an actionable retry', () => {
    const limiter = new RateLimitService();
    const now = 1_000_000;
    for (let index = 0; index < 5; index += 1) {
      expect(limiter.consume('LOGIN', '127.0.0.1', now).allowed).toBe(true);
    }
    expect(limiter.consume('LOGIN', '127.0.0.1', now)).toEqual({
      allowed: false,
      retryAfterSeconds: 60,
      resetAt: now + 60_000,
    });
    expect(limiter.consume('LOGIN', '127.0.0.1', now + 60_000).allowed).toBe(
      true,
    );
  });

  it('isolates categories and principals', () => {
    const limiter = new RateLimitService();
    for (let index = 0; index < 5; index += 1) {
      limiter.consume('TOPIC', 'user-a', 0);
    }
    expect(limiter.consume('TOPIC', 'user-a', 0).allowed).toBe(false);
    expect(limiter.consume('TOPIC', 'user-b', 0).allowed).toBe(true);
    expect(limiter.consume('REPORT', 'user-a', 0).allowed).toBe(true);
  });
});
