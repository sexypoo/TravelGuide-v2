import { fireEvent, render, screen } from '@testing-library/react';
import { ApiConnectionStatus } from './api-connection-status';

const liveResponse = {
  ok: true,
  status: 200,
  json: async () => ({
    status: 'ok',
    timestamp: '2026-07-30T12:00:00.000Z',
  }),
} as Response;

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

describe('ApiConnectionStatus', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  it('shows loading and then the connected backend state', async () => {
    fetchMock.mockResolvedValue(liveResponse);

    render(<ApiConnectionStatus />);

    expect(screen.getByText('서비스 연결 확인 중')).toBeInTheDocument();
    expect(await screen.findByText('서비스 정상 연결')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/health/live',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('offers a retry and recovers after a failed request', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(liveResponse);

    render(<ApiConnectionStatus />);

    const retry = await screen.findByRole('button', { name: '다시 확인' });
    fireEvent.click(retry);

    expect(await screen.findByText('서비스 정상 연결')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
