import { registerPreorder } from './preorders';

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

function response(body: unknown, status = 201): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('preorders API', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });
  });

  it('posts the public registration and accepts only the generic response', async () => {
    const input = {
      name: '제주 여행자',
      email: 'traveler@example.com',
      privacyConsent: true as const,
    };
    fetchMock.mockResolvedValue(response({ status: 'registered' }));

    await expect(registerPreorder(input)).resolves.toEqual({
      status: 'registered',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/preorders',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(input) }),
    );
  });

  it('discards unexpected applicant data from the public response', async () => {
    fetchMock.mockResolvedValue(
      response({ status: 'registered', email: 'private@example.com' }),
    );

    await expect(
      registerPreorder({
        name: '신청자',
        email: 'private@example.com',
        privacyConsent: true,
      }),
    ).resolves.toEqual({ status: 'registered' });
  });
});
