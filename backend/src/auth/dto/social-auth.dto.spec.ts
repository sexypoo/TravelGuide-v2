import { parseSocialCallback } from './social-auth.dto';

describe('parseSocialCallback', () => {
  it('keeps code, state, and error and ignores provider extras', () => {
    expect(
      parseSocialCallback({
        code: 'c',
        state: 's',
        scope: 'email profile',
        authuser: '0',
        prompt: 'consent',
        user: '{}',
      }),
    ).toEqual({ code: 'c', state: 's' });
    expect(parseSocialCallback({ error: 'access_denied' })).toEqual({
      error: 'access_denied',
    });
  });

  it('drops non-string or oversized values', () => {
    expect(
      parseSocialCallback({
        code: ['a', 'b'],
        state: 's'.repeat(4097),
        error: 'e'.repeat(256),
      }),
    ).toEqual({});
    expect(parseSocialCallback(undefined)).toEqual({});
  });
});
