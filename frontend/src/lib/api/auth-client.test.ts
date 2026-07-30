import { login, logout, register } from './auth-client';
import { parseCurrentUser } from './auth-contract';

const currentUser = {
  id: 'user-1',
  email: 'traveler@example.com',
  nickname: '제주여행자',
  role: 'USER',
  isAdmin: false,
  createdAt: '2026-07-30T12:00:00.000Z',
  verificationSummary: { traveler: null, local: null },
};

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

function jsonResponse(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('auth API client', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  it('registers through the same-origin API with cookies included', async () => {
    fetchMock.mockResolvedValue(jsonResponse(currentUser, 201));

    await expect(
      register({
        email: 'traveler@example.com',
        password: 'password123',
        nickname: '제주여행자',
        termsAgreed: true,
      }),
    ).resolves.toEqual(currentUser);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/register',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
  });

  it('preserves a stable backend problem code', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          type: 'about:blank',
          title: 'Unauthorized',
          status: 401,
          code: 'INVALID_CREDENTIALS',
          detail: '이메일 또는 비밀번호가 올바르지 않습니다.',
          requestId: 'req-1',
        },
        401,
      ),
    );

    await expect(
      login({ email: 'wrong@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      status: 401,
      requestId: 'req-1',
    });
  });

  it('logs out with credentials and accepts an empty 204 response', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204 } as Response);

    await expect(logout()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/logout',
      expect.objectContaining({ credentials: 'include', method: 'POST' }),
    );
  });
});

describe('current-user contract', () => {
  it('rejects inconsistent admin flags and private or malformed shapes', () => {
    expect(() =>
      parseCurrentUser({ ...currentUser, role: 'ADMIN', isAdmin: false }),
    ).toThrow('인증 응답 값이 올바르지 않습니다.');
    expect(() =>
      parseCurrentUser({ ...currentUser, createdAt: 'today' }),
    ).toThrow('인증 응답 값이 올바르지 않습니다.');
  });
});
