import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AccountDeletionPanel } from './account-deletion-panel';

const replaceMock = jest.fn();
const refreshMock = jest.fn();
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
}));

function response(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('AccountDeletionPanel', () => {
  beforeEach(() => {
    replaceMock.mockReset();
    refreshMock.mockReset();
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  it('requires password and exact phrase before permanently deleting', async () => {
    fetchMock.mockResolvedValue(response(null, 204));
    render(<AccountDeletionPanel hasPassword />);

    fireEvent.click(screen.getByRole('button', { name: '계정 삭제 살펴보기' }));
    const submit = screen.getByRole('button', { name: '계정 영구 삭제' });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText('현재 비밀번호'), {
      target: { value: 'password123' },
    });
    fireEvent.change(
      screen.getByLabelText(/확인을 위해 계정 삭제를 입력해 주세요/),
      { target: { value: '계정 삭제' } },
    );
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith(
        '/account-deletion?deleted=true',
      ),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/account',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({
          confirmation: '계정 삭제',
          password: 'password123',
        }),
      }),
    );
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('allows social-only confirmation and surfaces reauthentication errors', async () => {
    fetchMock.mockResolvedValueOnce(response(null, 204));
    const { unmount } = render(<AccountDeletionPanel hasPassword={false} />);
    fireEvent.click(screen.getByRole('button', { name: '계정 삭제 살펴보기' }));
    expect(screen.queryByLabelText('현재 비밀번호')).not.toBeInTheDocument();
    fireEvent.change(
      screen.getByLabelText(/확인을 위해 계정 삭제를 입력해 주세요/),
      { target: { value: '계정 삭제' } },
    );
    fireEvent.click(screen.getByRole('button', { name: '계정 영구 삭제' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({ confirmation: '계정 삭제' }),
    );
    unmount();

    replaceMock.mockReset();
    refreshMock.mockReset();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
      response(
        {
          type: 'about:blank',
          title: 'Unauthorized',
          status: 401,
          code: 'ACCOUNT_DELETION_REAUTH_FAILED',
          detail: '현재 비밀번호를 확인해 주세요.',
          requestId: 'req-delete',
        },
        401,
      ),
    );
    render(<AccountDeletionPanel hasPassword />);
    fireEvent.click(screen.getByRole('button', { name: '계정 삭제 살펴보기' }));
    fireEvent.change(screen.getByLabelText('현재 비밀번호'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.change(
      screen.getByLabelText(/확인을 위해 계정 삭제를 입력해 주세요/),
      { target: { value: '계정 삭제' } },
    );
    fireEvent.click(screen.getByRole('button', { name: '계정 영구 삭제' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '현재 비밀번호가 맞지 않습니다.',
    );
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
