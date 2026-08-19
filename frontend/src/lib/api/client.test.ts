import { ApiProblem } from './problem-details';
import { requestBlob, requestForm, requestJson, requestVoid } from './client';

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('browser API client', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  it('applies credentialed JSON defaults without a content type for reads', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await expect(requestJson('/api/v1/example')).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/example', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  });

  it('adds JSON content type for bodies and preserves caller headers', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await requestJson('/api/v1/example', {
      method: 'POST',
      body: JSON.stringify({ value: true }),
      headers: { 'Idempotency-Key': 'request-1' },
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/example', {
      method: 'POST',
      body: JSON.stringify({ value: true }),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Idempotency-Key': 'request-1',
      },
    });
  });

  it('keeps multipart boundaries under browser control', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const body = new FormData();
    body.set('name', '제주');

    await requestForm('/api/v1/upload', body, { method: 'POST' });

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/upload', {
      method: 'POST',
      body,
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  });

  it('parses blobs and supports successful empty responses', async () => {
    const blob = new Blob(['image'], { type: 'image/png' });
    fetchMock
      .mockResolvedValueOnce({ ok: true, blob: async () => blob } as Response)
      .mockResolvedValueOnce({ ok: true, status: 204 } as Response);

    await expect(requestBlob('/api/v1/image')).resolves.toEqual(blob);
    await expect(
      requestVoid('/api/v1/session', { method: 'DELETE' }),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('converts failed responses to ApiProblem', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          type: 'about:blank',
          title: 'Forbidden',
          status: 403,
          code: 'ROOM_ACCESS_DENIED',
          detail: '인증이 필요합니다.',
          requestId: 'req_1',
        },
        403,
      ),
    );

    await expect(requestJson('/api/v1/room')).rejects.toBeInstanceOf(
      ApiProblem,
    );
  });
});
