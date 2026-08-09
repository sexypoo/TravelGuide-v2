import { ProblemException } from '../common/http/problem.exception';
import { PlacesService } from './places.service';

const googlePlace = {
  id: 'google-place-1',
  displayName: { text: '동백식당' },
  formattedAddress: '제주시 바다로 1',
  location: { latitude: 33.5, longitude: 126.5 },
  googleMapsUri: 'https://maps.google.com/?cid=1',
  primaryTypeDisplayName: { text: '한식당' },
  businessStatus: 'OPERATIONAL',
  currentOpeningHours: { openNow: true },
};

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('PlacesService', () => {
  const fetchMock = jest.fn<
    ReturnType<typeof fetch>,
    Parameters<typeof fetch>
  >();

  beforeEach(() => {
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  it('limits text search fields and maps public place data', async () => {
    fetchMock.mockResolvedValue(response({ places: [googlePlace] }));
    const service = new PlacesService({ get: () => 'server-key' } as never);

    await expect(
      service.search({ q: '동백식당', latitude: 33.5, longitude: 126.5 }),
    ).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: 'google-place-1',
          name: '동백식당',
          openNow: true,
        }),
      ],
    });
    const [url, request] = fetchMock.mock.calls[0] ?? [];
    expect(url).toContain('places:searchText');
    expect(request?.headers).toEqual(
      expect.objectContaining({ 'X-Goog-Api-Key': 'server-key' }),
    );
    const headers = request?.headers as Record<string, string>;
    expect(headers['X-Goog-FieldMask']).not.toContain('currentOpeningHours');
  });

  it('requests opening hours only for nearby and filters closed places', async () => {
    fetchMock.mockResolvedValue(
      response({
        places: [
          googlePlace,
          {
            ...googlePlace,
            id: 'closed-place',
            currentOpeningHours: { openNow: false },
          },
        ],
      }),
    );
    const service = new PlacesService({ get: () => 'server-key' } as never);

    await expect(
      service.nearbyRestaurants({
        latitude: 33.5,
        longitude: 126.5,
        radius: 1500,
        openNow: true,
      }),
    ).resolves.toMatchObject({ items: [{ id: 'google-place-1' }] });
    const [url, request] = fetchMock.mock.calls[0] ?? [];
    expect(url).toContain('places:searchNearby');
    const headers = request?.headers as Record<string, string>;
    expect(headers['X-Goog-FieldMask']).toContain('currentOpeningHours');
  });

  it('fails clearly when configuration or a coordinate pair is missing', async () => {
    const unconfigured = new PlacesService({ get: () => undefined } as never);
    await expect(unconfigured.search({ q: '동백식당' })).rejects.toBeInstanceOf(
      ProblemException,
    );
    const configured = new PlacesService({ get: () => 'server-key' } as never);
    await expect(
      configured.search({ q: '동백식당', latitude: 33.5 }),
    ).rejects.toBeInstanceOf(ProblemException);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
