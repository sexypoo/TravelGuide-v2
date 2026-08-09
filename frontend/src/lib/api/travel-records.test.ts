import {
  createTravelRecord,
  listTravelRecords,
  parseTravelRecord,
} from './travel-records';

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
const record = {
  id: 'record-1',
  title: '봄날의 제주',
  destination: '제주',
  startedOn: '2026-04-03',
  endedOn: '2026-04-06',
  note: '바닷길을 걸었다.',
  createdAt: '2026-04-07T00:00:00.000Z',
  updatedAt: '2026-04-07T00:00:00.000Z',
};

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('travel records API', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });
  });

  it('validates date-only record contracts', () => {
    expect(parseTravelRecord(record)).toEqual(record);
    expect(() =>
      parseTravelRecord({ ...record, startedOn: 'not-a-date' }),
    ).toThrow('여행 기록 응답 형식이 올바르지 않습니다.');
  });

  it('lists only parsed records through an authenticated relative request', async () => {
    fetchMock.mockResolvedValue(response({ items: [record] }));
    await expect(listTravelRecords()).resolves.toEqual([record]);
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/travel-records', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  });

  it('creates a real owner record', async () => {
    const input = {
      title: record.title,
      destination: record.destination,
      startedOn: record.startedOn,
      endedOn: record.endedOn,
      note: record.note,
    };
    fetchMock.mockResolvedValue(response(record, 201));
    await expect(createTravelRecord(input)).resolves.toEqual(record);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/travel-records',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(input) }),
    );
  });
});
