import {
  getPlaceFavorites,
  removePlaceFavorite,
  savePlaceFavorite,
} from './place-favorites';

const favorite = {
  id: 'favorite-1',
  sourceMessageId: 'message-1',
  name: '동백식당',
  address: '제주시 바다로 1',
  latitude: 33.5,
  longitude: 126.5,
  createdAt: '2026-08-08T00:00:00.000Z',
};
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('place favorites API', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  it('parses the list and sends explicit save and remove requests', async () => {
    fetchMock
      .mockResolvedValueOnce(response({ items: [favorite] }))
      .mockResolvedValueOnce(response(favorite, 201))
      .mockResolvedValueOnce(response({ saved: false }, 201));

    await expect(getPlaceFavorites()).resolves.toEqual([favorite]);
    await expect(savePlaceFavorite('message-1')).resolves.toEqual(favorite);
    await expect(removePlaceFavorite('favorite-1')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/place-favorites',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ messageId: 'message-1' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/v1/place-favorites/favorite-1/remove',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('rejects malformed coordinates instead of accepting unsafe data', async () => {
    fetchMock.mockResolvedValue(
      response({ items: [{ ...favorite, latitude: '33.5' }] }),
    );

    await expect(getPlaceFavorites()).rejects.toThrow(
      '찜한 장소 응답 형식이 올바르지 않습니다.',
    );
  });
});
