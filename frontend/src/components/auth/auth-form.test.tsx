import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthForm } from './auth-form';

const replaceMock = jest.fn();
const refreshMock = jest.fn();
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

const currentUser = {
  id: 'user-1',
  email: 'traveler@example.com',
  nickname: '제주여행자',
  role: 'USER',
  isAdmin: false,
  createdAt: '2026-07-30T12:00:00.000Z',
  verificationSummary: { traveler: null, local: null },
};

function response(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('AuthForm', () => {
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

  it('validates registration fields before making a request', () => {
    render(<AuthForm mode="register" />);

    fireEvent.click(screen.getByRole('button', { name: '계정 만들기' }));

    expect(
      screen.getByText('이메일 형식을 확인해 주세요.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('영문과 숫자를 포함해 10~72자로 입력해 주세요.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('서비스 이용을 위해 필수 약관에 동의해 주세요.'),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits normalized registration data and enters the app', async () => {
    fetchMock.mockResolvedValue(response(currentUser, 201));
    render(<AuthForm mode="register" />);

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: ' Traveler@Example.com ' },
    });
    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: ' 제주여행자 ' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: '계정 만들기' }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/app'));
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/register',
      expect.objectContaining({
        body: JSON.stringify({
          email: 'traveler@example.com',
          password: 'password123',
          nickname: '제주여행자',
          termsAgreed: true,
        }),
        credentials: 'include',
      }),
    );
  });

  it('shows a recoverable duplicate nickname message from Problem Details', async () => {
    fetchMock.mockResolvedValue(
      response(
        {
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          code: 'NICKNAME_ALREADY_EXISTS',
          detail: '이미 사용 중인 닉네임입니다.',
          requestId: 'req-duplicate',
        },
        409,
      ),
    );
    render(<AuthForm mode="register" />);

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'traveler@example.com' },
    });
    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '제주여행자' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: '계정 만들기' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.',
    );
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
