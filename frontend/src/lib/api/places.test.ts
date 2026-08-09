import { getNearbyOpenRestaurants, searchPlaces } from './places';

const place = {
  id: 'ChIJ-google-place',
  name: '동백식당',
  address: '제주시 바다로 1',
  latitude: 33.5,
  longitude: 126.5,
  googleMapsUri: 'https://maps.google.com/?cid=1',
  category: '한식당',
  businessStatus: 'OPERATIONAL',
  openNow: true,
};
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('Google places API', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  it('encodes text search and nearby-open restaurant parameters', async () => {
    fetchMock
      .mockResolvedValueOnce(response({ items: [place] }))
      .mockResolvedValueOnce(response({ items: [place] }));

    await expect(
      searchPlaces('제주 카페', { latitude: 33.5, longitude: 126.5 }),
    ).resolves.toEqual([place]);
    await expect(
      getNearbyOpenRestaurants({ latitude: 33.5, longitude: 126.5 }),
    ).resolves.toEqual([place]);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      '/api/v1/places/search?q=%EC%A0%9C%EC%A3%BC+%EC%B9%B4%ED%8E%98&latitude=33.5&longitude=126.5',
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      '/api/v1/places/nearby-restaurants?latitude=33.5&longitude=126.5&radius=1500&openNow=true',
    );
  });

  it('rejects malformed provider data at the browser boundary', async () => {
    fetchMock.mockResolvedValue(
      response({ items: [{ ...place, openNow: 'yes' }] }),
    );

    await expect(searchPlaces('동백식당')).rejects.toThrow(
      '장소 검색 응답 형식이 올바르지 않습니다.',
    );
  });
});
