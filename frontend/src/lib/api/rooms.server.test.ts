import { getRoom } from './rooms.server';
import { fetchProtectedApi } from './protected-server';
import { lockedRoomPayload } from '@/test/fixtures';

jest.mock('server-only', () => ({}));
jest.mock('./protected-server', () => ({
  fetchProtectedApi: jest.fn(),
}));

const protectedFetchMock = jest.mocked(fetchProtectedApi);

describe('locked room server loader', () => {
  beforeEach(() => protectedFetchMock.mockReset());

  it('requests metadata only and never calls the content boundary', async () => {
    protectedFetchMock.mockResolvedValue({
      json: async () => lockedRoomPayload,
    } as Response);

    await expect(getRoom('jeju')).resolves.toMatchObject({
      slug: 'jeju',
      access: { canViewContent: false },
    });
    expect(protectedFetchMock).toHaveBeenCalledWith(
      '/api/v1/rooms/jeju',
      '/app/rooms/jeju',
    );
    expect(
      protectedFetchMock.mock.calls.some(([path]) =>
        path.includes('content-access'),
      ),
    ).toBe(false);
  });
});
