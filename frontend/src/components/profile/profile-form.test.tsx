import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { parseOwnProfile } from '@/lib/api/profile';
import { profilePayload } from '@/test/fixtures';
import { ProfileForm } from './profile-form';

const refreshMock = jest.fn();
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

function response(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('ProfileForm', () => {
  beforeEach(() => {
    refreshMock.mockReset();
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  it('trims, saves, confirms, and refreshes the server shell', async () => {
    fetchMock.mockResolvedValue(
      response(
        { ...profilePayload, nickname: '새닉네임', bio: '새로운 소개' },
        200,
      ),
    );
    render(<ProfileForm profile={parseOwnProfile(profilePayload)} />);

    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: ' 새닉네임 ' },
    });
    fireEvent.change(screen.getByLabelText('짧은 소개'), {
      target: { value: ' 새로운 소개 ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '변경 내용 저장' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      '프로필을 저장했습니다.',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/users/me',
      expect.objectContaining({
        body: JSON.stringify({ nickname: '새닉네임', bio: '새로운 소개' }),
      }),
    );
    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));
  });

  it('shows a useful nickname conflict without navigating away', async () => {
    fetchMock.mockResolvedValue(
      response(
        {
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          code: 'NICKNAME_ALREADY_EXISTS',
          detail: '이미 사용 중인 닉네임입니다.',
          requestId: 'req-conflict',
        },
        409,
      ),
    );
    render(<ProfileForm profile={parseOwnProfile(profilePayload)} />);

    fireEvent.click(screen.getByRole('button', { name: '변경 내용 저장' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.',
    );
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
